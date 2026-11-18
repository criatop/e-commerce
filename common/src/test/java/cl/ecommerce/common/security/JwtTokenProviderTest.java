package cl.ecommerce.common.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private static JwtProperties propsConSecretoDe64BytesY24h() {
        JwtProperties props = new JwtProperties();
        props.setSecret("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
        props.setExpirationMs(24L * 60 * 60 * 1000);
        return props;
    }

    @Test
    void generaYLeeElUid() {
        var provider = new JwtTokenProvider(propsConSecretoDe64BytesY24h());
        String token = provider.generateToken(7L, "a@b.cl", "Ana", "CUSTOMER");
        assertEquals(7L, provider.getUserIdFromToken(token));
        assertEquals("a@b.cl", provider.getEmailFromToken(token));
        assertTrue(provider.validateToken(token));
    }

    @Test
    void rechazaTokenAlterado() {
        var provider = new JwtTokenProvider(propsConSecretoDe64BytesY24h());
        String token = provider.generateToken(7L, "a@b.cl", "Ana", "CUSTOMER");
        assertFalse(provider.validateToken(token + "x"));
    }

    @Test
    void devuelveNullSiElTokenNoTraeUid() {
        var provider = new JwtTokenProvider(propsConSecretoDe64BytesY24h());
        String tokenSinUid = provider.generateToken(null, "a@b.cl", "Ana", "CUSTOMER");
        assertNull(provider.getUserIdFromToken(tokenSinUid));
    }
}
