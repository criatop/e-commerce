package cl.ecommerce.cart.service;

import cl.ecommerce.cart.client.ProductClient;
import cl.ecommerce.cart.dto.CartItemRequest;
import cl.ecommerce.cart.dto.CartResponse;
import cl.ecommerce.cart.model.Cart;
import cl.ecommerce.cart.model.CartItem;
import cl.ecommerce.cart.repository.CartRepository;
import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.exception.BusinessException;
import cl.ecommerce.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductClient productClient;

    @Transactional(readOnly = true)
    public CartResponse getCart(String userId) {
        Cart cart = getOrCreateCart(userId);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(String userId, CartItemRequest request) {
        if (request.quantity() < 1) {
            throw new BusinessException("La cantidad debe ser al menos 1");
        }

        Cart cart = getOrCreateCart(userId);

        ApiResponse<Map<String, Object>> productResponse = productClient.getProduct(request.productId());
        if (productResponse == null || productResponse.getDatos() == null) {
            throw new NotFoundException("Producto no encontrado: " + request.productId());
        }

        Map<String, Object> product = productResponse.getDatos();
        Boolean active = (Boolean) product.get("active");
        if (active != null && !active) {
            throw new BusinessException("El producto no esta activo");
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.productId()))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + request.quantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productId(request.productId())
                    .productName((String) product.get("name"))
                    .price(((Number) product.get("price")).doubleValue())
                    .quantity(request.quantity())
                    .build();
            cart.getItems().add(newItem);
        }

        Cart saved = cartRepository.save(cart);
        return toResponse(saved);
    }

    @Transactional
    public CartResponse updateQuantity(String userId, String productId, int quantity) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Producto no encontrado en el carrito"));

        if (quantity < 1) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }

        Cart saved = cartRepository.save(cart);
        return toResponse(saved);
    }

    @Transactional
    public CartResponse removeFromCart(String userId, String productId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Producto no encontrado en el carrito"));

        cart.getItems().remove(item);
        Cart saved = cartRepository.save(cart);
        return toResponse(saved);
    }

    @Transactional
    public void clearCart(String userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(
                        Cart.builder()
                                .userId(userId)
                                .items(new ArrayList<>())
                                .build()
                ));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartResponse.CartItemResponse> items = cart.getItems().stream()
                .map(this::toItemResponse)
                .toList();

        double total = items.stream()
                .mapToDouble(CartResponse.CartItemResponse::getSubtotal)
                .sum();

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .items(items)
                .totalAmount(total)
                .build();
    }

    private CartResponse.CartItemResponse toItemResponse(CartItem item) {
        return CartResponse.CartItemResponse.builder()
                .productId(item.getProductId())
                .productName(item.getProductName())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getPrice() * item.getQuantity())
                .build();
    }
}
