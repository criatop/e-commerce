package cl.ecommerce.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ProductRequest(
        @NotNull String name,
        String description,
        @NotNull @Min(0) Double price,
        @NotNull UUID category,
        String imageUrl,
        String sku
) {
}
