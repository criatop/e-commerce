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
public class ErrorResponse {
    private String error;
    private String mensaje;
    private int codigo;
    private LocalDateTime timestamp;

    public static ErrorResponse of(String error, String mensaje, int codigo) {
        return ErrorResponse.builder()
                .error(error)
                .mensaje(mensaje)
                .codigo(codigo)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
