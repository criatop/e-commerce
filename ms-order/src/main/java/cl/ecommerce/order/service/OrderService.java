package cl.ecommerce.order.service;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.exception.BusinessException;
import cl.ecommerce.common.exception.NotFoundException;
import cl.ecommerce.common.security.SecurityUtils;
import cl.ecommerce.order.client.ProductClient;
import cl.ecommerce.order.dto.CreateOrderRequest;
import cl.ecommerce.order.dto.OrderResponse;
import cl.ecommerce.order.dto.OrderStatsResponse;
import cl.ecommerce.order.model.Order;
import cl.ecommerce.order.model.OrderItem;
import cl.ecommerce.order.model.OrderStatus;
import cl.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
