package cl.ecommerce.order.repository;

import cl.ecommerce.order.model.Order;
import cl.ecommerce.order.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserId(String userId);
    List<Order> findByStatus(OrderStatus status);
}
