package cl.ecommerce.shipping.kafka;

import cl.ecommerce.common.event.PaymentCompletedEvent;
import cl.ecommerce.shipping.service.ShippingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentCompletedConsumer {

    private final ShippingService shippingService;

    @KafkaListener(topics = "payment.completed", groupId = "shipping-group")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("Received PaymentCompletedEvent for order: {}", event.getOrderId());
        shippingService.createShipmentFromPayment(event.getOrderId(), event.getUserId());
    }
}
