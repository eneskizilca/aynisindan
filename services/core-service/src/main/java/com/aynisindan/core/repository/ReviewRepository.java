package com.aynisindan.core.repository;

import com.aynisindan.core.model.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    /**
     * Verilen sipariş ID'si için daha önce değerlendirme yapılıp yapılmadığını kontrol eder.
     */
    boolean existsByOrderId(UUID orderId);

    /**
     * Verilen sipariş ID'si için değerlendirmeyi getirir.
     */
    Optional<Review> findByOrderId(UUID orderId);

    /**
     * Verilen zanaatkarın tüm değerlendirmelerini getirir.
     */
    List<Review> findByArtisanId(UUID artisanId);

    /**
     * Verilen zanaatkarın ortalama puanını hesaplar.
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.artisanId = :artisanId")
    Double findAverageRatingByArtisanId(@Param("artisanId") UUID artisanId);

    /**
     * Verilen zanaatkarın toplam değerlendirme sayısını döner.
     */
    long countByArtisanId(UUID artisanId);
}
