package cl.ecommerce.notification.dto;

import cl.ecommerce.notification.model.NotificationType;

public record NotificationRequest(
        NotificationType type,
        String recipientEmail,
        String subject,
        String body
) {
}
