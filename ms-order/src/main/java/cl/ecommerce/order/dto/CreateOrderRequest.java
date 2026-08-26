package cl.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateOrderRequest(
        @NotBlank String userId,
        @NotBlank String shippingAddress,
        @NotEmpty List<OrderItemRequest> items
) {
    public record OrderItemRequest(
            String productId,
            int quantity
    ) {}
}
