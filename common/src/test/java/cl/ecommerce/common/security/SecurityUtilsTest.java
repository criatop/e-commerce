package cl.ecommerce.common.security;

import cl.ecommerce.common.exception.BusinessException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SecurityUtilsTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void currentUserIdLeeElUidDeLaAutenticacion() {
        autenticar(7L, "CUSTOMER");

        assertEquals(7L, SecurityUtils.currentUserId());
    }

    @Test
    void currentUserIdFallaSiNoHayAutenticacion() {
        assertThrows(BusinessException.class, SecurityUtils::currentUserId);
    }

    @Test
    void requireSelfOrAdminPermiteElPropioUid() {
        autenticar(7L, "CUSTOMER");

        assertDoesNotThrow(() -> SecurityUtils.requireSelfOrAdmin("7"));
    }

    @Test
    void requireSelfOrAdminBloqueaElUidAjeno() {
        autenticar(7L, "CUSTOMER");

        assertThrows(AccessDeniedException.class, () -> SecurityUtils.requireSelfOrAdmin("8"));
    }

    @Test
    void requireSelfOrAdminDejaPasarAlAdmin() {
        autenticar(99L, "ADMIN");

        assertDoesNotThrow(() -> SecurityUtils.requireSelfOrAdmin("7"));
    }

    @Test
    void isAdminSoloEsCiertoConRolAdmin() {
        autenticar(7L, "CUSTOMER");
        assertFalse(SecurityUtils.isAdmin());

        autenticar(99L, "ADMIN");
        assertTrue(SecurityUtils.isAdmin());
    }

    private static void autenticar(Long uid, String rol) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "a@b.cl", null, List.of(new SimpleGrantedAuthority("ROLE_" + rol)));
        auth.setDetails(uid);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
