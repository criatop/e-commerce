package cl.ecommerce.product.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Lote de ids para resolver precios y disponibilidad reales durante el checkout.
 */
public record ProductBatchRequest(
        @NotEmpty List<@NotNull UUID> ids
) {
}
