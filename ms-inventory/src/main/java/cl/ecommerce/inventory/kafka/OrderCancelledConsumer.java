package cl.ecommerce.inventory.kafka;

import cl.ecommerce.common.event.OrderCancelledEvent;
import cl.ecommerce.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCancelledConsumer {

    private final InventoryService inventoryService;

    @KafkaListener(topics = "order.cancelled", groupId = "inventory-group")
    public void handleOrderCancelled(OrderCancelledEvent event) {
        log.info("Received OrderCancelledEvent for order: {}", event.getOrderId());
        inventoryService.releaseAllForOrder(event.getOrderId());
    }
}
