package cl.ecommerce.product.controller;

import cl.ecommerce.common.config.DefaultSecurityConfig;
import cl.ecommerce.common.security.JwtTokenProvider;
import cl.ecommerce.product.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProductController.class,
        properties = "internal.key=clave-interna-de-prueba")
@Import(DefaultSecurityConfig.class)
class ProductStockSecurityTest {

    private static final String INTERNAL_KEY = "clave-interna-de-prueba";
    private static final String INTERNAL_KEY_HEADER = "X-Internal-Key";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    private final UUID id = UUID.randomUUID();

    private String body() {
        return "[{\"productId\":\"" + id + "\",\"quantity\":2}]";
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customerSinCabeceraInternaNoPuedeReservar() throws Exception {
        mockMvc.perform(post("/api/v1/products/stock/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exitoso").value(false))
                .andExpect(jsonPath("$.datos.error").value("SERVICE_ONLY"));

        verifyNoInteractions(productService);
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customerConCabeceraInternaPuedeReservar() throws Exception {
        mockMvc.perform(post("/api/v1/products/stock/reserve")
                        .header(INTERNAL_KEY_HEADER, INTERNAL_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitoso").value(true));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void unaClaveInternaIncorrectaNoPuedeReservar() throws Exception {
        mockMvc.perform(post("/api/v1/products/stock/reserve")
                        .header(INTERNAL_KEY_HEADER, "clave-equivocada")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.datos.error").value("SERVICE_ONLY"));

        verifyNoInteractions(productService);
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void unPathParamNoEvitaElFiltro() throws Exception {
        mockMvc.perform(post("/api/v1/products/stock/reserve;x")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.datos.error").value("SERVICE_ONLY"));

        verifyNoInteractions(productService);
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void unPathConPercentEncodingNoEvitaElFiltro() throws Exception {
        mockMvc.perform(post(java.net.URI.create("/api/v1/products/stock/res%65rve"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.datos.error").value("SERVICE_ONLY"));

        verifyNoInteractions(productService);
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void unPathParamPercentEncodedNoEvitaElFiltro() throws Exception {
        mockMvc.perform(post(java.net.URI.create("/api/v1/products/stock/reserve%3Bx"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.datos.error").value("SERVICE_ONLY"));

        verifyNoInteractions(productService);
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void unaSecuenciaDePorcentajeInvalidaNoLanzaQuinientos() throws Exception {
        mockMvc.perform(post(java.net.URI.create("/api/v1/products/stock/reser%zzve"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.datos.error").value("SERVICE_ONLY"));

        verifyNoInteractions(productService);
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void confirmYReleaseTambienExigenLaClaveInterna() throws Exception {
        for (String operacion : new String[]{"confirm", "release"}) {
            mockMvc.perform(post("/api/v1/products/stock/" + operacion)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body()))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.datos.error").value("SERVICE_ONLY"));
        }

        verifyNoInteractions(productService);
    }

    @Test
    void elCatalogoPublicoSigueSinExigirLaClaveInterna() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customerNoPuedeRestaurarStockAunqueTraigaLaCabecera() throws Exception {
        mockMvc.perform(post("/api/v1/products/stock/restore")
                        .header(INTERNAL_KEY_HEADER, INTERNAL_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body()))
                .andExpect(status().isForbidden());

        verifyNoInteractions(productService);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminPuedeRestaurarStock() throws Exception {
        mockMvc.perform(post("/api/v1/products/stock/restore")
                        .header(INTERNAL_KEY_HEADER, INTERNAL_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitoso").value(true));
    }
}
