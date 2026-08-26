package cl.ecommerce.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InventoryRequest(
        @NotBlank String productId,
        String productName,
        @NotNull @Min(0) Integer quantity,
        @Min(1) Integer lowStockThreshold
) {}
