package cl.ecommerce.order.controller;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.SecurityUtils;
import cl.ecommerce.order.dto.CreateOrderRequest;
import cl.ecommerce.order.dto.OrderResponse;
import cl.ecommerce.order.model.OrderStatus;
import cl.ecommerce.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(orderService.createOrder(request), "Orden creada exitosamente"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrder(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByUser(@PathVariable String userId) {
        SecurityUtils.requireSelfPrincipal(userId, "ordenes");
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrdersByUser(userId)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.cancelOrder(id), "Orden cancelada"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.updateStatus(id, status)));
    }
}
