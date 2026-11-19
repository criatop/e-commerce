package cl.ecommerce.auth.dto;

/**
 * Edicion administrativa de un usuario: solo rol y estado. Un campo nulo
 * conserva el valor actual. Cambiar el rol exige que el usuario afectado
 * vuelva a iniciar sesion para recibir un JWT con el rol nuevo.
 */
public record UpdateUserRequest(
        Integer roleId,
        Boolean activo
) {}
