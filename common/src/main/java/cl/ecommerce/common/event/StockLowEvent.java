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
public class StockLowEvent {
    private String productId;
    private String productName;
    private int currentQuantity;
    private LocalDateTime timestamp;
}
