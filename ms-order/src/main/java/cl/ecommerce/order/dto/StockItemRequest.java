package cl.ecommerce.order.dto;
import java.util.UUID;
public record StockItemRequest(UUID productId, int quantity) {}
