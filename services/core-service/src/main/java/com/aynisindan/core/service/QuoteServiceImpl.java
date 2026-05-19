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
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuoteServiceImpl implements QuoteService {

    private final QuoteRepository quoteRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DummyEscrowService escrowService;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Quote entity'sini QuoteResponse DTO'suna dönüştürür.
     * orderTitle alanı da eklenmiştir.
     */
    private QuoteResponse toResponse(Quote quote) {
        return new QuoteResponse(
                quote.getId(),
                quote.getOrder().getId(),
                quote.getOrder().getTitle(),
                quote.getArtisan().getId(),
                quote.getArtisan().getFullName(),
                quote.getOfferedPrice(),
                quote.getEstimatedDays(),
                quote.getMessage(),
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

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User artisan = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Email: " + email));

        Quote quote = new Quote();
        quote.setOrder(order);
        quote.setArtisan(artisan);
        quote.setOfferedPrice(request.offeredPrice());
        quote.setEstimatedDays(request.estimatedDays());
        quote.setMessage(request.message());
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

        // 2. Yetki kontrolü: Teklifi kabul eden kişi siparişin sahibi mi?
        Order order = acceptedQuote.getOrder();
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Email: " + email));

        if (!order.getCustomer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Yetkisiz işlem: Teklifi sadece sipariş sahibi kabul edebilir.");
        }

        // 3. Bağlı siparişi al ve güncelle
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

        // 5. Kabul edilen teklif tutarını havuz hesabına al
        escrowService.holdFunds(order.getId(), acceptedQuote.getOfferedPrice());

        return toResponse(quoteRepository.save(acceptedQuote));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteResponse> getQuotesByOrder(UUID orderId) {
        return quoteRepository.findByOrder_Id(orderId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteResponse> getMyQuotes() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User artisan = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Email: " + email));

        return quoteRepository.findByArtisan_Id(artisan.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }
}
