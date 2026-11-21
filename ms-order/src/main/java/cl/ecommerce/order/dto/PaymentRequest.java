package cl.ecommerce.order.dto;
public record PaymentRequest(String orderId, String userId, double amount, String method) {}
