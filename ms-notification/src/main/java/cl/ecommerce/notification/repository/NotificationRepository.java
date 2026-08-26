package cl.ecommerce.notification.repository;

import cl.ecommerce.notification.model.Notification;
import cl.ecommerce.notification.model.NotificationStatus;
import cl.ecommerce.notification.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByRecipientEmail(String recipientEmail);

    List<Notification> findByStatus(NotificationStatus status);

    List<Notification> findByType(NotificationType type);
}
