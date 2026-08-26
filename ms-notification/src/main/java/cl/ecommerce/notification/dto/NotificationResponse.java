package cl.ecommerce.notification.dto;

import cl.ecommerce.notification.model.NotificationStatus;
import cl.ecommerce.notification.model.NotificationType;
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
public class NotificationResponse {

    private UUID id;
    private NotificationType type;
    private String recipientEmail;
    private String subject;
    private String body;
    private NotificationStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
}
