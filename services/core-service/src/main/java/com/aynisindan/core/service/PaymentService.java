package com.aynisindan.core.service;

import com.aynisindan.core.dto.response.PaymentResponse;

import java.util.List;
import java.util.UUID;

public interface PaymentService {

    /**
     * Müşteri tarafından sipariş için havuz ödemesi başlatır.
     * Sipariş sahibi olma kontrolü yapar, ardından escrow servisini çağırır.
     *
     * @param orderId siparişin UUID'si
     * @return oluşturulan ödeme kaydı
     */
    PaymentResponse holdFundsForOrder(UUID orderId);

    /**
     * Kullanıcının tüm ödeme kayıtlarını getirir.
     * Müşteri ise kendi siparişlerinin ödemelerini,
     * Zanaatkâr ise kendisine ait siparişlerin ödemelerini döner.
     */
    List<PaymentResponse> getMyPayments();
}
