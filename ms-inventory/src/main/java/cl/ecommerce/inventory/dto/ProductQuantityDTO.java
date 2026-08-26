package cl.ecommerce.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ProductQuantityDTO(
        @NotBlank String productId,
        @Min(1) int quantity
) {}
