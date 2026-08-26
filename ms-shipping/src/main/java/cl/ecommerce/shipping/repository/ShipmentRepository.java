package cl.ecommerce.shipping.repository;

import cl.ecommerce.shipping.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    List<Shipment> findByOrderId(String orderId);

    List<Shipment> findByUserId(String userId);

    Optional<Shipment> findByTrackingNumber(String trackingNumber);
}
