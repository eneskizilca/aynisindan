package com.aynisindan.core.service;

import com.aynisindan.core.dto.request.CompleteOrderRequest;
import com.aynisindan.core.dto.request.CreateOrderRequest;
import com.aynisindan.core.dto.request.CreateReviewRequest;
import com.aynisindan.core.dto.response.OrderResponse;
import com.aynisindan.core.dto.response.ReviewResponse;
import com.aynisindan.core.model.entity.Order;
import com.aynisindan.core.model.entity.Review;
import com.aynisindan.core.model.entity.User;
import com.aynisindan.core.model.enums.OrderStatus;
import com.aynisindan.core.repository.OrderRepository;
import com.aynisindan.core.repository.ReviewRepository;
import com.aynisindan.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final DummyEscrowService escrowService;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private OrderResponse toResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getTitle(),
                order.getDescription(),
                order.getReferenceImageUrl(),
                order.getStatus().name(),
                order.getCreatedAt()
        );
    }

    // ─── Service Methods ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        User customer = userRepository.findById(request.customerId())
                .orElseThrow(() -> new RuntimeException(
                        "Müşteri bulunamadı. ID: " + request.customerId()));

        Order order = new Order();
        order.setCustomer(customer);
        order.setTitle(request.title());
        order.setDescription(request.description());
        order.setReferenceImageUrl(request.referenceImageUrl());
        order.setStatus(OrderStatus.PENDING);

        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(UUID customerId) {
        return orderRepository.findByCustomer_Id(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse completeOrder(UUID orderId, CompleteOrderRequest request) {
        // 1. Siparişi bul
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException(
                        "Sipariş bulunamadı. ID: " + orderId));

        // 2. Sipariş IN_PROGRESS durumunda mı?
        if (order.getStatus() != OrderStatus.IN_PROGRESS) {
            throw new RuntimeException(
                    "Sipariş teslim edilemez; mevcut durum: " + order.getStatus());
        }

        // 3. İsteği yapan zanaatkar, siparişe atanmış zanaatkarla eşleşiyor mu?
        UUID assignedArtisanId = order.getArtisan().getId();
        if (!assignedArtisanId.equals(request.artisanId())) {
            throw new RuntimeException(
                    "Yetkisiz işlem: bu siparişi yalnızca atanmış zanaatkar teslim edebilir.");
        }

        // 4. Durumu DELIVERED yap (müşteri onayı bekleniyor)
        order.setStatus(OrderStatus.DELIVERED);
        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse approveDelivery(UUID orderId) {
        // 1. Siparişi bul
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException(
                        "Sipariş bulunamadı. ID: " + orderId));

        // 2. Sipariş DELIVERED durumunda mı?
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException(
                    "Onaylanacak bir teslimat yok; mevcut durum: " + order.getStatus());
        }

        // 3. Durumu COMPLETED yap
        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        // 4. Havuzdaki ödemeyi zanaatkara serbest bırak
        escrowService.releaseFunds(orderId);

        return toResponse(order);
    }

    @Override
    @Transactional
    public ReviewResponse addReview(UUID orderId, CreateReviewRequest request) {
        // 1. Siparişi bul
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException(
                        "Sipariş bulunamadı. ID: " + orderId));

        // 2. Sipariş COMPLETED durumunda mı?
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new RuntimeException(
                    "Yalnızca tamamlanmış siparişler değerlendirilebilir; mevcut durum: "
                            + order.getStatus());
        }

        // 3. Bu sipariş için daha önce değerlendirme yapılmış mı?
        if (reviewRepository.existsByOrderId(orderId)) {
            throw new RuntimeException(
                    "Bu sipariş için zaten bir değerlendirme mevcut.");
        }

        // 4. Puan aralığı geçerli mi? (1-5)
        if (request.rating() < 1 || request.rating() > 5) {
            throw new RuntimeException("Puan 1 ile 5 arasında olmalıdır.");
        }

        // 5. Değerlendirmeyi oluştur ve kaydet
        Review review = new Review(orderId, request.rating(), request.comment());
        Review saved = reviewRepository.save(review);

        return new ReviewResponse(
                saved.getId(),
                saved.getOrderId(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt()
        );
    }
}
