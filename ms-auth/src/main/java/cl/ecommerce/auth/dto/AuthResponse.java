package cl.ecommerce.auth.dto;

public record AuthResponse(String token, UserResponse usuario, String rol) {}
