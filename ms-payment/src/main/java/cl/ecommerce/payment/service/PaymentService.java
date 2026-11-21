package cl.ecommerce.payment.service;

import cl.ecommerce.payment.dto.PaymentRequest;
import cl.ecommerce.payment.dto.PaymentResponse;
import cl.ecommerce.payment.model.Payment;
import cl.ecommerce.payment.model.PaymentMethod;
import cl.ecommerce.payment.model.PaymentStatus;
import cl.ecommerce.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentResponse create(PaymentRequest request) {
        return paymentRepository.findFirstByOrderId(request.orderId())
                .map(this::mapToResponse)
                .orElseGet(() -> {
                    Payment payment = Payment.builder()
                            .orderId(request.orderId())
                            .userId(request.userId())
                            .amount(request.amount())
                            .method(PaymentMethod.valueOf(request.method()))
                            .status(PaymentStatus.COMPLETED)
                            .transactionId(UUID.randomUUID().toString())
                            .createdAt(LocalDateTime.now())
                            .build();
                    payment = paymentRepository.save(payment);
                    log.info("Payment processed successfully: {}", payment.getId());
                    return mapToResponse(payment);
                });
    }

    public PaymentResponse processPayment(PaymentRequest request) {
        return create(request);
    }

    public PaymentResponse getPayment(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return mapToResponse(payment);
    }

    public List<PaymentResponse> getPaymentsByOrder(String orderId) {
        return paymentRepository.findByOrderId(orderId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<PaymentResponse> getPaymentsByUser(String userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getUserId(),
                payment.getAmount(),
                payment.getMethod().name(),
                payment.getStatus().name(),
                payment.getTransactionId(),
                payment.getCreatedAt()
        );
    }
}
