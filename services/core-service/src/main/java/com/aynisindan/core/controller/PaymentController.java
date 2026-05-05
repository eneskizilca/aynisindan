package com.aynisindan.core.controller;

import com.aynisindan.core.dto.response.PaymentResponse;
import com.aynisindan.core.model.entity.Payment;
import com.aynisindan.core.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;

    /**
     * GET /api/v1/payments/{orderId}
     * Belirli bir siparişe ait tüm ödeme kayıtlarını listeler.
     *
     * @param orderId path'ten gelen sipariş UUID'si
     * @return 200 OK + ödeme listesi
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByOrder(@PathVariable UUID orderId) {
        List<PaymentResponse> payments = paymentRepository.findByOrderId(orderId)
                .stream()
                .map(p -> new PaymentResponse(
                        p.getId(),
                        p.getOrderId(),
                        p.getAmount(),
                        p.getStatus().name(),
                        p.getCreatedAt()
                ))
                .toList();

        return ResponseEntity.ok(payments);
    }
}
