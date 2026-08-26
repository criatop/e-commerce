package cl.ecommerce.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean exitoso;
    private T datos;
    private String mensaje;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> ok(T datos) {
        return ApiResponse.<T>builder()
                .exitoso(true)
                .datos(datos)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> ok(T datos, String mensaje) {
        return ApiResponse.<T>builder()
                .exitoso(true)
                .datos(datos)
                .mensaje(mensaje)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String mensaje) {
        return ApiResponse.<T>builder()
                .exitoso(false)
                .mensaje(mensaje)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
