package cl.ecommerce.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ReserveStockRequest(
        @NotBlank String orderId,
        @NotEmpty @Valid List<ProductQuantityDTO> items
) {}
