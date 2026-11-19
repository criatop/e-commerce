package cl.ecommerce.auth.dto;

import java.time.LocalDate;

public record UserResponse(
        Long id,
        String run,
        String nombre,
        String apellidos,
        String email,
        LocalDate fechaNacimiento,
        Integer roleId,
        String roleName,
        Integer regionId,
        String regionName,
        Integer comunaId,
        String comunaName,
        String direccion,
        Boolean activo
) {}
