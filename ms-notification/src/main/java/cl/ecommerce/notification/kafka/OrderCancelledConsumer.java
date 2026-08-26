package cl.ecommerce.notification.kafka;

import cl.ecommerce.common.event.OrderCancelledEvent;
import cl.ecommerce.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCancelledConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "order.cancelled", groupId = "notification-group")
    public void onOrderCancelled(OrderCancelledEvent event, Acknowledgment acknowledgment) {
        log.info("Received order.cancelled event: orderId={}, userId={}, reason={}",
                event.getOrderId(), event.getUserId(), event.getReason());

        try {
            notificationService.sendCancellationNotification(
                    event.getUserId(),
                    event.getOrderId(),
                    event.getReason()
            );
            acknowledgment.acknowledge();
            log.info("Cancellation notification sent for order: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to process order.cancelled event for order: {}", event.getOrderId(), e);
            acknowledgment.acknowledge();
        }
    }
}
