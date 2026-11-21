package cl.ecommerce.product.repository;

import cl.ecommerce.product.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoriteRepository extends JpaRepository<Favorite, UUID> {
    Optional<Favorite> findByUserIdAndProductId(String userId, UUID productId);
    List<Favorite> findByUserId(String userId);
    void deleteByUserIdAndProductId(String userId, UUID productId);
}
