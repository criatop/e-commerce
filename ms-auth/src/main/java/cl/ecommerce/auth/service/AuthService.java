package cl.ecommerce.auth.service;

import cl.ecommerce.auth.dto.AdminRegisterRequest;
import cl.ecommerce.auth.dto.AuthResponse;
import cl.ecommerce.auth.dto.LoginRequest;
import cl.ecommerce.auth.dto.RegisterRequest;
import cl.ecommerce.auth.model.Role;
import cl.ecommerce.auth.model.User;
import cl.ecommerce.auth.repository.RoleRepository;
import cl.ecommerce.auth.repository.UserRepository;
import cl.ecommerce.common.exception.BusinessException;
import cl.ecommerce.common.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BusinessException("El email ya está registrado");
        }

        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new BusinessException("Rol CUSTOMER no encontrado"));

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .nombre(request.nombre())
                .role(customerRole)
                .activo(true)
                .build();

        User saved = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(saved.getEmail(), saved.getNombre(), saved.getRole().getName());

        return AuthResponse.builder()
                .token(token)
                .email(saved.getEmail())
                .nombre(saved.getNombre())
                .rol(saved.getRole().getName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException("Credenciales inválidas");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getNombre(), user.getRole().getName());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .nombre(user.getNombre())
                .rol(user.getRole().getName())
                .build();
    }

    public AuthResponse registerAdmin(AdminRegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BusinessException("El email ya está registrado");
        }

        Role role = roleRepository.findByName(request.rol())
                .orElseThrow(() -> new BusinessException("Rol " + request.rol() + " no encontrado"));

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .nombre(request.nombre())
                .role(role)
                .activo(true)
                .build();

        User saved = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(saved.getEmail(), saved.getNombre(), saved.getRole().getName());

        return AuthResponse.builder()
                .token(token)
                .email(saved.getEmail())
                .nombre(saved.getNombre())
                .rol(saved.getRole().getName())
                .build();
    }
}
