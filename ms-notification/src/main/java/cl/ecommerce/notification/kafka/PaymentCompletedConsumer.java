package cl.ecommerce.notification.kafka;

import cl.ecommerce.common.event.PaymentCompletedEvent;
import cl.ecommerce.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentCompletedConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "payment.completed", groupId = "notification-group")
    public void onPaymentCompleted(PaymentCompletedEvent event, Acknowledgment acknowledgment) {
        log.info("Received payment.completed event: orderId={}, userId={}, amount={}",
                event.getOrderId(), event.getUserId(), event.getAmount());

        try {
            notificationService.sendPaymentConfirmation(
                    event.getUserId(),
                    event.getOrderId(),
                    event.getAmount()
            );
            acknowledgment.acknowledge();
            log.info("Payment confirmation notification sent for order: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to process payment.completed event for order: {}", event.getOrderId(), e);
            if (e instanceof RuntimeException re) {
                throw re;
            }
            throw new RuntimeException("Error procesando payment.completed: " + event.getOrderId(), e);
        }
    }
}
