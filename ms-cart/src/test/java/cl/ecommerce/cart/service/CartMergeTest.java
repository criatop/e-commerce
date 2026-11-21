package cl.ecommerce.cart.service;

import cl.ecommerce.cart.client.ProductClient;
import cl.ecommerce.cart.dto.CartItemRequest;
import cl.ecommerce.cart.dto.CartResponse;
import cl.ecommerce.cart.model.Cart;
import cl.ecommerce.cart.model.CartItem;
import cl.ecommerce.cart.repository.CartRepository;
import cl.ecommerce.common.dto.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartMergeTest {

    @Mock
    private CartRepository cartRepository;
    @Mock
    private ProductClient productClient;

    private CartService cartService;

    @BeforeEach
    void setUp() {
        cartService = new CartService(cartRepository, productClient);
    }

    @Test
    void fusionaSumandoCantidades() {
        String uid = "10";
        String productId = UUID.randomUUID().toString();
        Cart cart = Cart.builder().id(UUID.randomUUID()).userId(uid).items(new ArrayList<>()).build();
        cart.getItems().add(CartItem.builder().id(UUID.randomUUID()).cart(cart).productId(productId)
                .productName("P").price(1000).quantity(2).build());
        when(cartRepository.findByUserId(uid)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> p = new HashMap<>();
        p.put("id", productId);
        p.put("available", 10);
        p.put("active", true);
        p.put("price", 1000.0);
        p.put("name", "P");
        when(productClient.getBatch(any())).thenReturn(ApiResponse.ok(Map.of("found", List.of(p), "missing", List.of(), "inactive", List.of())));

        CartResponse response = cartService.merge(uid, List.of(new CartItemRequest(productId, 3)));

        assertThat(response.getItems()).hasSize(1);
        assertThat(response.getItems().get(0).getQuantity()).isEqualTo(5);
    }

    @Test
    void respetaElStockDisponible() {
        String uid = "10";
        String productId = UUID.randomUUID().toString();
        Cart cart = Cart.builder().id(UUID.randomUUID()).userId(uid).items(new ArrayList<>()).build();
        cart.getItems().add(CartItem.builder().id(UUID.randomUUID()).cart(cart).productId(productId)
                .productName("P").price(1000).quantity(2).build());
        when(cartRepository.findByUserId(uid)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> p = new HashMap<>();
        p.put("id", productId);
        p.put("available", 7);
        p.put("active", true);
        p.put("price", 1000.0);
        p.put("name", "P");
        when(productClient.getBatch(any())).thenReturn(ApiResponse.ok(Map.of("found", List.of(p), "missing", List.of(), "inactive", List.of())));

        CartResponse response = cartService.merge(uid, List.of(new CartItemRequest(productId, 99)));

        assertThat(response.getItems()).hasSize(1);
        assertThat(response.getItems().get(0).getQuantity()).isEqualTo(7);
    }
}
