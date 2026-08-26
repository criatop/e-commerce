package cl.ecommerce.order.dto;

import java.util.List;

public record InventoryReservationRequest(
        String orderId,
        List<Item> items
) {
    public record Item(
            String productId,
            int quantity
    ) {}
}
