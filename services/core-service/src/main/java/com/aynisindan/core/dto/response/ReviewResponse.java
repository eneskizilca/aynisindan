package com.aynisindan.core.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Değerlendirme sorgularında istemciye dönen DTO.
 */
public record ReviewResponse(
        UUID id,
        UUID orderId,
        UUID artisanId,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {}
