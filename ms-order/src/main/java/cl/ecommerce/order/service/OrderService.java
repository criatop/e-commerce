package cl.ecommerce.order.service;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.exception.BusinessException;
import cl.ecommerce.common.exception.NotFoundException;
import cl.ecommerce.common.security.SecurityUtils;
import cl.ecommerce.order.client.PaymentClient;
import cl.ecommerce.order.client.ProductClient;
import cl.ecommerce.order.client.ShippingClient;
import cl.ecommerce.order.dto.*;
import cl.ecommerce.order.model.Order;
import cl.ecommerce.order.model.OrderItem;
import cl.ecommerce.order.model.OrderStatus;
import cl.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final FolioGenerator folioGenerator;
    private final PaymentClient paymentClient;
    private final ShippingClient shippingClient;

    public String nextFolio(LocalDate date) {
        return folioGenerator.nextFolio(date);
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        List<OrderItem> orderItems = request.items().stream()
                .map(itemRequest -> {
                    ApiResponse<Map<String, Object>> productResponse = productClient.getProduct(itemRequest.productId());
                    if (productResponse == null || productResponse.getDatos() == null) {
                        throw new NotFoundException("Producto no encontrado: " + itemRequest.productId());
                    }
                    Map<String, Object> product = productResponse.getDatos();
                    double price = ((Number) product.get("price")).doubleValue();
                    UUID productId = UUID.fromString(itemRequest.productId());
                    return OrderItem.builder()
                            .productId(productId)
                            .sku(product.get("sku") == null ? null : product.get("sku").toString())
                            .productName((String) product.get("name"))
                            .unitPrice(price)
                            .quantity(itemRequest.quantity())
                            .lineTotal(price * itemRequest.quantity())
                            .build();
                })
                .toList();

        double totalAmount = orderItems.stream().mapToDouble(OrderItem::getLineTotal).sum();

        Order order = Order.builder()
                .folio(nextFolio(LocalDate.now()))
                .userId(request.userId())
                .status(OrderStatus.PENDING)
                .shippingAddress(request.shippingAddress())
                .subtotalAmount(totalAmount)
                .shippingAmount(0)
                .totalAmount(totalAmount)
                .items(new ArrayList<>(orderItems))
                .build();

        order.getItems().forEach(item -> item.setOrder(order));
        Order savedOrder = orderRepository.save(order);
        return toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse checkout(CheckoutRequest request, String userId, String email, String nombreCompleto) {
        SecurityUtils.requireSelfOrAdmin(userId);
        List<CheckoutRequest.ItemRequest> reqItems = request.items();
        if (reqItems == null || reqItems.isEmpty()) throw new BusinessException("El checkout requiere items");

        List<String> ids = reqItems.stream().map(i -> i.productId().toString()).toList();
        ApiResponse<Map<String, Object>> batchResp = productClient.batch(Map.of("ids", ids));
        Map<String, Object> datos = batchResp != null ? batchResp.getDatos() : null;
        if (datos == null) throw new BusinessException("No se pudo validar el catalogo");
        List<Map<String, Object>> found = asListOfMaps(datos.get("found"));
        Map<UUID, Map<String, Object>> byId = new HashMap<>();
        for (Map<String, Object> p : found) byId.put(UUID.fromString(String.valueOf(p.get("id"))), p);

        List<OrderItem> orderItems = new ArrayList<>();
        List<StockItemRequest> stockItems = new ArrayList<>();
        double subtotal = 0;
        for (CheckoutRequest.ItemRequest req : reqItems) {
            if (req.quantity() <= 0) throw new BusinessException("Cantidad invalida para producto " + req.productId());
            Map<String, Object> p = byId.get(req.productId());
            if (p == null || !Boolean.TRUE.equals(p.get("active")))
                throw new NotFoundException("Producto no disponible: " + req.productId());
            int available = asInt(p.get("available"));
            if (req.quantity() > available)
                throw new BusinessException("Stock insuficiente para producto " + req.productId());
            double unitPrice = asDouble(p.get("price"));
            double lineTotal = unitPrice * req.quantity();
            subtotal += lineTotal;
            orderItems.add(OrderItem.builder()
                    .productId(req.productId())
                    .sku(p.get("sku") == null ? null : String.valueOf(p.get("sku")))
                    .productName(String.valueOf(p.get("name")))
                    .unitPrice(unitPrice)
                    .quantity(req.quantity())
                    .lineTotal(lineTotal)
                    .build());
            stockItems.add(new StockItemRequest(req.productId(), req.quantity()));
        }

        double shippingAmount = 0;
        double total = subtotal + shippingAmount;

        Order order = Order.builder()
                .folio(nextFolio(LocalDate.now()))
                .userId(userId)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.shippingAddress())
                .shippingCity(request.shippingComuna())
                .shippingPostal(request.shippingRegion())
                .recipientName(nombreCompleto)
                .recipientEmail(email)
                .recipientPhone(request.shippingPhone())
                .subtotalAmount(subtotal)
                .shippingAmount(shippingAmount)
                .totalAmount(total)
                .items(new ArrayList<>(orderItems))
                .build();
        Order orderRef = order;
        orderRef.getItems().forEach(i -> i.setOrder(orderRef));
        order = orderRepository.save(orderRef);

        try {
            productClient.reserveStock(stockItems);
        } catch (Exception e) {
            log.error("Fallo reserva stock orden {}: {}", order.getId(), e.getMessage());
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            throw new BusinessException("No se pudo reservar stock: " + e.getMessage());
        }

        try {
            paymentClient.create(new PaymentRequest(order.getId().toString(), userId, total, request.paymentMethod()));
        } catch (Exception e) {
            log.error("Fallo pago orden {}: {}", order.getId(), e.getMessage());
            safeRelease(stockItems);
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "Pago rechazado");
        }

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        try {
            shippingClient.create(new ShipmentRequest(order.getId().toString(), userId,
                    request.shippingAddress(), request.shippingComuna(), request.shippingRegion(),
                    request.shippingRegion(), request.shippingComuna()));
        } catch (Exception e) {
            log.error("Fallo envio orden {}: {}", order.getId(), e.getMessage());
            safeRefund(order);
            safeRelease(stockItems);
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No se pudo crear envio");
        }

        try {
            productClient.confirmStock(stockItems);
        } catch (Exception e) {
            log.error("Fallo confirmacion stock orden {}: {}", order.getId(), e.getMessage());
            safeRefund(order);
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No se pudo confirmar stock");
        }

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        return toResponse(order);
    }

    private void safeRelease(List<StockItemRequest> items) {
        try { productClient.releaseStock(items); } catch (Exception ex) { log.error("Compensacion release fallo: {}", ex.getMessage()); }
    }

    private void safeRefund(Order order) {
        try {
            // best-effort refund signal via payment service is out of scope here; mark for reconciliation
            log.warn("Reembolso requerido para orden {}", order.getId());
        } catch (Exception ex) { log.error("Compensacion refund fallo: {}", ex.getMessage()); }
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Orden no encontrada: " + id));
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(String userId) {
        return orderRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public OrderResponse cancelOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Orden no encontrada: " + id));
        SecurityUtils.requireSelfOrAdmin(order.getUserId());
        if (order.getStatus() == OrderStatus.CANCELLED) throw new BusinessException("La orden ya esta cancelada");
        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED)
            throw new BusinessException("No se puede cancelar una orden que ya fue enviada o entregada");
        List<StockItemRequest> stockItems = order.getItems().stream()
                .map(i -> new StockItemRequest(i.getProductId(), i.getQuantity())).toList();
        if (order.getStatus() == OrderStatus.CONFIRMED || order.getStatus() == OrderStatus.PAID) {
            safeRefund(order);
            safeRelease(stockItems);
        } else if (order.getStatus() == OrderStatus.PENDING) {
            // no stock reserved by checkout in this path unless partial; safe no-op
        }
        order.setStatus(OrderStatus.CANCELLED);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateStatus(UUID id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Orden no encontrada: " + id));
        validateStatusTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public OrderStatsResponse getStats() {
        List<Order> orders = orderRepository.findAll();
        List<Order> notCancelled = orders.stream().filter(o -> o.getStatus() != OrderStatus.CANCELLED).toList();
        double totalSales = notCancelled.stream().mapToDouble(Order::getTotalAmount).sum();
        long totalOrders = notCancelled.size();
        double averageTicket = totalOrders == 0 ? 0 : totalSales / totalOrders;
        Map<String, Long> byStatus = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getStatus().name(), Collectors.counting()));

        Map<UUID, OrderStatsResponse.TopProduct> top = new HashMap<>();
        for (Order o : notCancelled) {
            for (OrderItem item : o.getItems()) {
                top.merge(item.getProductId(),
                        new OrderStatsResponse.TopProduct(item.getProductId(), item.getProductName(), item.getQuantity(), item.getLineTotal()),
                        (a, b) -> new OrderStatsResponse.TopProduct(a.productId(), a.productName(), a.quantity() + b.quantity(), a.amount() + b.amount()));
            }
        }
        List<OrderStatsResponse.TopProduct> topProducts = top.values().stream()
                .sorted(Comparator.comparingLong(OrderStatsResponse.TopProduct::quantity).reversed())
                .limit(5)
                .toList();
        return new OrderStatsResponse(totalSales, totalOrders, averageTicket, byStatus, topProducts);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == OrderStatus.CONFIRMED || next == OrderStatus.PAID || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.PAID || next == OrderStatus.CANCELLED;
            case PAID -> next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED;
            case SHIPPED -> next == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
        if (!valid) throw new BusinessException("Transicion de estado no valida: " + current + " -> " + next);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> asListOfMaps(Object raw) {
        if (!(raw instanceof List<?> list)) return List.of();
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object o : list) if (o instanceof Map<?, ?> m) out.add((Map<String, Object>) m);
        return out;
    }

    private int asInt(Object o) { return o instanceof Number n ? n.intValue() : Integer.parseInt(String.valueOf(o)); }
    private double asDouble(Object o) { return o instanceof Number n ? n.doubleValue() : Double.parseDouble(String.valueOf(o)); }

    private OrderResponse toResponse(Order order) {
        List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .sku(item.getSku())
                        .productName(item.getProductName())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .lineTotal(item.getLineTotal())
                        .build())
                .toList();
        return OrderResponse.builder()
                .id(order.getId())
                .folio(order.getFolio())
                .userId(order.getUserId())
                .status(order.getStatus())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .subtotalAmount(order.getSubtotalAmount())
                .shippingAmount(order.getShippingAmount())
                .shippingAddress(order.getShippingAddress())
                .shippingCity(order.getShippingCity())
                .shippingPostal(order.getShippingPostal())
                .recipientName(order.getRecipientName())
                .recipientEmail(order.getRecipientEmail())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
