package cl.ecommerce.notification.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCancelledEvent {

    private String orderId;
    private String recipientEmail;
    private String reason;
}
