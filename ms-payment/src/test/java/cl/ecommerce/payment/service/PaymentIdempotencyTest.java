package cl.ecommerce.payment.service;

import cl.ecommerce.payment.dto.PaymentRequest;
import cl.ecommerce.payment.dto.PaymentResponse;
import cl.ecommerce.payment.model.Payment;
import cl.ecommerce.payment.model.PaymentMethod;
import cl.ecommerce.payment.model.PaymentStatus;
import cl.ecommerce.payment.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentIdempotencyTest {

    @Mock PaymentRepository repo;
    @InjectMocks PaymentService service;

    @Test
    void dosPagosDelMismoPedidoDevuelvenElMismo() {
        String orderId = UUID.randomUUID().toString();
        PaymentRequest req = new PaymentRequest(orderId, "u1", 1000.0, "CREDIT_CARD");
        Payment existente = Payment.builder()
                .id(UUID.randomUUID()).orderId(orderId).userId("u1")
                .amount(1000.0).method(PaymentMethod.CREDIT_CARD)
                .status(PaymentStatus.COMPLETED).transactionId("tx1")
                .createdAt(LocalDateTime.now()).build();
        when(repo.findFirstByOrderId(orderId)).thenReturn(Optional.of(existente));

        PaymentResponse r = service.create(req);

        assertEquals(existente.getId(), r.id());
        verify(repo, never()).save(any());
    }
}
