package cl.ecommerce.review.repository;

import cl.ecommerce.review.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByProductId(String productId);

    List<Review> findByUserId(String userId);

    Optional<Review> findByProductIdAndUserId(String productId, String userId);
}
