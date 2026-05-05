package com.aynisindan.core.repository;

import com.aynisindan.core.model.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    /**
     * Verilen sipariş ID'si için daha önce değerlendirme yapılıp yapılmadığını kontrol eder.
     */
    boolean existsByOrderId(UUID orderId);
}
