package com.aynisindan.core.model.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Müşteri değerlendirmesi.
 * orderId, doğrudan UUID olarak saklanır — Payment entity ile aynı mimari karar:
 * ileride ayrı bir review-service'e taşınırken Order entity bağımlılığı kalmaz.
 */
@Entity
@Table(name = "reviews")
@EntityListeners(AuditingEntityListener.class)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    /**
     * Her sipariş için en fazla bir değerlendirme olabilir.
     * unique = true kısıtı veritabanı seviyesinde de bunu garantiler.
     */
    @Column(nullable = false, unique = true)
    private UUID orderId;

    /** 1-5 arası puanlama. Kısıt kontrolü service katmanında yapılır. */
    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ─── Constructors ──────────────────────────────────────────────────────────

    public Review() {}

    public Review(UUID orderId, Integer rating, String comment) {
        this.orderId = orderId;
        this.rating = rating;
        this.comment = comment;
    }

    // ─── Getters & Setters ─────────────────────────────────────────────────────

    public UUID getId() {
        return id;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
