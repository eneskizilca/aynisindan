package com.aynisindan.core.service;

import com.aynisindan.core.dto.request.CreateOrderRequest;
import com.aynisindan.core.dto.request.CreateReviewRequest;
import com.aynisindan.core.dto.response.OrderResponse;
import com.aynisindan.core.dto.response.ReviewResponse;
import com.aynisindan.core.model.entity.Order;
import com.aynisindan.core.model.entity.Review;
import com.aynisindan.core.model.entity.User;
import com.aynisindan.core.model.enums.OrderStatus;
import com.aynisindan.core.repository.OrderRepository;
import com.aynisindan.core.model.enums.ReturnStatus;
import com.aynisindan.core.repository.ReturnRepository;
import com.aynisindan.core.repository.ReviewRepository;
import com.aynisindan.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ReturnRepository returnRepository;
    private final DummyEscrowService escrowService;

    private OrderResponse toResponse(Order order) {
        boolean hasActiveReturn = returnRepository.existsByOrderIdAndStatusIn(order.getId(),
                java.util.List.of(ReturnStatus.REQUESTED));
        return new OrderResponse(
                order.getId(),
                order.getTitle(),
                order.getDescription(),
                order.getReferenceImageUrl(),
                order.getAiGeneratedImageUrl(),
                order.getStatus().name(),
                order.getCustomer().getId(),
                order.getCustomer().getFullName(),
                order.getArtisan() != null ? order.getArtisan().getFullName() : null,
                order.getAgreedPrice(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                hasActiveReturn
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi. Email: " + email));

        List<Order> orders;
        if ("ARTISAN".equals(currentUser.getRole().name())) {
            orders = orderRepository.findByArtisan_Id(currentUser.getId());
        } else {
            orders = orderRepository.findByCustomer_Id(currentUser.getId());
        }
        return orders.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllPendingOrders() {
        return orderRepository.findByStatus(OrderStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi. Email: " + email));

        Order order = new Order();
        order.setCustomer(customer);
        order.setTitle(request.title());
        order.setDescription(request.description());
        order.setReferenceImageUrl(request.referenceImageUrl());
        order.setAiGeneratedImageUrl(request.aiGeneratedImageUrl());
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
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Siparis bulunamadi. ID: " + orderId));
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse completeOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException(
                        "Siparis bulunamadi. ID: " + orderId));

        if (order.getStatus() != OrderStatus.IN_PROGRESS) {
            throw new RuntimeException(
                    "Siparis teslim edilemez; mevcut durum: " + order.getStatus());
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi. Email: " + email));

        UUID assignedArtisanId = order.getArtisan().getId();
        if (!assignedArtisanId.equals(currentUser.getId())) {
            throw new RuntimeException(
                    "Yetkisiz islem: bu siparisi yalnizca atanmis zanaatkar teslim edebilir.");
        }

        order.setStatus(OrderStatus.DELIVERED);
        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse approveDelivery(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException(
                        "Siparis bulunamadi. ID: " + orderId));

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException(
                    "Onaylanacak bir teslimat yok; mevcut durum: " + order.getStatus());
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi. Email: " + email));

        if (!order.getCustomer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Yetkisiz islem: Sadece siparis sahibi teslimati onaylayabilir.");
        }

        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        escrowService.releaseFunds(orderId);

        return toResponse(order);
    }

    @Override
    @Transactional
    public ReviewResponse addReview(UUID orderId, CreateReviewRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException(
                        "Siparis bulunamadi. ID: " + orderId));

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new RuntimeException(
                    "Yalnizca tamamlanmis siparisler degerlendirilebilir; mevcut durum: "
                            + order.getStatus());
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi. Email: " + email));

        if (!order.getCustomer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Yetkisiz islem: Sadece siparis sahibi degerlendirme yapabilir.");
        }

        if (reviewRepository.existsByOrderId(orderId)) {
            throw new RuntimeException(
                    "Bu siparis icin zaten bir degerlendirme mevcut.");
        }

        if (request.rating() < 1 || request.rating() > 5) {
            throw new RuntimeException("Puan 1 ile 5 arasinda olmalidir.");
        }

        // 5. Degerlendirmeyi olustur ve kaydet
        Review review = new Review(orderId, request.rating(), request.comment(), order.getArtisan().getId());
        Review saved = reviewRepository.save(review);

        return new ReviewResponse(
                saved.getId(),
                saved.getOrderId(),
                saved.getArtisanId(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt()
        );
    }
}
