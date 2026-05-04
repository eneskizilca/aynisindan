package com.aynisindan.core.service;

import com.aynisindan.core.dto.request.CreateQuoteRequest;
import com.aynisindan.core.dto.response.QuoteResponse;

import java.util.UUID;

public interface QuoteService {

    /**
     * Zanaatkar tarafından bir siparişe yeni teklif oluşturur.
     * Teklif durumu otomatik olarak PENDING set edilir.
     *
     * @param request teklif oluşturma isteği
     * @return oluşturulan teklifin DTO karşılığı
     */
    QuoteResponse createQuote(CreateQuoteRequest request);

    /**
     * Verilen ID'li teklifi kabul eder.
     * Bağlı siparişin durumu IN_PROGRESS yapılır, agreedPrice ve artisan güncellenir.
     * Aynı siparişe ait diğer tüm teklifler otomatik REJECTED edilir.
     *
     * @param quoteId kabul edilecek teklifin UUID'si
     * @return güncellenen teklifin DTO karşılığı
     */
    QuoteResponse acceptQuote(UUID quoteId);
}
