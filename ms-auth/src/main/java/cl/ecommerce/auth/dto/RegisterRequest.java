package cl.ecommerce.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank(message = "El RUN es obligatorio")
        @Size(max = 12, message = "El RUN no puede superar 12 caracteres")
        String run,

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email debe ser valido")
        @Size(max = 150, message = "El email no puede superar 150 caracteres")
        String email,

        @NotBlank(message = "La contrasena es obligatoria")
        @Size(min = 6, message = "La contrasena debe tener al menos 6 caracteres")
        String password,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
        String nombre,

        @Size(max = 100, message = "Los apellidos no pueden superar 100 caracteres")
        String apellidos,

        @Past(message = "La fecha de nacimiento debe ser anterior a hoy")
        LocalDate fechaNacimiento,

        Integer regionId,

        Integer comunaId,

        @Size(max = 255, message = "La direccion no puede superar 255 caracteres")
        String direccion
) {}
