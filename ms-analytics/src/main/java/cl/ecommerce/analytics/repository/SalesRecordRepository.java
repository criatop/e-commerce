package cl.ecommerce.analytics.repository;

import cl.ecommerce.analytics.model.SalesRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SalesRecordRepository extends JpaRepository<SalesRecord, java.util.UUID> {

    List<SalesRecord> findByProductId(String productId);

    List<SalesRecord> findByCategory(String category);

    List<SalesRecord> findByRecordedAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT SUM(s.amount) FROM SalesRecord s WHERE s.category = :category")
    Double sumAmountByCategory(@Param("category") String category);

    @Query("SELECT s.category, SUM(s.amount) as total FROM SalesRecord s GROUP BY s.category ORDER BY total DESC")
    List<Object[]> sumAmountGroupByCategory();

    @Query("SELECT s.productId, SUM(s.amount) as total FROM SalesRecord s GROUP BY s.productId ORDER BY total DESC")
    List<Object[]> topProductsByRevenue();

    @Query("SELECT COUNT(s) FROM SalesRecord s")
    long countAll();

    @Query("SELECT SUM(s.amount) FROM SalesRecord s")
    Double totalRevenue();
}
