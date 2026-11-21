package cl.ecommerce.auth.repository;

import cl.ecommerce.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByRun(String run);

    /**
     * Busca por RUN, email, nombre o apellidos sin distinguir mayusculas.
     */
    @Query("""
            select u from User u
            where lower(u.run) like lower(concat('%', :q, '%'))
               or lower(u.email) like lower(concat('%', :q, '%'))
               or lower(u.nombre) like lower(concat('%', :q, '%'))
               or lower(coalesce(u.apellidos, '')) like lower(concat('%', :q, '%'))
            order by u.id
            """)
    List<User> search(@Param("q") String q);
}
