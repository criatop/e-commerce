package cl.ecommerce.notification.service;

import cl.ecommerce.notification.dto.NotificationRequest;
import cl.ecommerce.notification.dto.NotificationResponse;
import cl.ecommerce.notification.model.Notification;
import cl.ecommerce.notification.model.NotificationStatus;
import cl.ecommerce.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationResponse sendNotification(NotificationRequest request) {
        Notification notification = Notification.builder()
                .type(request.type())
                .recipientEmail(request.recipientEmail())
                .subject(request.subject())
                .body(request.body())
                .status(NotificationStatus.PENDING)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Notification created with id: {} - sending...", notification.getId());

        simulateSend(notification);

        return mapToResponse(notification);
    }

    public List<NotificationResponse> getNotificationsByUser(String email) {
        return notificationRepository.findByRecipientEmail(email).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<NotificationResponse> getAll() {
        return notificationRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void sendPaymentConfirmation(String recipientEmail, String orderId, double amount) {
        NotificationRequest request = new NotificationRequest(
                cl.ecommerce.notification.model.NotificationType.EMAIL,
                recipientEmail,
                "Payment Confirmation - Order " + orderId,
                "Your payment of $" + amount + " for order " + orderId + " has been successfully processed."
        );
        sendNotification(request);
    }

    public void sendCancellationNotification(String recipientEmail, String orderId, String reason) {
        NotificationRequest request = new NotificationRequest(
                cl.ecommerce.notification.model.NotificationType.EMAIL,
                recipientEmail,
                "Order Cancelled - Order " + orderId,
                "Your order " + orderId + " has been cancelled. Reason: " + reason
        );
        sendNotification(request);
    }

    public void sendStockAlert(String productId, String productName, int currentStock) {
        NotificationRequest request = new NotificationRequest(
                cl.ecommerce.notification.model.NotificationType.EMAIL,
                "admin@ecommerce.com",
                "Low Stock Alert - " + productName,
                "Product " + productName + " (ID: " + productId + ") is running low. Current stock: " + currentStock
        );
        sendNotification(request);
    }

    private void simulateSend(Notification notification) {
        try {
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);
            log.info("Notification {} sent successfully to {}", notification.getId(), notification.getRecipientEmail());
        } catch (Exception e) {
            notification.setStatus(NotificationStatus.FAILED);
            notificationRepository.save(notification);
            log.error("Failed to send notification {} to {}", notification.getId(), notification.getRecipientEmail(), e);
        }
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .recipientEmail(notification.getRecipientEmail())
                .subject(notification.getSubject())
                .body(notification.getBody())
                .status(notification.getStatus())
                .sentAt(notification.getSentAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
