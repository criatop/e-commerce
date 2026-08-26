package cl.ecommerce.shipping.dto;

import jakarta.validation.constraints.NotBlank;

public record ShipmentRequest(
        @NotBlank String orderId,
        @NotBlank String userId,
        @NotBlank String address,
        @NotBlank String city,
        @NotBlank String postalCode
) {
}
