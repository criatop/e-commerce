package cl.ecommerce.shipping.service;

import cl.ecommerce.shipping.dto.ShipmentRequest;
import cl.ecommerce.shipping.dto.ShipmentResponse;
import cl.ecommerce.shipping.model.Shipment;
import cl.ecommerce.shipping.model.ShipmentStatus;
import cl.ecommerce.shipping.repository.ShipmentRepository;
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
class ShippingIdempotencyTest {

    @Mock ShipmentRepository repo;
    @InjectMocks ShippingService service;

    @Test
    void dosEnviosDelMismoPedidoDevuelvenElMismo() {
        String orderId = UUID.randomUUID().toString();
        ShipmentRequest req = new ShipmentRequest(orderId, "u1", "Av 1", "Santiago", "8320000", "RM", "Santiago");
        Shipment existente = Shipment.builder()
                .id(UUID.randomUUID()).orderId(orderId).userId("u1")
                .address("Av 1").city("Santiago").postalCode("8320000")
                .region("RM").comuna("Santiago")
                .status(ShipmentStatus.PENDING).trackingNumber("SH-1")
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();
        when(repo.findFirstByOrderId(orderId)).thenReturn(Optional.of(existente));

        ShipmentResponse r = service.createShipment(req);

        assertEquals(existente.getId(), r.getId());
        verify(repo, never()).save(any());
    }
}
