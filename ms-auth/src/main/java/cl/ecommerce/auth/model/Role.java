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
@Table(name = "roles")
public class Role {

    /** Id asignado manualmente en el script: 1=ADMIN, 2=SELLER, 3=CUSTOMER. */
    @Id
    private Integer id;

    @Column(unique = true, nullable = false)
    private String name;
}
