package cl.accesorioschic.content.service;

import cl.accesorioschic.content.dto.NewsResponse;
import cl.accesorioschic.content.model.News;
import cl.accesorioschic.content.model.NewsParagraph;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class NewsServiceTest {

    @Test
    void parrafosSeDevuelvenEnOrden() {
        NewsService service = new NewsService(null);
        News news = News.builder()
                .id(UUID.randomUUID())
                .titulo("T")
                .resumen("R")
                .imagenUrl("img")
                .fecha(LocalDate.of(2026,1,1))
                .slug("t")
                .categoria("C")
                .autor("A")
                .publicada(true)
                .paragraphs(new ArrayList<>(List.of(
                        NewsParagraph.builder().orden(3).texto("tercero").build(),
                        NewsParagraph.builder().orden(1).texto("primero").build(),
                        NewsParagraph.builder().orden(2).texto("segundo").build()
                )))
                .build();

        NewsResponse r = service.toResponse(news);

        assertEquals(List.of("primero", "segundo", "tercero"), r.parrafos());
    }
}
