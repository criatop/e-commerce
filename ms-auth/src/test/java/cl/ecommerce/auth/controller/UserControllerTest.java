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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
                .andExpect(status().isUnauthorized());
    }
}
