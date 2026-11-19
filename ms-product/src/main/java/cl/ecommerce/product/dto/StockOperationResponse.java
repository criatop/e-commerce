package cl.ecommerce.product.dto;

/**
 * Resultado de una operacion de stock aplicada sobre un lote de items.
 */
public record StockOperationResponse(
        String operation,
        int items
) {
}
