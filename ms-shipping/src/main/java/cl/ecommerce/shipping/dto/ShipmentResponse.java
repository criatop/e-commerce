package cl.ecommerce.shipping.dto;

import cl.ecommerce.shipping.model.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentResponse {
    private UUID id;
    private String orderId;
    private String userId;
    private String address;
    private String city;
    private String postalCode;
    private ShipmentStatus status;
    private String trackingNumber;
    private String carrier;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
