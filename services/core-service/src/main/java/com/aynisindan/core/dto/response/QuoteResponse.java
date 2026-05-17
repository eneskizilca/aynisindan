package com.aynisindan.core.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Teklif sorgularında istemciye dönen DTO.
 * Artisan ve Order ilişkileri UUID olarak özetlenir; tam detay için ayrı endpoint kullanılır.
 */
public record QuoteResponse(
        UUID id,
        UUID orderId,
        UUID artisanId,
        String artisanName,
        BigDecimal offeredPrice,
        Integer estimatedDays,
        String message,
        String status,
        LocalDateTime createdAt
) {}
