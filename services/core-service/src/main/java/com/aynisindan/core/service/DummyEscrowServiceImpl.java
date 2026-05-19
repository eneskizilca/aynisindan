package com.aynisindan.core.service;

import com.aynisindan.core.model.entity.Payment;
import com.aynisindan.core.model.enums.PaymentStatus;
import com.aynisindan.core.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DummyEscrowServiceImpl implements DummyEscrowService {

    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public void holdFunds(UUID orderId, BigDecimal amount) {
        Payment payment = new Payment(orderId, amount, PaymentStatus.HELD_IN_ESCROW);
        paymentRepository.save(payment);

        log.info("Dummy Payment: {} TL havuz hesabına alındı. [orderId={}]", amount, orderId);
    }

    @Override
    @Transactional
    public void releaseFunds(UUID orderId) {
        Payment payment = paymentRepository.findFirstByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException(
                        "Ödeme kaydı bulunamadı. orderId: " + orderId));

        payment.setStatus(PaymentStatus.RELEASED_TO_ARTISAN);
        paymentRepository.save(payment);

        log.info("Dummy Payment: {} TL zanaatkara aktarıldı. [orderId={}]",
                payment.getAmount(), orderId);
    }

    @Override
    @Transactional
    public void refundFunds(UUID orderId) {
        Payment payment = paymentRepository.findByOrderIdAndStatus(orderId, PaymentStatus.HELD_IN_ESCROW)
                .orElseThrow(() -> new RuntimeException(
                        "Havuzda ödeme bulunamadı. orderId: " + orderId));

        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        log.info("Dummy Payment: {} TL müşteriye iade edildi. [orderId={}]",
                payment.getAmount(), orderId);
    }
}
