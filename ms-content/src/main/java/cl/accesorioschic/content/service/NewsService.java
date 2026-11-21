package cl.accesorioschic.content.service;

import cl.accesorioschic.content.dto.NewsResponse;
import cl.accesorioschic.content.model.News;
import cl.accesorioschic.content.model.NewsParagraph;
import cl.accesorioschic.content.repository.NewsRepository;
import cl.ecommerce.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NewsService {
    private final NewsRepository newsRepository;

    public Page<NewsResponse> list(Pageable pageable) {
        return newsRepository.findByPublicadaTrueOrderByFechaDesc(pageable).map(this::toResponse);
    }

    public NewsResponse getBySlug(String slug) {
        News news = newsRepository.findBySlugAndPublicadaTrue(slug)
                .orElseThrow(() -> new NotFoundException("Noticia no encontrada: " + slug));
        return toResponse(news);
    }

    public NewsResponse toResponse(News news) {
        List<String> parrafos = news.getParagraphs() == null ? List.of() :
                news.getParagraphs().stream()
                        .sorted(Comparator.comparing(p -> p.getOrden() == null ? Integer.MAX_VALUE : p.getOrden()))
                        .map(NewsParagraph::getTexto)
                        .toList();
        return new NewsResponse(
                news.getId(),
                news.getTitulo(),
                news.getResumen(),
                news.getImagenUrl(),
                news.getFecha(),
                news.getSlug(),
                news.getCategoria(),
                news.getAutor(),
                parrafos
        );
    }
}
