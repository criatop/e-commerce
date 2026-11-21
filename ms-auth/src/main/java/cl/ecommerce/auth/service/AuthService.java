package cl.ecommerce.auth.service;

import cl.ecommerce.auth.dto.AdminRegisterRequest;
import cl.ecommerce.auth.dto.AuthResponse;
import cl.ecommerce.auth.dto.ComunaResponse;
import cl.ecommerce.auth.dto.LoginRequest;
import cl.ecommerce.auth.dto.RegisterRequest;
import cl.ecommerce.auth.dto.RegionResponse;
import cl.ecommerce.auth.dto.RoleResponse;
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
import cl.ecommerce.common.exception.NotFoundException;
import cl.ecommerce.common.security.JwtTokenProvider;
import cl.ecommerce.common.security.SecurityUtils;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RegionRepository regionRepository;
    private final ComunaRepository comunaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       RegionRepository regionRepository,
                       ComunaRepository comunaRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.regionRepository = regionRepository;
        this.comunaRepository = comunaRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        ensureEmailAvailable(request.email());
        ensureRunAvailable(request.run());

        Role customerRole = findRole("CUSTOMER");

        User user = User.builder()
                .run(request.run().trim())
                .email(request.email().trim())
                .password(passwordEncoder.encode(request.password()))
                .nombre(request.nombre().trim())
                .apellidos(trimToNull(request.apellidos()))
                .fechaNacimiento(request.fechaNacimiento())
                .role(customerRole)
                .direccion(trimToNull(request.direccion()))
                .activo(true)
                .build();
        applyLocation(user, request.regionId(), request.comunaId());

        return buildAuthResponse(userRepository.save(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Credenciales invalidas"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())
                || Boolean.FALSE.equals(user.getActivo())) {
            throw new BusinessException("Credenciales invalidas");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse registerAdmin(AdminRegisterRequest request) {
        ensureEmailAvailable(request.email());
        ensureRunAvailable(request.run());

        Role role = findRole(request.rol());

        User user = User.builder()
                .run(request.run().trim())
                .email(request.email().trim())
                .password(passwordEncoder.encode(request.password()))
                .nombre(request.nombre().trim())
                .apellidos(trimToNull(request.apellidos()))
                .fechaNacimiento(request.fechaNacimiento())
                .role(role)
                .direccion(trimToNull(request.direccion()))
                .activo(true)
                .build();
        applyLocation(user, request.regionId(), request.comunaId());

        return buildAuthResponse(userRepository.save(user));
    }

    /**
     * Perfil del usuario autenticado, leido desde la base con el uid del token.
     */
    public UserResponse me() {
        return toResponse(currentUser());
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = currentUser();

        if (request.nombre() != null) {
            if (request.nombre().isBlank()) {
                throw new BusinessException("El nombre no puede estar vacio");
            }
            user.setNombre(request.nombre().trim());
        }
        if (request.apellidos() != null) {
            user.setApellidos(trimToNull(request.apellidos()));
        }
        if (request.fechaNacimiento() != null) {
            user.setFechaNacimiento(request.fechaNacimiento());
        }
        if (request.direccion() != null) {
            user.setDireccion(trimToNull(request.direccion()));
        }
        applyLocation(user, request.regionId(), request.comunaId());

        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> listUsers(String q) {
        List<User> users = (q == null || q.isBlank())
                ? userRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                : userRepository.search(q.trim());
        return users.stream().map(this::toResponse).toList();
    }

    public UserResponse getUser(Long id) {
        return toResponse(findUser(id));
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findUser(id);

        if (request.roleId() != null && !request.roleId().equals(user.getRole().getId())) {
            Role role = roleRepository.findById(request.roleId())
                    .orElseThrow(() -> new BusinessException("Rol no encontrado"));
            // El token vigente conserva el rol anterior hasta que el usuario vuelva a iniciar sesion.
            user.setRole(role);
        }
        if (request.activo() != null) {
            user.setActivo(request.activo());
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse deleteUser(Long id) {
        User user = findUser(id);
        user.setActivo(false);
        return toResponse(userRepository.save(user));
    }

    public List<RegionResponse> regions() {
        return regionRepository.findAllByOrderByOrdenAsc().stream()
                .map(region -> new RegionResponse(region.getId(), region.getName()))
                .toList();
    }

    public List<ComunaResponse> comunas(Integer regionId) {
        return comunaRepository.findByRegionIdOrderByNameAsc(regionId).stream()
                .map(comuna -> new ComunaResponse(comuna.getId(), comuna.getName(), comuna.getRegion().getId()))
                .toList();
    }

    public List<RoleResponse> roles() {
        return roleRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(role -> new RoleResponse(role.getId(), role.getName()))
                .toList();
    }

    private User currentUser() {
        return userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    private Role findRole(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new BusinessException("Rol " + name + " no encontrado"));
    }

    private void ensureEmailAvailable(String email) {
        if (userRepository.findByEmail(email.trim()).isPresent()) {
            throw new BusinessException("El email ya esta registrado");
        }
    }

    private void ensureRunAvailable(String run) {
        if (userRepository.existsByRun(run.trim())) {
            throw new BusinessException("El RUN ya esta registrado");
        }
    }

    /**
     * Aplica region/comuna validando que la comuna pertenezca a la region.
     * Un regionId nulo sin comunaId conserva la ubicacion actual (edicion de perfil).
     */
    private void applyLocation(User user, Integer regionId, Integer comunaId) {
        Region region = user.getRegion();
        Comuna comuna = user.getComuna();

        if (regionId != null) {
            region = regionRepository.findById(regionId)
                    .orElseThrow(() -> new BusinessException("Region no encontrada"));
        }

        if (comunaId != null) {
            comuna = comunaRepository.findById(comunaId)
                    .orElseThrow(() -> new BusinessException("Comuna no encontrada"));
            if (region != null && !region.getId().equals(comuna.getRegion().getId())) {
                throw new BusinessException("La comuna no pertenece a la region seleccionada");
            }
            region = comuna.getRegion();
        } else if (regionId != null && comuna != null
                && !comuna.getRegion().getId().equals(region.getId())) {
            comuna = null;
        }

        user.setRegion(region);
        user.setComuna(comuna);
    }

    private AuthResponse buildAuthResponse(User user) {
        String roleName = user.getRole().getName();
        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getEmail(), user.getNombre(), roleName);
        return new AuthResponse(token, toResponse(user), roleName);
    }

    private UserResponse toResponse(User user) {
        Role role = user.getRole();
        Region region = user.getRegion();
        Comuna comuna = user.getComuna();

        return new UserResponse(
                user.getId(),
                user.getRun(),
                user.getNombre(),
                user.getApellidos(),
                user.getEmail(),
                user.getFechaNacimiento(),
                role != null ? role.getId() : null,
                role != null ? role.getName() : null,
                region != null ? region.getId() : null,
                region != null ? region.getName() : null,
                comuna != null ? comuna.getId() : null,
                comuna != null ? comuna.getName() : null,
                user.getDireccion(),
                user.getActivo()
        );
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
