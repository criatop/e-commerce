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
public class ReviewCreatedEvent {
    private String reviewId;
    private String productId;
    private String userId;
    private int rating;
    private LocalDateTime timestamp;
}
