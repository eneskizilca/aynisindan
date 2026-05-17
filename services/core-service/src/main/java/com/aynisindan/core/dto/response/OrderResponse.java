package com.aynisindan.core.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Sipariş sorgularında istemciye dönen DTO.
 * Entity'nin hassas/gereksiz alanları burada gizlenir.
 */
public record OrderResponse(
        UUID id,
        String title,
        String description,
        String referenceImageUrl,
        String status,
        UUID customerId,
        String customerName,
        String artisanName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
