package cl.ecommerce.cart.dto;

public record CartItemRequest(
        String productId,
        int quantity
) {}
