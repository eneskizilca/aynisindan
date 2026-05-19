package com.aynisindan.core.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String title,
        String description,
        String referenceImageUrl,
        String status,
        UUID customerId,
        String customerName,
        String artisanName,
        BigDecimal agreedPrice,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Boolean hasActiveReturn
) {}
