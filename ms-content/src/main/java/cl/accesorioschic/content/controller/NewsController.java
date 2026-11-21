package cl.accesorioschic.content.controller;

import cl.accesorioschic.content.dto.NewsResponse;
import cl.accesorioschic.content.service.NewsService;
import cl.ecommerce.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;

    @GetMapping
    public ApiResponse<Page<NewsResponse>> list(Pageable pageable) {
        return ApiResponse.ok(newsService.list(pageable));
    }

    @GetMapping("/{slug}")
    public ApiResponse<NewsResponse> get(@PathVariable String slug) {
        return ApiResponse.ok(newsService.getBySlug(slug));
    }
}
