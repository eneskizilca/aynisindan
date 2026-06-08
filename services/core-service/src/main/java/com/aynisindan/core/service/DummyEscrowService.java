package com.aynisindan.core.service;

import java.math.BigDecimal;
import java.util.UUID;

public interface DummyEscrowService {

    void holdFunds(UUID orderId, BigDecimal amount);

    void releaseFunds(UUID orderId);

    void refundFunds(UUID orderId);
}
