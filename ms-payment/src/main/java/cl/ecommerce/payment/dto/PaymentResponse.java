package cl.ecommerce.payment.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        String orderId,
        String userId,
        double amount,
        String method,
        String status,
        String transactionId,
        LocalDateTime createdAt
) {}
