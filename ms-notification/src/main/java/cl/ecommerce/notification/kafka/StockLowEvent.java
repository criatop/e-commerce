package cl.ecommerce.notification.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockLowEvent {

    private String productId;
    private String productName;
    private int currentStock;
    private int threshold;
}
