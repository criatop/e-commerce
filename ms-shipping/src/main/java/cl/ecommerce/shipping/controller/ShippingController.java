package cl.ecommerce.shipping.controller;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.shipping.dto.ShipmentRequest;
import cl.ecommerce.shipping.dto.ShipmentResponse;
import cl.ecommerce.shipping.model.ShipmentStatus;
import cl.ecommerce.shipping.service.ShippingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService shippingService;

    @PostMapping
    public ResponseEntity<ApiResponse<ShipmentResponse>> create(@Valid @RequestBody ShipmentRequest request) {
        ShipmentResponse shipment = shippingService.createShipment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(shipment, "Envío creado exitosamente"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getById(@PathVariable UUID id) {
        ShipmentResponse shipment = shippingService.getShipment(id);
        return ResponseEntity.ok(ApiResponse.ok(shipment));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ShipmentResponse>>> getByUserId(@PathVariable String userId) {
        List<ShipmentResponse> shipments = shippingService.getShipmentsByUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(shipments));
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ApiResponse<ShipmentResponse>> track(@PathVariable String trackingNumber) {
        ShipmentResponse shipment = shippingService.trackShipment(trackingNumber);
        return ResponseEntity.ok(ApiResponse.ok(shipment));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ShipmentResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestParam ShipmentStatus status) {
        ShipmentResponse shipment = shippingService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok(shipment, "Estado del envío actualizado exitosamente"));
    }
}
