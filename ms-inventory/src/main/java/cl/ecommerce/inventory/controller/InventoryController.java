package cl.ecommerce.inventory.controller;

import cl.ecommerce.inventory.dto.InventoryRequest;
import cl.ecommerce.inventory.dto.ReserveStockRequest;
import cl.ecommerce.inventory.model.InventoryItem;
import cl.ecommerce.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryItem> getStock(@PathVariable String productId) {
        return ResponseEntity.ok(inventoryService.getStock(productId));
    }

    @GetMapping
    public ResponseEntity<List<InventoryItem>> getAll() {
        return ResponseEntity.ok(inventoryService.getAll());
    }

    @PostMapping
    public ResponseEntity<InventoryItem> createItem(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.createItem(request));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<InventoryItem> updateItem(@PathVariable String productId,
                                                    @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.updateItem(productId, request));
    }

    @PostMapping("/reserve")
    public ResponseEntity<Void> reserveStock(@Valid @RequestBody ReserveStockRequest request) {
        inventoryService.reserveStock(request.orderId(), request.items());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/consume/{orderId}")
    public ResponseEntity<Void> consumeStock(@PathVariable String orderId) {
        inventoryService.consumeStock(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/release/{orderId}")
    public ResponseEntity<Void> releaseStock(@PathVariable String orderId,
                                             @Valid @RequestBody List<cl.ecommerce.inventory.dto.ProductQuantityDTO> items) {
        inventoryService.releaseStock(orderId, items);
        return ResponseEntity.ok().build();
    }
}
