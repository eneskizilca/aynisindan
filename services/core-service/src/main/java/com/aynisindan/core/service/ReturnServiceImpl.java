package com.aynisindan.core.service;

import com.aynisindan.core.dto.request.CreateReturnRequest;
import com.aynisindan.core.dto.response.ReturnResponse;
import com.aynisindan.core.model.entity.Order;
import com.aynisindan.core.model.entity.Return;
import com.aynisindan.core.model.entity.User;
import com.aynisindan.core.model.enums.OrderStatus;
import com.aynisindan.core.model.enums.ReturnStatus;
import com.aynisindan.core.repository.OrderRepository;
import com.aynisindan.core.repository.ReturnRepository;
import com.aynisindan.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReturnServiceImpl implements ReturnService {

    private final ReturnRepository returnRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DummyEscrowService escrowService;

    @Override
    @Transactional
    public ReturnResponse createReturn(UUID orderId, CreateReturnRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı. ID: " + orderId));

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Sadece teslim edilmiş siparişler için iade talebi oluşturulabilir.");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Email: " + email));

        if (!order.getCustomer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Yetkisiz işlem: Sadece sipariş sahibi iade talebi oluşturabilir.");
        }

        boolean hasActiveReturn = returnRepository.existsByOrderIdAndStatusIn(orderId,
                List.of(ReturnStatus.REQUESTED));
        if (hasActiveReturn) {
            throw new RuntimeException("Bu sipariş için zaten bir iade talebi mevcut.");
        }

        Return returnEntity = new Return(orderId, order.getArtisan().getId(), order.getCustomer().getId(), request.reason());
        Return saved = returnRepository.save(returnEntity);

        return toResponse(saved, order);
    }

    @Override
    @Transactional
    public ReturnResponse approveReturn(UUID returnId) {
        Return returnEntity = returnRepository.findById(returnId)
                .orElseThrow(() -> new RuntimeException("İade talebi bulunamadı. ID: " + returnId));

        if (returnEntity.getStatus() != ReturnStatus.REQUESTED) {
            throw new RuntimeException("Bu iade talebi zaten işlenmiş.");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Email: " + email));

        if (!returnEntity.getArtisanId().equals(currentUser.getId())) {
            throw new RuntimeException("Yetkisiz işlem: Sadece atanmış zanaatkar iade talebini onaylayabilir.");
        }

        returnEntity.setStatus(ReturnStatus.APPROVED);
        returnEntity.setUpdatedAt(java.time.LocalDateTime.now());
        returnRepository.save(returnEntity);

        escrowService.refundFunds(returnEntity.getOrderId());

        returnEntity.setStatus(ReturnStatus.REFUNDED);
        returnEntity.setUpdatedAt(java.time.LocalDateTime.now());
        returnRepository.save(returnEntity);

        Order order = orderRepository.findById(returnEntity.getOrderId())
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı."));

        return toResponse(returnEntity, order);
    }

    @Override
    @Transactional
    public ReturnResponse rejectReturn(UUID returnId) {
        Return returnEntity = returnRepository.findById(returnId)
                .orElseThrow(() -> new RuntimeException("İade talebi bulunamadı. ID: " + returnId));

        if (returnEntity.getStatus() != ReturnStatus.REQUESTED) {
            throw new RuntimeException("Bu iade talebi zaten işlenmiş.");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Email: " + email));

        if (!returnEntity.getArtisanId().equals(currentUser.getId())) {
            throw new RuntimeException("Yetkisiz işlem: Sadece atanmış zanaatkar iade talebini reddedebilir.");
        }

        returnEntity.setStatus(ReturnStatus.REJECTED);
        returnEntity.setUpdatedAt(java.time.LocalDateTime.now());
        Return saved = returnRepository.save(returnEntity);

        Order order = orderRepository.findById(returnEntity.getOrderId())
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı."));

        return toResponse(saved, order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReturnResponse> getPendingReturnsForArtisan() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User artisan = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Email: " + email));

        List<Return> returns = returnRepository.findByArtisanIdAndStatus(artisan.getId(), ReturnStatus.REQUESTED);

        return returns.stream()
                .map(r -> {
                    Order order = orderRepository.findById(r.getOrderId())
                            .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı."));
                    return toResponse(r, order);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReturnResponse> getAllReturnsForArtisan() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User artisan = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Email: " + email));

        List<Return> returns = returnRepository.findByArtisanId(artisan.getId());

        return returns.stream()
                .map(r -> {
                    Order order = orderRepository.findById(r.getOrderId())
                            .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı."));
                    return toResponse(r, order);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReturnResponse getReturnByOrderId(UUID orderId) {
        Return returnEntity = returnRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Bu sipariş için iade talebi bulunamadı."));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı."));

        return toResponse(returnEntity, order);
    }

    private ReturnResponse toResponse(Return r, Order order) {
        return new ReturnResponse(
                r.getId(),
                r.getOrderId(),
                order.getTitle(),
                r.getArtisanId(),
                order.getArtisan() != null ? order.getArtisan().getFullName() : null,
                r.getCustomerId(),
                order.getCustomer().getFullName(),
                r.getReason(),
                r.getStatus().name(),
                order.getAgreedPrice(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }
}
