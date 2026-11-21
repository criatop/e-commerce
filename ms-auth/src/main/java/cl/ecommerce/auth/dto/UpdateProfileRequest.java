package cl.ecommerce.auth.dto;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Edicion del perfil propio. Solo se modifican los campos declarados; el email,
 * el RUN, la contrasena y el rol no se pueden cambiar desde este endpoint.
 * Un campo nulo conserva el valor actual.
 */
public record UpdateProfileRequest(
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
