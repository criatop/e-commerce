package cl.ecommerce.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "regions")
public class Region {

    /** Id asignado manualmente: debe coincidir con el seed del frontend (1-16). */
    @Id
    private Integer id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private Integer orden;
}
