package com.aynisindan.core.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Ödeme sorgularında istemciye dönen DTO.
 */
public record PaymentResponse(
        UUID id,
        UUID orderId,
        BigDecimal amount,
        String status,
        LocalDateTime createdAt
) {}
