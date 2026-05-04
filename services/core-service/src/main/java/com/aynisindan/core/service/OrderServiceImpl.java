package com.aynisindan.core.service;

import com.aynisindan.core.dto.request.CreateOrderRequest;
import com.aynisindan.core.dto.response.OrderResponse;
import com.aynisindan.core.model.entity.Order;
import com.aynisindan.core.model.entity.User;
import com.aynisindan.core.model.enums.OrderStatus;
import com.aynisindan.core.repository.OrderRepository;
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

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Order entity'sini OrderResponse DTO'suna dönüştürür.
     * Mapping mantığı tek yerde toplandığı için ileride kolayca değiştirilebilir.
     */
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
}
