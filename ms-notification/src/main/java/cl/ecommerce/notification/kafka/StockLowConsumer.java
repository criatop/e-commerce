package cl.ecommerce.notification.kafka;

import cl.ecommerce.common.event.StockLowEvent;
import cl.ecommerce.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StockLowConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "stock.low", groupId = "notification-group")
    public void onStockLow(StockLowEvent event, Acknowledgment acknowledgment) {
        log.info("Received stock.low event: productId={}, productName={}, currentQuantity={}",
                event.getProductId(), event.getProductName(), event.getCurrentQuantity());

        try {
            notificationService.sendStockAlert(
                    event.getProductId(),
                    event.getProductName(),
                    event.getCurrentQuantity()
            );
            acknowledgment.acknowledge();
            log.info("Stock alert notification sent for product: {}", event.getProductName());
        } catch (Exception e) {
            log.error("Failed to process stock.low event for product: {}", event.getProductId(), e);
            if (e instanceof RuntimeException re) {
                throw re;
            }
            throw new RuntimeException("Error procesando stock.low: " + event.getProductId(), e);
        }
    }
}
