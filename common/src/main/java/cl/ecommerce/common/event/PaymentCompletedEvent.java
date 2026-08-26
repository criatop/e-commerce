package cl.ecommerce.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCompletedEvent {
    private String paymentId;
    private String orderId;
    private String userId;
    private double amount;
    private String method;
    private LocalDateTime timestamp;
}
