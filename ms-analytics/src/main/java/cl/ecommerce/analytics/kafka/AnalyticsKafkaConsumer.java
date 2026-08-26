package cl.ecommerce.analytics.kafka;

import cl.ecommerce.analytics.model.SalesRecord;
import cl.ecommerce.analytics.model.UserActivity;
import cl.ecommerce.analytics.service.AnalyticsService;
import cl.ecommerce.common.event.OrderCreatedEvent;
import cl.ecommerce.common.event.PaymentCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AnalyticsKafkaConsumer {

    private final AnalyticsService analyticsService;

    @KafkaListener(topics = "payment.completed", groupId = "analytics-group")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("Received payment.completed event for order: {}", event.getOrderId());

        SalesRecord sale = SalesRecord.builder()
                .orderId(event.getOrderId())
                .userId(event.getUserId())
                .productId("unknown")
                .productName("unknown")
                .category("general")
                .quantity(1)
                .amount(event.getAmount())
                .recordedAt(event.getTimestamp() != null ? event.getTimestamp() : LocalDateTime.now())
                .build();

        analyticsService.recordSale(sale);
    }

    @KafkaListener(topics = "order.created", groupId = "analytics-group")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received order.created event for order: {}", event.getOrderId());

        UserActivity activity = UserActivity.builder()
                .userId(event.getUserId())
                .action(UserActivity.Action.PURCHASE)
                .productId(event.getOrderId())
                .details("Order created with total: " + event.getTotalAmount())
                .recordedAt(event.getTimestamp() != null ? event.getTimestamp() : LocalDateTime.now())
                .build();

        analyticsService.recordActivity(activity);
    }
}
