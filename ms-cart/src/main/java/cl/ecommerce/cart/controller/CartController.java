package cl.ecommerce.cart.controller;

import cl.ecommerce.cart.dto.CartItemRequest;
import cl.ecommerce.cart.dto.CartResponse;
import cl.ecommerce.cart.service.CartService;
import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@PathVariable String userId) {
        SecurityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok(cartService.getCart(userId)));
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @PathVariable String userId,
            @RequestBody CartItemRequest request) {
        SecurityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok(cartService.addToCart(userId, request), "Producto agregado al carrito"));
    }

    @PostMapping("/{userId}/merge")
    public ResponseEntity<ApiResponse<CartResponse>> merge(
            @PathVariable String userId,
            @RequestBody List<CartItemRequest> items) {
        SecurityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok(cartService.merge(userId, items), "Carrito fusionado"));
    }

    @PutMapping("/{userId}/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
            @PathVariable String userId,
            @PathVariable String productId,
            @RequestParam int quantity) {
        SecurityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok(cartService.updateQuantity(userId, productId, quantity)));
    }

    @DeleteMapping("/{userId}/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @PathVariable String userId,
            @PathVariable String productId) {
        SecurityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok(cartService.removeFromCart(userId, productId)));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> clearCart(@PathVariable String userId) {
        SecurityUtils.requireSelfOrAdmin(userId);
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.<Void>ok(null, "Carrito vaciado"));
    }
}
