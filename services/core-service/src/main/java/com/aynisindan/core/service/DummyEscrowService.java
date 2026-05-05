package com.aynisindan.core.service;

import java.math.BigDecimal;
import java.util.UUID;

public interface DummyEscrowService {

    /**
     * Belirtilen tutarı sipariş için havuz hesabına alır.
     * Yeni bir Payment kaydı oluşturur, statüsünü HELD_IN_ESCROW yapar.
     *
     * @param orderId ödemenin bağlı olduğu siparişin UUID'si
     * @param amount  havuza alınacak tutar
     */
    void holdFunds(UUID orderId, BigDecimal amount);

    /**
     * Havuzdaki tutarı zanaatkara serbest bırakır.
     * İlgili Payment kaydını RELEASED_TO_ARTISAN statüsüne günceller.
     *
     * @param orderId ödemenin bağlı olduğu siparişin UUID'si
     */
    void releaseFunds(UUID orderId);
}
