package cl.ecommerce.auth.controller;

import cl.ecommerce.auth.config.SecurityConfig;
import cl.ecommerce.auth.service.AuthService;
import cl.ecommerce.common.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@Import(SecurityConfig.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customerCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk());
    }

    @Test
    void regionsArePublic() throws Exception {
        mockMvc.perform(get("/api/v1/regions"))
                .andExpect(status().isOk());
    }

    @Test
    void comunasRequireRegionId() throws Exception {
        mockMvc.perform(get("/api/v1/comunas"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void comunasWithoutRegionIdReturnApiResponseError() throws Exception {
        mockMvc.perform(get("/api/v1/comunas"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exitoso").value(false))
                .andExpect(jsonPath("$.mensaje").value(containsString("regionId")))
                .andExpect(jsonPath("$.datos.error").value("BUSINESS_ERROR"))
                .andExpect(jsonPath("$.datos.codigo").value(400))
                .andExpect(jsonPath("$.datos.mensaje").value(containsString("regionId")))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void forbiddenResponseUsesApiResponseEnvelope() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exitoso").value(false))
                .andExpect(jsonPath("$.mensaje").value(containsString("permisos")))
                .andExpect(jsonPath("$.datos.error").value("FORBIDDEN"))
                .andExpect(jsonPath("$.datos.codigo").value(403))
                .andExpect(jsonPath("$.datos.timestamp").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customerCannotListRoles() throws Exception {
        mockMvc.perform(get("/api/v1/roles"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanListRoles() throws Exception {
        mockMvc.perform(get("/api/v1/roles"))
                .andExpect(status().isOk());
    }

    @Test
    void unauthenticatedCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.exitoso").value(false))
                .andExpect(jsonPath("$.mensaje").value("Autenticacion requerida"))
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
