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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

    @Transactional
    public CartResponse merge(String userId, List<CartItemRequest> incoming) {
        Cart cart = getOrCreateCart(userId);
        if (incoming == null || incoming.isEmpty()) {
            return toResponse(cartRepository.save(cart));
        }

        List<String> ids = incoming.stream()
                .map(CartItemRequest::productId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();
        if (ids.isEmpty()) {
            return toResponse(cartRepository.save(cart));
        }

        Map<String, Map<String, Object>> foundById = fetchFoundProducts(ids);

        for (CartItemRequest req : incoming) {
            if (req.productId() == null || req.quantity() < 1) {
                continue;
            }
            Map<String, Object> product = foundById.get(req.productId());
            if (product == null) {
                continue;
            }
            int available = asInt(product.get("available"));
            if (available < 1) {
                continue;
            }
            CartItem existing = cart.getItems().stream()
                    .filter(i -> i.getProductId().equals(req.productId()))
                    .findFirst()
                    .orElse(null);
            int currentQty = existing != null ? existing.getQuantity() : 0;
            int mergedQty = Math.min(currentQty + req.quantity(), available);
            if (mergedQty < 1) {
                continue;
            }
            String name = Objects.toString(product.get("name"), existing != null ? existing.getProductName() : null);
            double price = asDouble(product.get("price"), existing != null ? existing.getPrice() : 0.0);
            if (existing != null) {
                existing.setQuantity(mergedQty);
                existing.setProductName(name);
                existing.setPrice(price);
            } else {
                cart.getItems().add(CartItem.builder()
                        .cart(cart)
                        .productId(req.productId())
                        .productName(name)
                        .price(price)
                        .quantity(mergedQty)
                        .build());
            }
        }

        return toResponse(cartRepository.save(cart));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Map<String, Object>> fetchFoundProducts(List<String> ids) {
        try {
            ApiResponse<Map<String, Object>> response = productClient.getBatch(Map.of("ids", ids));
            if (response == null || response.getDatos() == null) {
                return Map.of();
            }
            Object foundObj = response.getDatos().get("found");
            if (!(foundObj instanceof List<?> foundList)) {
                return Map.of();
            }
            Map<String, Map<String, Object>> byId = new HashMap<>();
            for (Object item : foundList) {
                if (item instanceof Map<?, ?> raw) {
                    Map<String, Object> p = new HashMap<>();
                    raw.forEach((k, v) -> p.put(String.valueOf(k), v));
                    Object id = p.get("id");
                    if (id != null) {
                        byId.put(String.valueOf(id), p);
                    }
                }
            }
            return byId;
        } catch (Exception e) {
            return Map.of();
        }
    }

    private int asInt(Object value) {
        if (value instanceof Number n) return n.intValue();
        if (value instanceof String s && !s.isBlank()) {
            try { return Integer.parseInt(s); } catch (NumberFormatException ignored) {}
        }
        return 0;
    }

    private double asDouble(Object value, double fallback) {
        if (value instanceof Number n) return n.doubleValue();
        if (value instanceof String s && !s.isBlank()) {
            try { return Double.parseDouble(s); } catch (NumberFormatException ignored) {}
        }
        return fallback;
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
