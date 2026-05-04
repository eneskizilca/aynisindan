package com.aynisindan.core.service;

import com.aynisindan.core.dto.request.CreateQuoteRequest;
import com.aynisindan.core.dto.response.QuoteResponse;
import com.aynisindan.core.model.entity.Order;
import com.aynisindan.core.model.entity.Quote;
import com.aynisindan.core.model.entity.User;
import com.aynisindan.core.model.enums.OrderStatus;
import com.aynisindan.core.model.enums.QuoteStatus;
import com.aynisindan.core.repository.OrderRepository;
import com.aynisindan.core.repository.QuoteRepository;
import com.aynisindan.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuoteServiceImpl implements QuoteService {

    private final QuoteRepository quoteRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Quote entity'sini QuoteResponse DTO'suna dönüştürür.
     * İlişkili entity'lerden sadece UUID'leri alarak lazy-load sorunlarını önler.
     */
    private QuoteResponse toResponse(Quote quote) {
        return new QuoteResponse(
                quote.getId(),
                quote.getOrder().getId(),
                quote.getArtisan().getId(),
                quote.getOfferedPrice(),
                quote.getEstimatedDays(),
                quote.getStatus().name(),
                quote.getCreatedAt()
        );
    }

    // ─── Service Methods ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public QuoteResponse createQuote(CreateQuoteRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new RuntimeException(
                        "Sipariş bulunamadı. ID: " + request.orderId()));

        User artisan = userRepository.findById(request.artisanId())
                .orElseThrow(() -> new RuntimeException(
                        "Zanaatkar bulunamadı. ID: " + request.artisanId()));

        Quote quote = new Quote();
        quote.setOrder(order);
        quote.setArtisan(artisan);
        quote.setOfferedPrice(request.offeredPrice());
        quote.setEstimatedDays(request.estimatedDays());
        quote.setStatus(QuoteStatus.PENDING);

        return toResponse(quoteRepository.save(quote));
    }

    @Override
    @Transactional
    public QuoteResponse acceptQuote(UUID quoteId) {
        // 1. Teklifi bul
        Quote acceptedQuote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException(
                        "Teklif bulunamadı. ID: " + quoteId));

        // 2. Bağlı siparişi al ve güncelle
        Order order = acceptedQuote.getOrder();
        order.setStatus(OrderStatus.IN_PROGRESS);
        order.setAgreedPrice(acceptedQuote.getOfferedPrice());
        order.setArtisan(acceptedQuote.getArtisan());
        orderRepository.save(order);

        // 3. Kabul edilen teklifi ACCEPTED yap
        acceptedQuote.setStatus(QuoteStatus.ACCEPTED);

        // 4. Aynı siparişe ait diğer tüm teklifleri REJECTED yap
        List<Quote> otherQuotes = quoteRepository.findByOrder_Id(order.getId())
                .stream()
                .filter(q -> !q.getId().equals(quoteId))
                .toList();

        otherQuotes.forEach(q -> q.setStatus(QuoteStatus.REJECTED));
        quoteRepository.saveAll(otherQuotes);

        return toResponse(quoteRepository.save(acceptedQuote));
    }
}
