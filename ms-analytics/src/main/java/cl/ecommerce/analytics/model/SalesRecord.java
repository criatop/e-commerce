package cl.ecommerce.analytics.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sales_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String orderId;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String productId;

    private String productName;

    private String category;

    private int quantity;

    @Column(nullable = false)
    private double amount;

    @Column(nullable = false)
    private LocalDateTime recordedAt;
}
