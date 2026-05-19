package com.aynisindan.core.controller;

import com.aynisindan.core.dto.response.ReviewResponse;
import com.aynisindan.core.model.entity.Review;
import com.aynisindan.core.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;

    /**
     * GET /api/v1/reviews/order/{orderId}
     * Bir siparişin değerlendirmesini getirir.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ReviewResponse> getReviewByOrder(@PathVariable UUID orderId) {
        return reviewRepository.findByOrderId(orderId)
                .map(review -> ResponseEntity.ok(new ReviewResponse(
                        review.getId(),
                        review.getOrderId(),
                        review.getArtisanId(),
                        review.getRating(),
                        review.getComment(),
                        review.getCreatedAt()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/reviews/artisan/{artisanId}
     * Bir zanaatkarın tüm değerlendirmelerini getirir.
     */
    @GetMapping("/artisan/{artisanId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByArtisan(@PathVariable UUID artisanId) {
        List<ReviewResponse> reviews = reviewRepository.findByArtisanId(artisanId)
                .stream()
                .map(review -> new ReviewResponse(
                        review.getId(),
                        review.getOrderId(),
                        review.getArtisanId(),
                        review.getRating(),
                        review.getComment(),
                        review.getCreatedAt()
                ))
                .toList();
        return ResponseEntity.ok(reviews);
    }

    /**
     * GET /api/v1/reviews/artisan/{artisanId}/stats
     * Bir zanaatkarın ortalama puan ve toplam değerlendirme sayısını getirir.
     */
    @GetMapping("/artisan/{artisanId}/stats")
    public ResponseEntity<Map<String, Object>> getArtisanStats(@PathVariable UUID artisanId) {
        Double avgRating = reviewRepository.findAverageRatingByArtisanId(artisanId);
        long count = reviewRepository.countByArtisanId(artisanId);

        return ResponseEntity.ok(Map.of(
                "averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
                "reviewCount", count
        ));
    }
}
