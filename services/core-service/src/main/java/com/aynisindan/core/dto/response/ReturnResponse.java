package com.aynisindan.core.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ReturnResponse(
        UUID id,
        UUID orderId,
        String orderTitle,
        UUID artisanId,
        String artisanName,
        UUID customerId,
        String customerName,
        String reason,
        String status,
        BigDecimal amount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
