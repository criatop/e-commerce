package cl.ecommerce.common.security;

import cl.ecommerce.common.exception.BusinessException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

public final class SecurityUtils {

    static final String UID_REQUEST_ATTRIBUTE = "uid";

    private SecurityUtils() {}

    public static String currentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new BusinessException("No autenticado");
        }
        return auth.getPrincipal().toString();
    }

    /**
     * Uid del usuario autenticado, tomado del detalle de la autenticacion que deja
     * {@link JwtAuthenticationFilter} o del atributo de request {@code uid}.
     */
    public static Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            Long uid = asLong(auth.getDetails());
            if (uid != null) {
                return uid;
            }
        }
        Long uid = asLong(requestAttributeUid());
        if (uid != null) {
            return uid;
        }
        throw new BusinessException("No autenticado");
    }

    public static boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && auth.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    /**
     * Exige que el recurso pertenezca al uid autenticado, salvo que sea ADMIN.
     */
    public static void requireSelfOrAdmin(String resourceUserId) {
        if (isAdmin()) {
            return;
        }
        String currentUid = String.valueOf(currentUserId());
        if (!currentUid.equals(resourceUserId)) {
            throw new AccessDeniedException("No tienes permiso para acceder a los recursos de otro usuario");
        }
    }

    public static String requireSelfPrincipal(String requestedUserId, String resource) {
        String email = currentUserEmail();
        if (!email.equals(requestedUserId)) {
            throw new AccessDeniedException("No tienes permiso para acceder a los " + resource + " de otro usuario");
        }
        return email;
    }

    private static Object requestAttributeUid() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return null;
        }
        return attributes.getAttribute(UID_REQUEST_ATTRIBUTE, RequestAttributes.SCOPE_REQUEST);
    }

    private static Long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            try {
                return Long.valueOf(text);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
