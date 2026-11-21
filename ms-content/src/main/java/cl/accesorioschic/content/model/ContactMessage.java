package cl.accesorioschic.content.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contact_messages")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ContactMessage {
    @Id
    private UUID id;
    @Column(nullable = false)
    private String nombre;
    private String apellido;
    @Column(nullable = false)
    private String email;
    @Column(nullable = false)
    private String mensaje;
    @Builder.Default
    private Boolean leido = false;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
