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
public class StockReservedEvent {
    private String orderId;
    private String productId;
    private int quantity;
    private LocalDateTime timestamp;
}
