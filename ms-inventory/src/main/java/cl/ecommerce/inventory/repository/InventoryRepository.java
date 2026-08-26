package cl.ecommerce.inventory.repository;

import cl.ecommerce.inventory.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<InventoryItem, UUID> {

    Optional<InventoryItem> findByProductId(String productId);

    List<InventoryItem> findByQuantityLessThan(int threshold);
}
