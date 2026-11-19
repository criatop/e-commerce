package cl.ecommerce.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Cantidad de unidades de un producto sobre la que se aplica una operacion de stock.
 */
public record StockItemRequest(
        @NotNull UUID productId,
        @Min(1) int quantity
) {
}
