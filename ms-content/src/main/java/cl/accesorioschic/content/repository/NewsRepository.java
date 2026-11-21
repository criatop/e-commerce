package cl.accesorioschic.content.repository;

import cl.accesorioschic.content.model.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface NewsRepository extends JpaRepository<News, UUID> {
    Page<News> findByPublicadaTrueOrderByFechaDesc(Pageable pageable);
    Optional<News> findBySlugAndPublicadaTrue(String slug);
}
