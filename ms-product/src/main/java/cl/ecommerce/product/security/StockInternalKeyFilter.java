package cl.ecommerce.product.security;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Set;

/**
 * Exige la cabecera compartida {@code X-Internal-Key} en las operaciones de stock
 * que invoca {@code ms-order} durante el checkout. Un token de cliente valido no
 * basta: sin la clave, cualquier comprador podria reservar o liberar inventario ajeno.
 */
@Component
public class StockInternalKeyFilter extends OncePerRequestFilter {

    public static final String INTERNAL_KEY_HEADER = "X-Internal-Key";

    private static final Set<String> RUTAS_PROTEGIDAS = Set.of(
            "/api/v1/products/stock/reserve",
            "/api/v1/products/stock/confirm",
            "/api/v1/products/stock/release");

    private final String internalKey;
    private final ObjectMapper objectMapper;

    public StockInternalKeyFilter(
            @Value("${internal.key:${INTERNAL_KEY:accesorios-chic-internal}}") String internalKey,
            ObjectMapper objectMapper) {
        this.internalKey = internalKey;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (!protegida(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String recibida = request.getHeader(INTERNAL_KEY_HEADER);
        if (recibida == null || !coincide(recibida)) {
            escribirForbidden(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean protegida(HttpServletRequest request) {
        return "POST".equalsIgnoreCase(request.getMethod())
                && RUTAS_PROTEGIDAS.contains(ruta(request));
    }

    private String ruta(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String contexto = request.getContextPath();
        return contexto != null && !contexto.isEmpty() && uri.startsWith(contexto)
                ? uri.substring(contexto.length())
                : uri;
    }

    private boolean coincide(String recibida) {
        return MessageDigest.isEqual(
                internalKey.getBytes(StandardCharsets.UTF_8),
                recibida.getBytes(StandardCharsets.UTF_8));
    }

    private void escribirForbidden(HttpServletResponse response) throws IOException {
        ErrorResponse detalle = ErrorResponse.of("SERVICE_ONLY",
                "Operacion exclusiva entre servicios internos", HttpServletResponse.SC_FORBIDDEN);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(response.getWriter(), ApiResponse.error(detalle.getMensaje(), detalle));
    }
}
