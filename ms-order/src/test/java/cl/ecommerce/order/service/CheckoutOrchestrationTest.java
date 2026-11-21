package cl.ecommerce.order.service;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.SecurityUtils;
import cl.ecommerce.order.client.PaymentClient;
import cl.ecommerce.order.client.ProductClient;
import cl.ecommerce.order.client.ShippingClient;
import cl.ecommerce.order.dto.CheckoutRequest;
import cl.ecommerce.order.dto.OrderResponse;
import cl.ecommerce.order.dto.StockItemRequest;
import cl.ecommerce.order.model.Order;
import cl.ecommerce.order.model.OrderItem;
import cl.ecommerce.order.model.OrderStatus;
import cl.ecommerce.order.repository.OrderRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckoutOrchestrationTest {

    @Mock OrderRepository orderRepository;
    @Mock ProductClient productClient;
    @Mock FolioGenerator folioGenerator;
    @Mock PaymentClient paymentClient;
    @Mock ShippingClient shippingClient;
    @InjectMocks OrderService orderService;

    @AfterEach
    void clear() { SecurityContextHolder.clearContext(); }

    private void auth(String uid) {
        var a = new UsernamePasswordAuthenticationToken("u@test.com", "t", List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        a.setDetails(uid);
        SecurityContextHolder.getContext().setAuthentication(a);
    }

    private CheckoutRequest req(UUID productId) {
        return new CheckoutRequest("Av 1", "RM", "Santiago", "123", "CARD",
                List.of(new CheckoutRequest.ItemRequest(productId, 2)));
    }

    @Test
    void siPagoFallaLiberaStockYCancelaOrden() {
        auth("1");
        UUID pid = UUID.randomUUID();
        when(productClient.batch(any())).thenReturn(ApiResponse.ok(Map.of(
                "found", List.of(Map.of("id", pid.toString(), "name", "P", "sku", "S1", "price", 1000.0, "active", true, "available", 5)),
                "missing", List.of(), "inactive", List.of())));
        when(folioGenerator.nextFolio(any())).thenReturn("CH-20261121-000001");
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            if (o.getId() == null) o.setId(UUID.randomUUID());
            return o;
        });
        doThrow(new RuntimeException("down")).when(paymentClient).create(any());

        assertThatThrownBy(() -> orderService.checkout(req(pid), "1", "u@test.com", "User"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode().value()).isEqualTo(402));

        verify(productClient).reserveStock(any());
        verify(productClient).releaseStock(any());
        ArgumentCaptor<Order> cap = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository, atLeastOnce()).save(cap.capture());
        assertThat(cap.getAllValues().get(cap.getAllValues().size() - 1).getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    void totalCalculadoEnServidor() {
        auth("1");
        UUID pid = UUID.randomUUID();
        when(productClient.batch(any())).thenReturn(ApiResponse.ok(Map.of(
                "found", List.of(Map.of("id", pid.toString(), "name", "P", "sku", "S1", "price", 1500.0, "active", true, "available", 5)),
                "missing", List.of(), "inactive", List.of())));
        when(folioGenerator.nextFolio(any())).thenReturn("CH-20261121-000002");
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            if (o.getId() == null) o.setId(UUID.randomUUID());
            return o;
        });
        when(paymentClient.create(any())).thenReturn(ApiResponse.ok(Map.of("id", "pay1")));
        when(shippingClient.create(any())).thenReturn(ApiResponse.ok(Map.of("id", "ship1")));
        when(productClient.confirmStock(any())).thenReturn(ApiResponse.ok(null));

        OrderResponse resp = orderService.checkout(req(pid), "1", "u@test.com", "User");

        assertThat(resp.getSubtotalAmount()).isEqualTo(3000.0);
        assertThat(resp.getTotalAmount()).isEqualTo(3000.0);
        assertThat(resp.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        verify(productClient).reserveStock(List.of(new StockItemRequest(pid, 2)));
        verify(productClient).confirmStock(List.of(new StockItemRequest(pid, 2)));
    }
}
