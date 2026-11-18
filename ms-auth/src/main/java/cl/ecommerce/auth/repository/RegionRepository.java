package cl.ecommerce.auth.repository;

import cl.ecommerce.auth.model.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegionRepository extends JpaRepository<Region, Integer> {

    List<Region> findAllByOrderByOrdenAsc();
}
