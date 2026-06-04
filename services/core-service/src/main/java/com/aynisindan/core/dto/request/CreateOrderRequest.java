package com.aynisindan.core.dto.request;

import java.util.UUID;

/**
 * Yeni siparis olusturma istegi icin DTO.
 */
public record CreateOrderRequest(
        String title,
        String description,
        String referenceImageUrl,
        String aiGeneratedImageUrl
) {}
