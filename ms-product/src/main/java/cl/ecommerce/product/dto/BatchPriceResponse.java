package cl.ecommerce.product.dto;

import java.util.List;
import java.util.UUID;

/**
 * Resultado de resolver precios por lote. Separa lo vendible de lo que ya no
 * existe o quedo inactivo, para que el checkout pueda decidir sin adivinar.
 */
public record BatchPriceResponse(
        List<ProductResponse> found,
        List<UUID> missing,
        List<UUID> inactive
) {
    public BatchPriceResponse {
        found = found == null ? List.of() : List.copyOf(found);
        missing = missing == null ? List.of() : List.copyOf(missing);
        inactive = inactive == null ? List.of() : List.copyOf(inactive);
    }

    public static BatchPriceResponse empty() {
        return new BatchPriceResponse(List.of(), List.of(), List.of());
    }
}
