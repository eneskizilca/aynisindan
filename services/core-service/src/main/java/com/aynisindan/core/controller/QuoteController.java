package com.aynisindan.core.controller;

import java.util.UUID;
import com.aynisindan.core.dto.request.CreateQuoteRequest;
import com.aynisindan.core.dto.response.QuoteResponse;
import com.aynisindan.core.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quotes")
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteService quoteService;

    /**
     * POST /api/v1/quotes
     * Zanaatkar tarafından bir siparişe yeni teklif oluşturur.
     *
     * @param request body'den gelen CreateQuoteRequest
     * @return 201 Created + oluşturulan QuoteResponse
     */
    @PostMapping
    public ResponseEntity<QuoteResponse> createQuote(@RequestBody CreateQuoteRequest request) {
        QuoteResponse response = quoteService.createQuote(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/v1/quotes/{quoteId}/accept
     * Müşteri tarafından bir teklifi kabul eder.
     * Bağlı sipariş IN_PROGRESS yapılır, diğer teklifler REJECTED edilir.
     *
     * @param quoteId kabul edilecek teklifin UUID'si
     * @return 200 OK + güncellenmiş QuoteResponse
     */
    @PostMapping("/{quoteId}/accept")
    public ResponseEntity<QuoteResponse> acceptQuote(@PathVariable UUID quoteId) {
        QuoteResponse response = quoteService.acceptQuote(quoteId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/quotes/order/{orderId}
     * Siparişe ait tüm teklifleri getirir.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<java.util.List<QuoteResponse>> getQuotesByOrder(@PathVariable UUID orderId) {
        return ResponseEntity.ok(quoteService.getQuotesByOrder(orderId));
    }
}
