package com.aynisindan.core.dto.request;

/**
 * Tamamlanan bir sipariş için değerlendirme oluşturma isteği.
 * orderId path variable'dan alındığı için burada yer almaz.
 */
public record CreateReviewRequest(
        Integer rating,
        String comment
) {}
