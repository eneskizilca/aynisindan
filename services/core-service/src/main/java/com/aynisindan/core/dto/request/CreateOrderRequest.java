package com.aynisindan.core.dto.request;

import java.util.UUID;

/**
 * Yeni sipariş oluşturma isteği için DTO.
 */
public record CreateOrderRequest(
        UUID customerId,
        String title,
        String description,
        String referenceImageUrl
) {}
