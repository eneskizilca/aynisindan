package com.aynisindan.core.service;

import com.aynisindan.core.dto.response.PaymentResponse;
import com.aynisindan.core.model.entity.Order;
import com.aynisindan.core.model.entity.Payment;
import com.aynisindan.core.model.entity.User;
import com.aynisindan.core.model.enums.PaymentStatus;
import com.aynisindan.core.repository.OrderRepository;
import com.aynisindan.core.repository.PaymentRepository;
import com.aynisindan.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DummyEscrowService escrowService;

    private PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getAmount(),
                payment.getStatus().name(),
                payment.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public PaymentResponse holdFundsForOrder(UUID orderId) {
        // 1. Kullanıcıyı bul
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Email: " + email));

        // 2. Siparişi bul
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı. ID: " + orderId));

        // 3. Yetki kontrolü: Sadece sipariş sahibi ödeme yapabilir
        if (!order.getCustomer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Yetkisiz işlem: Sadece sipariş sahibi ödeme yapabilir.");
        }

        // 4. Sipariş durumu kontrolü: Teklif kabul edilmiş olmalı
        if (!"IN_PROGRESS".equals(order.getStatus().name())) {
            throw new RuntimeException("Ödeme yalnızca teklif kabul edilmiş siparişler için yapılabilir.");
        }

        // 5. Zaten ödeme yapılmış mı kontrolü
        if (paymentRepository.findByOrderId(orderId).stream()
                .anyMatch(p -> p.getStatus() == PaymentStatus.HELD_IN_ESCROW
                        || p.getStatus() == PaymentStatus.RELEASED_TO_ARTISAN)) {
            throw new RuntimeException("Bu sipariş için ödeme zaten yapılmış.");
        }

        // 6. agreedPrice kontrolü
        if (order.getAgreedPrice() == null) {
            throw new RuntimeException("Sipariş için anlaşma fiyatı bulunamadı.");
        }

        // 7. Escrow'a yatır
        escrowService.holdFunds(orderId, order.getAgreedPrice());

        // 8. Oluşturulan kaydı dön
        Payment payment = paymentRepository.findFirstByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Ödeme kaydı oluşturulamadı."));

        log.info("Param-Güvende: {} TL havuza alındı. [orderId={}, customer={}]",
                payment.getAmount(), orderId, currentUser.getFullName());

        return toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Email: " + email));

        List<Payment> payments;
        if ("ARTISAN".equals(currentUser.getRole().name())) {
            // Zanaatkâr: Kendisine atanmış siparişlerin ödemeleri
            List<Order> artisanOrders = orderRepository.findByArtisan_Id(currentUser.getId());
            List<UUID> orderIds = artisanOrders.stream().map(Order::getId).toList();
            payments = paymentRepository.findAll().stream()
                    .filter(p -> orderIds.contains(p.getOrderId()))
                    .toList();
        } else {
            // Müşteri: Kendi siparişlerinin ödemeleri
            List<Order> customerOrders = orderRepository.findByCustomer_Id(currentUser.getId());
            List<UUID> orderIds = customerOrders.stream().map(Order::getId).toList();
            payments = paymentRepository.findAll().stream()
                    .filter(p -> orderIds.contains(p.getOrderId()))
                    .toList();
        }

        return payments.stream().map(this::toResponse).toList();
    }
}
