package cl.accesorioschic.content.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactRequest(
        @NotBlank String nombre,
        String apellido,
        @NotBlank @Email String email,
        @NotBlank String mensaje
) {}
