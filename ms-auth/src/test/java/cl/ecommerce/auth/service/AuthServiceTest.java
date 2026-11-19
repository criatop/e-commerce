package cl.ecommerce.auth.service;

import cl.ecommerce.auth.dto.AdminRegisterRequest;
import cl.ecommerce.auth.dto.AuthResponse;
import cl.ecommerce.auth.dto.ComunaResponse;
import cl.ecommerce.auth.dto.LoginRequest;
import cl.ecommerce.auth.dto.RegisterRequest;
import cl.ecommerce.auth.dto.UpdateProfileRequest;
import cl.ecommerce.auth.dto.UpdateUserRequest;
import cl.ecommerce.auth.dto.UserResponse;
import cl.ecommerce.auth.model.Comuna;
import cl.ecommerce.auth.model.Region;
import cl.ecommerce.auth.model.Role;
import cl.ecommerce.auth.model.User;
import cl.ecommerce.auth.repository.ComunaRepository;
import cl.ecommerce.auth.repository.RegionRepository;
import cl.ecommerce.auth.repository.RoleRepository;
import cl.ecommerce.auth.repository.UserRepository;
import cl.ecommerce.common.exception.BusinessException;
import cl.ecommerce.common.security.JwtTokenProvider;
import cl.ecommerce.common.security.SecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final Long USER_ID = 10L;

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private RegionRepository regionRepository;
    @Mock
    private ComunaRepository comunaRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private AuthService authService;
    private MockedStatic<SecurityUtils> securityUtils;

    private final Region metropolitana = Region.builder().id(1).name("Region Metropolitana").orden(1).build();
    private final Region valparaiso = Region.builder().id(2).name("Valparaiso").orden(2).build();
    private final Comuna santiago = Comuna.builder().id(1).name("Santiago").region(metropolitana).build();
    private final Comuna valpo = Comuna.builder().id(4).name("Valparaiso").region(valparaiso).build();
    private final Role customer = Role.builder().id(3).name("CUSTOMER").build();
    private final Role admin = Role.builder().id(1).name("ADMIN").build();

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, roleRepository, regionRepository,
                comunaRepository, passwordEncoder, jwtTokenProvider);
        securityUtils = mockStatic(SecurityUtils.class);
    }

    @AfterEach
    void tearDown() {
        securityUtils.close();
    }

    @Test
    void registerPersistsRunAndAssignsCustomerRole() {
        RegisterRequest request = new RegisterRequest("123456789", "nueva@gmail.com", "clave123",
                "Nueva", "Cliente", LocalDate.of(1995, 4, 12), 1, 1, "Av. Siempre Viva 742");

        given(userRepository.findByEmail("nueva@gmail.com")).willReturn(Optional.empty());
        given(userRepository.existsByRun("123456789")).willReturn(false);
        given(roleRepository.findByName("CUSTOMER")).willReturn(Optional.of(customer));
        given(regionRepository.findById(1)).willReturn(Optional.of(metropolitana));
        given(comunaRepository.findById(1)).willReturn(Optional.of(santiago));
        given(passwordEncoder.encode("clave123")).willReturn("encoded");
        given(userRepository.save(any(User.class))).willAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(USER_ID);
            return user;
        });
        given(jwtTokenProvider.generateToken(USER_ID, "nueva@gmail.com", "Nueva", "CUSTOMER"))
                .willReturn("jwt-token");

        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertThat(saved.getValue().getRun()).isEqualTo("123456789");
        assertThat(saved.getValue().getRole()).isEqualTo(customer);
        assertThat(saved.getValue().getActivo()).isTrue();
        assertThat(saved.getValue().getComuna()).isEqualTo(santiago);
        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.rol()).isEqualTo("CUSTOMER");
        assertThat(response.usuario().run()).isEqualTo("123456789");
        assertThat(response.usuario().comunaName()).isEqualTo("Santiago");
    }

    @Test
    void registerRejectsDuplicatedRun() {
        RegisterRequest request = new RegisterRequest("123456789", "nueva@gmail.com", "clave123",
                "Nueva", null, null, null, null, null);

        given(userRepository.findByEmail("nueva@gmail.com")).willReturn(Optional.empty());
        given(userRepository.existsByRun("123456789")).willReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("RUN");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerRejectsComunaFromAnotherRegion() {
        RegisterRequest request = new RegisterRequest("123456789", "nueva@gmail.com", "clave123",
                "Nueva", null, null, 1, 4, null);

        given(userRepository.findByEmail("nueva@gmail.com")).willReturn(Optional.empty());
        given(userRepository.existsByRun("123456789")).willReturn(false);
        given(roleRepository.findByName("CUSTOMER")).willReturn(Optional.of(customer));
        given(regionRepository.findById(1)).willReturn(Optional.of(metropolitana));
        given(comunaRepository.findById(4)).willReturn(Optional.of(valpo));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("comuna");
    }

    @Test
    void loginRejectsInactiveUser() {
        User inactive = existingUser();
        inactive.setActivo(false);

        given(userRepository.findByEmail("camila@gmail.com")).willReturn(Optional.of(inactive));
        given(passwordEncoder.matches("clave123", "encoded")).willReturn(true);

        assertThatThrownBy(() -> authService.login(new LoginRequest("camila@gmail.com", "clave123")))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Credenciales invalidas");
    }

    @Test
    void loginReturnsTokenAndFullProfile() {
        User user = existingUser();

        given(userRepository.findByEmail("camila@gmail.com")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("clave123", "encoded")).willReturn(true);
        given(jwtTokenProvider.generateToken(USER_ID, "camila@gmail.com", "Camila", "CUSTOMER"))
                .willReturn("jwt-token");

        AuthResponse response = authService.login(new LoginRequest("camila@gmail.com", "clave123"));

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.usuario().email()).isEqualTo("camila@gmail.com");
        assertThat(response.usuario().roleName()).isEqualTo("CUSTOMER");
        assertThat(response.usuario().regionName()).isEqualTo("Region Metropolitana");
    }

    @Test
    void meReadsProfileByUidFromToken() {
        securityUtils.when(SecurityUtils::currentUserId).thenReturn(USER_ID);
        given(userRepository.findById(USER_ID)).willReturn(Optional.of(existingUser()));

        UserResponse response = authService.me();

        assertThat(response.id()).isEqualTo(USER_ID);
        assertThat(response.run()).isEqualTo("333333333");
        assertThat(response.comunaName()).isEqualTo("Santiago");
    }

    @Test
    void updateProfileOnlyAppliesAllowedFields() {
        User user = existingUser();
        securityUtils.when(SecurityUtils::currentUserId).thenReturn(USER_ID);
        given(userRepository.findById(USER_ID)).willReturn(Optional.of(user));
        given(regionRepository.findById(2)).willReturn(Optional.of(valparaiso));
        given(comunaRepository.findById(4)).willReturn(Optional.of(valpo));
        given(userRepository.save(user)).willReturn(user);

        UserResponse response = authService.updateProfile(
                new UpdateProfileRequest("Camila Andrea", "Rosales Diaz", null, 2, 4, "Nueva 123"));

        assertThat(response.nombre()).isEqualTo("Camila Andrea");
        assertThat(user.getEmail()).isEqualTo("camila@gmail.com");
        assertThat(user.getRun()).isEqualTo("333333333");
        assertThat(user.getFechaNacimiento()).isEqualTo(LocalDate.of(1998, 3, 22));
        assertThat(user.getRegion()).isEqualTo(valparaiso);
        assertThat(user.getComuna()).isEqualTo(valpo);
        assertThat(user.getDireccion()).isEqualTo("Nueva 123");
    }

    @Test
    void updateProfileClearsComunaWhenRegionChanges() {
        User user = existingUser();
        securityUtils.when(SecurityUtils::currentUserId).thenReturn(USER_ID);
        given(userRepository.findById(USER_ID)).willReturn(Optional.of(user));
        given(regionRepository.findById(2)).willReturn(Optional.of(valparaiso));
        given(userRepository.save(user)).willReturn(user);

        UserResponse response = authService.updateProfile(
                new UpdateProfileRequest(null, null, null, 2, null, null));

        assertThat(user.getRegion()).isEqualTo(valparaiso);
        assertThat(user.getComuna()).isNull();
        assertThat(response.comunaId()).isNull();
    }

    @Test
    void updateUserChangesRoleAndStatus() {
        User user = existingUser();
        given(userRepository.findById(USER_ID)).willReturn(Optional.of(user));
        given(roleRepository.findById(1)).willReturn(Optional.of(admin));
        given(userRepository.save(user)).willReturn(user);

        UserResponse response = authService.updateUser(USER_ID, new UpdateUserRequest(1, false));

        assertThat(response.roleName()).isEqualTo("ADMIN");
        assertThat(response.activo()).isFalse();
    }

    @Test
    void updateUserRejectsUnknownRole() {
        User user = existingUser();
        given(userRepository.findById(USER_ID)).willReturn(Optional.of(user));
        given(roleRepository.findById(99)).willReturn(Optional.empty());

        assertThatThrownBy(() -> authService.updateUser(USER_ID, new UpdateUserRequest(99, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Rol");
    }

    @Test
    void deleteUserPerformsLogicalDelete() {
        User user = existingUser();
        given(userRepository.findById(USER_ID)).willReturn(Optional.of(user));
        given(userRepository.save(user)).willReturn(user);

        UserResponse response = authService.deleteUser(USER_ID);

        assertThat(user.getActivo()).isFalse();
        assertThat(response.activo()).isFalse();
    }

    @Test
    void listUsersUsesSearchWhenQueryIsPresent() {
        given(userRepository.search("camila")).willReturn(List.of(existingUser()));

        List<UserResponse> users = authService.listUsers(" camila ");

        assertThat(users).hasSize(1);
        assertThat(users.getFirst().nombre()).isEqualTo("Camila");
    }

    @Test
    void listUsersReturnsAllOrderedByIdWhenQueryIsBlank() {
        given(userRepository.findAll(any(Sort.class))).willReturn(List.of(existingUser()));

        List<UserResponse> users = authService.listUsers("  ");

        assertThat(users).hasSize(1);
        verify(userRepository).findAll(any(Sort.class));
    }

    @Test
    void comunasExposeRegionId() {
        given(comunaRepository.findByRegionIdOrderByNameAsc(1)).willReturn(List.of(santiago));

        List<ComunaResponse> comunas = authService.comunas(1);

        assertThat(comunas).containsExactly(new ComunaResponse(1, "Santiago", 1));
    }

    @Test
    void adminRegisterAcceptsCustomerRole() {
        AdminRegisterRequest request = new AdminRegisterRequest("555555555", "nuevo@gmail.com", "clave123",
                "Nuevo", null, null, "CUSTOMER", null, null, null);

        given(userRepository.findByEmail("nuevo@gmail.com")).willReturn(Optional.empty());
        given(userRepository.existsByRun("555555555")).willReturn(false);
        given(roleRepository.findByName("CUSTOMER")).willReturn(Optional.of(customer));
        given(passwordEncoder.encode("clave123")).willReturn("encoded");
        given(userRepository.save(any(User.class))).willAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(USER_ID);
            return user;
        });
        given(jwtTokenProvider.generateToken(eq(USER_ID), eq("nuevo@gmail.com"), eq("Nuevo"), eq("CUSTOMER")))
                .willReturn("jwt-token");

        AuthResponse response = authService.registerAdmin(request);

        assertThat(response.rol()).isEqualTo("CUSTOMER");
        assertThat(response.usuario().roleId()).isEqualTo(3);
    }

    private User existingUser() {
        return User.builder()
                .id(USER_ID)
                .run("333333333")
                .email("camila@gmail.com")
                .password("encoded")
                .nombre("Camila")
                .apellidos("Rosales")
                .fechaNacimiento(LocalDate.of(1998, 3, 22))
                .role(customer)
                .region(metropolitana)
                .comuna(santiago)
                .direccion("Los Aromos 789")
                .activo(true)
                .build();
    }
}
