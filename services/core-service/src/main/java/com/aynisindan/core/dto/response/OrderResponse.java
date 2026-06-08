package com.aynisindan.core.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Siparis sorgularinda istemciye donen DTO.
 * Entity'nin hassas/gereksiz alanlari burada gizlenir.
 */
public record OrderResponse(
        UUID id,
        String title,
        String description,
        String referenceImageUrl,
        String aiGeneratedImageUrl,
        String status,
        UUID customerId,
        String customerName,
        String artisanName,
        BigDecimal agreedPrice,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Boolean hasActiveReturn
) {}
