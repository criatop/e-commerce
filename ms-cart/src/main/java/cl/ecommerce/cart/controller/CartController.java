package cl.ecommerce.cart.controller;

import cl.ecommerce.cart.dto.CartItemRequest;
import cl.ecommerce.cart.dto.CartResponse;
import cl.ecommerce.cart.service.CartService;
import cl.ecommerce.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.getCart(userId)));
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @PathVariable String userId,
            @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.addToCart(userId, request), "Producto agregado al carrito"));
    }

    @PutMapping("/{userId}/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
            @PathVariable String userId,
            @PathVariable String productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.updateQuantity(userId, productId, quantity)));
    }

    @DeleteMapping("/{userId}/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @PathVariable String userId,
            @PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.removeFromCart(userId, productId)));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Carrito vaciado"));
    }
}
