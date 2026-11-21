package cl.ecommerce.product.repository;

import cl.ecommerce.product.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    List<Product> findByCategory(UUID category);

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.active = true " +
            "AND p.stockQuantity - p.reservedQuantity <= p.lowStockThreshold ORDER BY p.name")
    List<Product> findLowStock();

    @Modifying
    @Query(value = "UPDATE products SET reserved_quantity = reserved_quantity + :q " +
            "WHERE id = :id AND stock_quantity - reserved_quantity >= :q", nativeQuery = true)
    int reserve(@Param("id") UUID id, @Param("q") int quantity);

    @Modifying
    @Query(value = "UPDATE products SET stock_quantity = stock_quantity - :q, " +
            "reserved_quantity = reserved_quantity - :q " +
            "WHERE id = :id AND reserved_quantity >= :q", nativeQuery = true)
    int confirm(@Param("id") UUID id, @Param("q") int quantity);

    @Modifying
    @Query(value = "UPDATE products SET reserved_quantity = reserved_quantity - :q " +
            "WHERE id = :id AND reserved_quantity >= :q", nativeQuery = true)
    int release(@Param("id") UUID id, @Param("q") int quantity);

    @Modifying
    @Query(value = "UPDATE products SET stock_quantity = stock_quantity + :q WHERE id = :id",
            nativeQuery = true)
    int restore(@Param("id") UUID id, @Param("q") int quantity);
}
