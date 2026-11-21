package cl.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record CheckoutRequest(
        @NotBlank String shippingAddress,
        @NotBlank String shippingRegion,
        @NotBlank String shippingComuna,
        String shippingPhone,
        @NotBlank String paymentMethod,
        @NotEmpty List<ItemRequest> items
) {
    public record ItemRequest(@NotNull UUID productId, int quantity) {}
}
