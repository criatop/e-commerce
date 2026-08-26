package cl.ecommerce.review.controller;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.review.dto.ReviewRequest;
import cl.ecommerce.review.dto.ReviewResponse;
import cl.ecommerce.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(@Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(reviewService.createReview(request), "Review creada exitosamente"));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByProduct(@PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviewsByProduct(productId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviewsByUser(userId)));
    }

    @GetMapping("/product/{productId}/average")
    public ResponseEntity<ApiResponse<Double>> getAverageRating(@PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getAverageRating(productId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Review eliminada exitosamente"));
    }
}
