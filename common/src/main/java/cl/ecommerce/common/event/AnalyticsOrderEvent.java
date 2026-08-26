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
public class AnalyticsOrderEvent {
    private String orderId;
    private String userId;
    private String productId;
    private int quantity;
    private double amount;
    private String category;
    private LocalDateTime timestamp;
}
