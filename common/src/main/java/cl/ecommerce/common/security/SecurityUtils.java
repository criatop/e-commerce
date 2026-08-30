package cl.ecommerce.common.security;

import cl.ecommerce.common.exception.BusinessException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static String currentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new BusinessException("No autenticado");
        }
        return auth.getPrincipal().toString();
    }

    public static String requireSelfPrincipal(String requestedUserId, String resource) {
        String email = currentUserEmail();
        if (!email.equals(requestedUserId)) {
            throw new AccessDeniedException("No tienes permiso para acceder a los " + resource + " de otro usuario");
        }
        return email;
    }
}