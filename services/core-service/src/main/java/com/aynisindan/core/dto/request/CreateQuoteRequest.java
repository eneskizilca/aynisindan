package com.aynisindan.core.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Zanaatkar tarafından yeni teklif oluşturma isteği için DTO.
 */
public record CreateQuoteRequest(
        UUID orderId,
        UUID artisanId,
        BigDecimal offeredPrice,
        Integer estimatedDays
) {}
