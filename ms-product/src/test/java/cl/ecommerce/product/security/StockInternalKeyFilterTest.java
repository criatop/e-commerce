package cl.ecommerce.product.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class StockInternalKeyFilterTest {

    private static final String CLAVE = "clave-interna-de-prueba";

    private final StockInternalKeyFilter filtro = new StockInternalKeyFilter(
            CLAVE, new ObjectMapper().registerModule(new JavaTimeModule()));

    @Test
    void unaSecuenciaDePorcentajeInvalidaRespondeCuatroXXSinLanzar() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(
                "POST", "/api/v1/products/stock/reser%zzve");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        assertDoesNotThrow(() -> filtro.doFilter(request, response, chain));

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("SERVICE_ONLY");
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void unaRutaAjenaConPorcentajeInvalidoNoSeBloquea() {
        MockHttpServletRequest request = new MockHttpServletRequest(
                "POST", "/api/v1/categories/reser%zzve");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        assertDoesNotThrow(() -> filtro.doFilter(request, response, chain));

        assertThat(chain.getRequest()).isNotNull();
    }
}
