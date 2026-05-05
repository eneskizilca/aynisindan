package com.aynisindan.core.dto.request;

import java.util.UUID;

/**
 * Siparişi tamamlama (teslim) isteği için DTO.
 * Not: artisanId şimdilik request body'den alınıyor;
 *      JWT entegrasyonundan sonra token'dan okunacak.
 */
public record CompleteOrderRequest(
        UUID artisanId
) {}
