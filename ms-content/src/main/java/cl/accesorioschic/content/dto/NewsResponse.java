package cl.accesorioschic.content.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record NewsResponse(
        UUID id,
        String titulo,
        String resumen,
        String imagen,
        LocalDate fecha,
        String slug,
        String categoria,
        String autor,
        List<String> parrafos
) {}
