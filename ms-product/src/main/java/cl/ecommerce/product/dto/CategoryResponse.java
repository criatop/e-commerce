package cl.ecommerce.product.dto;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String description,
        boolean activa
) {
}
