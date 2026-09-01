package cl.ecommerce.inventory.service;

import cl.ecommerce.common.event.StockLowEvent;
import cl.ecommerce.common.exception.InsufficientStockException;
import cl.ecommerce.common.exception.NotFoundException;
import cl.ecommerce.inventory.dto.InventoryRequest;
import cl.ecommerce.inventory.dto.ProductQuantityDTO;
import cl.ecommerce.inventory.model.InventoryItem;
import cl.ecommerce.inventory.model.InventoryReservation;
import cl.ecommerce.inventory.model.ReservationStatus;
import cl.ecommerce.inventory.repository.InventoryRepository;
import cl.ecommerce.inventory.repository.InventoryReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryReservationRepository reservationRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public InventoryItem createItem(InventoryRequest request) {
        InventoryItem item = InventoryItem.builder()
                .productId(request.productId())
                .productName(request.productName())
                .quantity(request.quantity())
                .lowStockThreshold(request.lowStockThreshold() != null ? request.lowStockThreshold() : 10)
                .build();
        return inventoryRepository.save(item);
    }

    public InventoryItem updateItem(String productId, InventoryRequest request) {
        InventoryItem item = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + productId));
        item.setProductName(request.productName());
        item.setQuantity(request.quantity());
        if (request.lowStockThreshold() != null) {
            item.setLowStockThreshold(request.lowStockThreshold());
        }
        return inventoryRepository.save(item);
    }

    public InventoryItem getStock(String productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + productId));
    }

    public List<InventoryItem> getAll() {
        return inventoryRepository.findAll();
    }

    public boolean checkAvailability(String productId, int quantity) {
        InventoryItem item = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + productId));
        return (item.getQuantity() - item.getReservedQuantity()) >= quantity;
    }

    @Transactional
    public void reserveStock(String orderId, List<ProductQuantityDTO> items) {
        for (ProductQuantityDTO item : items) {
            InventoryItem inventoryItem = inventoryRepository.findByProductId(item.productId())
                    .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + item.productId()));

            int available = inventoryItem.getQuantity() - inventoryItem.getReservedQuantity();
            if (available < item.quantity()) {
                throw new InsufficientStockException("Stock insuficiente para: " + item.productId());
            }

            inventoryItem.setReservedQuantity(inventoryItem.getReservedQuantity() + item.quantity());
            inventoryItem.setQuantity(inventoryItem.getQuantity() - item.quantity());
            inventoryRepository.save(inventoryItem);

            reservationRepository.save(InventoryReservation.builder()
                    .orderId(orderId)
                    .productId(item.productId())
                    .quantity(item.quantity())
                    .status(ReservationStatus.RESERVED)
                    .build());

            int remaining = inventoryItem.getQuantity();
            if (remaining < inventoryItem.getLowStockThreshold()) {
                StockLowEvent event = StockLowEvent.builder()
                        .productId(inventoryItem.getProductId())
                        .productName(inventoryItem.getProductName())
                        .currentQuantity(remaining)
                        .timestamp(LocalDateTime.now())
                        .build();
                kafkaTemplate.send("stock.low", event);
                log.warn("Stock bajo para producto: {} (stock: {})", inventoryItem.getProductName(), remaining);
            }
        }
    }

    @Transactional
    public void consumeStock(String orderId) {
        List<InventoryReservation> reservations = reservationRepository
                .findByOrderIdAndStatus(orderId, ReservationStatus.RESERVED);

        for (InventoryReservation reservation : reservations) {
            InventoryItem inventoryItem = inventoryRepository.findByProductId(reservation.getProductId())
                    .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + reservation.getProductId()));

            int toConsume = Math.min(reservation.getQuantity(),
                    inventoryItem.getReservedQuantity());

            log.info("Consumiendo reserva para orden {} producto: {} (cantidad: {})",
                    orderId, reservation.getProductId(), toConsume);

            inventoryItem.setReservedQuantity(inventoryItem.getReservedQuantity() - toConsume);
            inventoryRepository.save(inventoryItem);

            reservation.setStatus(ReservationStatus.CONSUMED);
            reservation.setSettledAt(LocalDateTime.now());
            reservationRepository.save(reservation);
        }
    }

    @Transactional
    public void releaseStock(String orderId, List<ProductQuantityDTO> items) {
        for (ProductQuantityDTO item : items) {
            InventoryReservation reservation = reservationRepository
                    .findByOrderIdAndProductIdAndStatus(orderId, item.productId(), ReservationStatus.RESERVED)
                    .orElseThrow(() -> new NotFoundException("No hay reserva activa para el producto: " + item.productId()));

            InventoryItem inventoryItem = inventoryRepository.findByProductId(item.productId())
                    .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + item.productId()));

            int toRelease = Math.min(item.quantity(), reservation.getQuantity());

            inventoryItem.setReservedQuantity(Math.max(0, inventoryItem.getReservedQuantity() - toRelease));
            inventoryItem.setQuantity(inventoryItem.getQuantity() + toRelease);
            inventoryRepository.save(inventoryItem);

            reservation.setStatus(ReservationStatus.RELEASED);
            reservation.setSettledAt(LocalDateTime.now());
            reservationRepository.save(reservation);
        }
    }

    @Transactional
    public void releaseAllForOrder(String orderId) {
        List<InventoryReservation> reservations = reservationRepository
                .findByOrderIdAndStatus(orderId, ReservationStatus.RESERVED);

        for (InventoryReservation reservation : reservations) {
            InventoryItem inventoryItem = inventoryRepository.findByProductId(reservation.getProductId())
                    .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + reservation.getProductId()));

            log.info("Liberando reserva para orden {} producto: {} (cantidad: {})",
                    orderId, reservation.getProductId(), reservation.getQuantity());

            inventoryItem.setQuantity(inventoryItem.getQuantity() + reservation.getQuantity());
            inventoryItem.setReservedQuantity(Math.max(0,
                    inventoryItem.getReservedQuantity() - reservation.getQuantity()));
            inventoryRepository.save(inventoryItem);

            reservation.setStatus(ReservationStatus.RELEASED);
            reservation.setSettledAt(LocalDateTime.now());
            reservationRepository.save(reservation);
        }
    }
}
