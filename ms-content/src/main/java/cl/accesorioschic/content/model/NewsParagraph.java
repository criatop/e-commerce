package cl.accesorioschic.content.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "news_paragraphs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NewsParagraph {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "news_id", nullable = false)
    private News news;
    @Column(nullable = false)
    private Integer orden;
    @Column(nullable = false)
    private String texto;
}
