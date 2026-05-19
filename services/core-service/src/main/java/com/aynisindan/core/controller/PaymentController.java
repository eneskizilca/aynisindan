package com.aynisindan.core.controller;

import com.aynisindan.core.dto.response.PaymentResponse;
import com.aynisindan.core.model.entity.Payment;
import com.aynisindan.core.repository.PaymentRepository;
import com.aynisindan.core.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

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

    /**
     * POST /api/v1/payments/{orderId}/hold
     * Müşteri tarafından sipariş için Param-Güvende ödemesi başlatılır.
     *
     * @param orderId siparişin UUID'si
     * @return 201 Created + oluşturulan ödeme kaydı
     */
    @PostMapping("/{orderId}/hold")
    public ResponseEntity<PaymentResponse> holdFunds(@PathVariable UUID orderId) {
        PaymentResponse response = paymentService.holdFundsForOrder(orderId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/payments/my
     * Kullanıcının tüm ödeme kayıtlarını getirir.
     *
     * @return 200 OK + ödeme listesi
     */
    @GetMapping("/my")
    public ResponseEntity<List<PaymentResponse>> getMyPayments() {
        return ResponseEntity.ok(paymentService.getMyPayments());
    }
}
