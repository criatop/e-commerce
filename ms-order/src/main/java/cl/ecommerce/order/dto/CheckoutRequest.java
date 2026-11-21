package cl.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(
        @NotBlank String shippingAddress,
        @NotBlank String shippingCity,
        String shippingPostal,
        @NotBlank String recipientName,
        @NotBlank String recipientRut,
        @NotBlank String recipientEmail,
        String recipientPhone,
        String notes,
        @NotNull Object paymentMethod
) {}
