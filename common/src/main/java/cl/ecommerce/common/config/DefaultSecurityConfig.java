package cl.ecommerce.common.config;

import cl.ecommerce.common.security.JwtAuthenticationFilter;
import cl.ecommerce.common.security.JwtTokenProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class DefaultSecurityConfig {

    @Bean
    @ConditionalOnMissingBean(SecurityFilterChain.class)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http,
                                                          JwtTokenProvider tokenProvider) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**", "/actuator/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // Catálogo público: ver productos
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/v1/products/**").permitAll()

                        // Guest checkout: armar carrito y pagar sin sesión
                        .requestMatchers(HttpMethod.POST, "/api/cart/**", "/api/v1/cart/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/cart/**", "/api/v1/cart/**").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/cart/**", "/api/v1/cart/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/orders/**", "/api/v1/orders/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/payments/**", "/api/v1/payments/**").permitAll()

                        // Integración interna entre servicios (Feign, sin token de usuario):
                        // ms-payment -> ms-order (PAID)
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/status", "/api/v1/orders/*/status").permitAll()

                        // Resto (lecturas de historial, management) requiere token
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new JwtAuthenticationFilter(tokenProvider),
                        UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}