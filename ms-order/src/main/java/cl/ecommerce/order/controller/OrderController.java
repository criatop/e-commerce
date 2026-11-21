package cl.ecommerce.order.controller;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.SecurityUtils;
import cl.ecommerce.order.dto.CheckoutRequest;
import cl.ecommerce.order.dto.CreateOrderRequest;
import cl.ecommerce.order.dto.OrderResponse;
import cl.ecommerce.order.dto.OrderStatsResponse;
import cl.ecommerce.order.model.OrderStatus;
import cl.ecommerce.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        SecurityUtils.requireSelfOrAdmin(request.userId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(orderService.createOrder(request), "Orden creada exitosamente"));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @Valid @RequestBody CheckoutRequest request,
            Authentication authentication) {
        String userId = String.valueOf(SecurityUtils.currentUserId());
        String email = authentication != null ? authentication.getName() : null;
        String nombre = email;
        Object details = authentication != null ? authentication.getDetails() : null;
        if (details instanceof java.util.Map<?, ?> map) {
            Object n = map.get("name");
            if (n == null) n = map.get("nombreCompleto");
            if (n != null) nombre = String.valueOf(n);
            Object e = map.get("email");
            if (e != null) email = String.valueOf(e);
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(orderService.checkout(request, userId, email, nombre), "Checkout completado"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAllOrders()));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<ApiResponse<OrderStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getStats()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable UUID id) {
        OrderResponse order = orderService.getOrder(id);
        SecurityUtils.requireSelfOrAdmin(order.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByUser(@PathVariable String userId) {
        SecurityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrdersByUser(userId)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.cancelOrder(id), "Orden cancelada"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.updateStatus(id, status)));
    }
}
