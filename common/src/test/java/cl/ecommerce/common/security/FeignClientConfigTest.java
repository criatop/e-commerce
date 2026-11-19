package cl.ecommerce.common.security;

import feign.RequestTemplate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FeignClientConfigTest {

    private static final String INTERNAL_KEY = "clave-interna-de-prueba";

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void propagaElHeaderAuthorizationHaciaElServicioRemoto() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer token-de-prueba");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        RequestTemplate template = new RequestTemplate();
        new FeignClientConfig(INTERNAL_KEY).jwtPropagation().apply(template);

        assertEquals(List.of("Bearer token-de-prueba"), template.headers().get(HttpHeaders.AUTHORIZATION));
    }

    @Test
    void propagaLaCabeceraInternaHaciaElServicioRemoto() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        RequestTemplate template = new RequestTemplate();
        new FeignClientConfig(INTERNAL_KEY).jwtPropagation().apply(template);

        assertEquals(List.of(INTERNAL_KEY), template.headers().get("X-Internal-Key"));
    }

    @Test
    void noPropagaAuthorizationSiNoHayPeticionEnCursoPeroSiLaCabeceraInterna() {
        RequestContextHolder.resetRequestAttributes();

        RequestTemplate template = new RequestTemplate();
        new FeignClientConfig(INTERNAL_KEY).jwtPropagation().apply(template);

        assertFalse(template.headers().containsKey(HttpHeaders.AUTHORIZATION));
        assertEquals(List.of(INTERNAL_KEY), template.headers().get("X-Internal-Key"));
    }
}
