package com.aynisindan.core.repository;

import com.aynisindan.core.model.entity.Payment;
import com.aynisindan.core.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByOrderId(UUID orderId);

    Optional<Payment> findFirstByOrderId(UUID orderId);

    Optional<Payment> findByOrderIdAndStatus(UUID orderId, PaymentStatus status);
}
