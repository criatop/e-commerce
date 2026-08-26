package cl.ecommerce.order.service;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.event.OrderCancelledEvent;
import cl.ecommerce.common.event.OrderCreatedEvent;
import cl.ecommerce.common.exception.BusinessException;
import cl.ecommerce.common.exception.NotFoundException;
import cl.ecommerce.order.client.InventoryClient;
import cl.ecommerce.order.client.ProductClient;
import cl.ecommerce.order.dto.CreateOrderRequest;
import cl.ecommerce.order.dto.InventoryReservationRequest;
import cl.ecommerce.order.dto.OrderResponse;
import cl.ecommerce.order.model.Order;
import cl.ecommerce.order.model.OrderItem;
import cl.ecommerce.order.model.OrderStatus;
import cl.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        List<OrderItem> orderItems = request.items().stream()
                .map(itemRequest -> {
                    ApiResponse<Map<String, Object>> productResponse = productClient.getProduct(itemRequest.productId());
                    if (productResponse == null || productResponse.getDatos() == null) {
                        throw new NotFoundException("Producto no encontrado: " + itemRequest.productId());
                    }

                    Map<String, Object> product = productResponse.getDatos();
                    return OrderItem.builder()
                            .productId(itemRequest.productId())
                            .productName((String) product.get("name"))
                            .price(((Number) product.get("price")).doubleValue())
                            .quantity(itemRequest.quantity())
                            .build();
                })
                .toList();

        double totalAmount = orderItems.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        Order order = Order.builder()
                .userId(request.userId())
                .status(OrderStatus.PENDING)
                .shippingAddress(request.shippingAddress())
                .items(orderItems)
                .totalAmount(totalAmount)
                .build();

        order.getItems().forEach(item -> item.setOrder(order));
        Order savedOrder = orderRepository.save(order);

        InventoryReservationRequest reservationRequest = new InventoryReservationRequest(
                savedOrder.getId().toString(),
                request.items().stream()
                        .map(item -> {
                            ApiResponse<Map<String, Object>> productResp = productClient.getProduct(item.productId());
                            String sku = (String) productResp.getDatos().get("sku");
                            return new InventoryReservationRequest.Item(sku, item.quantity());
                        })
                        .toList()
        );

        try {
            inventoryClient.reserveStock(reservationRequest);
        } catch (Exception e) {
            log.error("Error al reservar stock para orden {}: {}", savedOrder.getId(), e.getMessage());
            throw new BusinessException("No se pudo reservar el stock para la orden");
        }

        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(savedOrder.getId().toString())
                .userId(savedOrder.getUserId())
                .totalAmount(savedOrder.getTotalAmount())
                .timestamp(LocalDateTime.now())
                .build();

        kafkaTemplate.send("order.created", event);
        log.info("Evento OrderCreated publicado para orden: {}", savedOrder.getId());

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
        return orderRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse cancelOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Orden no encontrada: " + id));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException("La orden ya esta cancelada");
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessException("No se puede cancelar una orden que ya fue enviada o entregada");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        InventoryReservationRequest releaseRequest = new InventoryReservationRequest(
                savedOrder.getId().toString(),
                savedOrder.getItems().stream()
                        .map(item -> {
                            ApiResponse<Map<String, Object>> productResp = productClient.getProduct(item.getProductId());
                            String sku = (String) productResp.getDatos().get("sku");
                            return new InventoryReservationRequest.Item(sku, item.getQuantity());
                        })
                        .toList()
        );

        try {
            inventoryClient.releaseStock(savedOrder.getId().toString(), releaseRequest);
        } catch (Exception e) {
            log.error("Error al liberar stock para orden {}: {}", savedOrder.getId(), e.getMessage());
        }

        OrderCancelledEvent event = OrderCancelledEvent.builder()
                .orderId(savedOrder.getId().toString())
                .userId(savedOrder.getUserId())
                .reason("Cancelada por el usuario")
                .timestamp(LocalDateTime.now())
                .build();

        kafkaTemplate.send("order.cancelled", event);
        log.info("Evento OrderCancelled publicado para orden: {}", savedOrder.getId());

        return toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse updateStatus(UUID id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Orden no encontrada: " + id));

        validateStatusTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        if (newStatus == OrderStatus.CONFIRMED) {
            try {
                inventoryClient.consumeStock(savedOrder.getId().toString());
            } catch (Exception e) {
                log.error("Error al consumir stock para orden {}: {}", savedOrder.getId(), e.getMessage());
            }
        }

        return toResponse(savedOrder);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == OrderStatus.CONFIRMED || next == OrderStatus.PAID || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.PAID || next == OrderStatus.CANCELLED;
            case PAID -> next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED;
            case SHIPPED -> next == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
        if (!valid) {
            throw new BusinessException("Transicion de estado no valida: " + current + " -> " + next);
        }
    }

    private OrderResponse toResponse(Order order) {
        List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getPrice() * item.getQuantity())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
