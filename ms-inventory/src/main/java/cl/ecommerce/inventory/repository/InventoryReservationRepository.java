package cl.ecommerce.inventory.repository;

import cl.ecommerce.inventory.model.InventoryReservation;
import cl.ecommerce.inventory.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, UUID> {

    List<InventoryReservation> findByOrderId(String orderId);

    List<InventoryReservation> findByOrderIdAndStatus(String orderId, ReservationStatus status);

    Optional<InventoryReservation> findByOrderIdAndProductIdAndStatus(
            String orderId, String productId, ReservationStatus status);
}
