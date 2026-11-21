package cl.ecommerce.order.dto;
public record ShipmentRequest(String orderId, String userId, String address, String city, String postalCode) {}
