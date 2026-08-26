package cl.ecommerce.review.service;

import cl.ecommerce.common.exception.BusinessException;
import cl.ecommerce.common.exception.NotFoundException;
import cl.ecommerce.review.dto.ReviewRequest;
import cl.ecommerce.review.dto.ReviewResponse;
import cl.ecommerce.review.model.Review;
import cl.ecommerce.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ReviewResponse createReview(ReviewRequest request) {
        if (request.rating() < 1 || request.rating() > 5) {
            throw new BusinessException("El rating debe ser entre 1 y 5");
        }

        if (reviewRepository.findByProductIdAndUserId(request.productId(), request.userId()).isPresent()) {
            throw new BusinessException("El usuario ya califico este producto");
        }

        Review review = Review.builder()
                .productId(request.productId())
                .userId(request.userId())
                .rating(request.rating())
                .comment(request.comment())
                .build();

        Review saved = reviewRepository.save(review);
        log.info("Review creada: {} para producto: {} por usuario: {}", saved.getId(), request.productId(), request.userId());

        Map<String, Object> event = Map.of(
                "reviewId", saved.getId().toString(),
                "productId", saved.getProductId(),
                "userId", saved.getUserId(),
                "rating", saved.getRating(),
                "createdAt", saved.getCreatedAt().toString()
        );
        kafkaTemplate.send("review.created", event);

        return ReviewResponse.fromEntity(saved);
    }

    public List<ReviewResponse> getReviewsByProduct(String productId) {
        return reviewRepository.findByProductId(productId).stream()
                .map(ReviewResponse::fromEntity)
                .toList();
    }

    public List<ReviewResponse> getReviewsByUser(String userId) {
        return reviewRepository.findByUserId(userId).stream()
                .map(ReviewResponse::fromEntity)
                .toList();
    }

    public double getAverageRating(String productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        if (reviews.isEmpty()) return 0.0;

        return Math.round(reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0) * 10.0) / 10.0;
    }

    public void deleteReview(UUID id) {
        if (!reviewRepository.existsById(id)) {
            throw new NotFoundException("Review no encontrada: " + id);
        }
        reviewRepository.deleteById(id);
        log.info("Review eliminada: {}", id);
    }
}
