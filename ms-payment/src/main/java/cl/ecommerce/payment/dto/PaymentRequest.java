package cl.ecommerce.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record PaymentRequest(
        @NotBlank String orderId,
        @NotBlank String userId,
        @Positive double amount,
        @NotBlank String method
) {}
