package cl.ecommerce.payment.service;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.event.PaymentCompletedEvent;
import cl.ecommerce.payment.client.OrderClient;
import cl.ecommerce.payment.dto.PaymentRequest;
import cl.ecommerce.payment.dto.PaymentResponse;
import cl.ecommerce.payment.model.Payment;
import cl.ecommerce.payment.model.PaymentMethod;
import cl.ecommerce.payment.model.PaymentStatus;
import cl.ecommerce.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;
    private final KafkaTemplate<String, PaymentCompletedEvent> kafkaTemplate;

    public PaymentResponse processPayment(PaymentRequest request) {
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

        PaymentCompletedEvent event = PaymentCompletedEvent.builder()
                .paymentId(payment.getId().toString())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .method(payment.getMethod().name())
                .timestamp(LocalDateTime.now())
                .build();

        kafkaTemplate.send("payment.completed", event);
        log.info("PaymentCompletedEvent published to Kafka for payment: {}", payment.getId());

        try {
            orderClient.updateOrderStatus(payment.getOrderId(), "PAID");
            log.info("Order {} updated to PAID status", payment.getOrderId());
        } catch (Exception e) {
            log.error("Failed to update order status for order {}: {}", payment.getOrderId(), e.getMessage());
        }

        return mapToResponse(payment);
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
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .method(payment.getMethod().name())
                .status(payment.getStatus().name())
                .transactionId(payment.getTransactionId())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
