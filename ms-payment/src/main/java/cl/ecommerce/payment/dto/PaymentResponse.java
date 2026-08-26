package cl.ecommerce.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private UUID id;
    private String orderId;
    private String userId;
    private double amount;
    private String method;
    private String status;
    private String transactionId;
    private LocalDateTime createdAt;
}
