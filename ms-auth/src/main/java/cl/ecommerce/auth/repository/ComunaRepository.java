package cl.ecommerce.auth.repository;

import cl.ecommerce.auth.model.Comuna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComunaRepository extends JpaRepository<Comuna, Integer> {

    List<Comuna> findByRegionIdOrderByNameAsc(Integer regionId);
}
