package com.aynisindan.core.repository;

import com.aynisindan.core.model.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    /**
     * Belirli bir siparişe ait tüm ödeme kayıtlarını getirir.
     */
    List<Payment> findByOrderId(UUID orderId);

    /**
     * Belirli bir siparişe ait en güncel (ilk) ödeme kaydını getirir.
     */
    Optional<Payment> findFirstByOrderId(UUID orderId);
}
