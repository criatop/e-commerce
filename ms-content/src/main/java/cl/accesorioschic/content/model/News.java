package cl.accesorioschic.content.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "news")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class News {
    @Id
    private UUID id;
    @Column(nullable = false)
    private String titulo;
    private String resumen;
    @Column(name = "imagen_url")
    private String imagenUrl;
    private LocalDate fecha;
    @Column(nullable = false, unique = true)
    private String slug;
    private String categoria;
    private String autor;
    @Builder.Default
    private Boolean publicada = true;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @OneToMany(mappedBy = "news", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<NewsParagraph> paragraphs = new ArrayList<>();
}
