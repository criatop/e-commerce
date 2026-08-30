package cl.ecommerce.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminRegisterRequest(
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email debe ser valido")
        String email,

        @NotBlank(message = "La contrasena es obligatoria")
        @Size(min = 6, message = "La contrasena debe tener al menos 6 caracteres")
        String password,

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "El rol es obligatorio")
        @Pattern(regexp = "ADMIN|SELLER", message = "El rol debe ser ADMIN o SELLER")
        String rol
) {}