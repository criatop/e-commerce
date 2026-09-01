package cl.ecommerce.shipping.service;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.exception.NotFoundException;
import cl.ecommerce.shipping.client.ShippingOrderClient;
import cl.ecommerce.shipping.dto.ShipmentRequest;
import cl.ecommerce.shipping.dto.ShipmentResponse;
import cl.ecommerce.shipping.model.Shipment;
import cl.ecommerce.shipping.model.ShipmentStatus;
import cl.ecommerce.shipping.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingService {

    private final ShipmentRepository shipmentRepository;
    private final ShippingOrderClient shippingOrderClient;

    private static final List<String> CARRIERS = List.of("Chilexpress", "Starken", "Correos de Chile", "Bluex");

    public ShipmentResponse createShipment(ShipmentRequest request) {
        Shipment shipment = Shipment.builder()
                .orderId(request.orderId())
                .userId(request.userId())
                .address(request.address())
                .city(request.city())
                .postalCode(request.postalCode())
                .status(ShipmentStatus.PENDING)
                .trackingNumber(generateTrackingNumber())
                .carrier(assignCarrier())
                .estimatedDelivery(LocalDateTime.now().plusDays(5))
                .build();

        return toResponse(shipmentRepository.save(shipment));
    }

    public ShipmentResponse createShipmentFromPayment(String orderId, String userId) {
        String address = "Dirección pendiente";
        String city = "Ciudad pendiente";
        String postalCode = "00000";

        try {
            ApiResponse<Map<String, Object>> orderResponse = shippingOrderClient.getOrder(orderId);
            if (orderResponse != null && orderResponse.getDatos() != null) {
                Map<String, Object> orderData = orderResponse.getDatos();
                if (orderData.get("shippingAddress") != null) {
                    address = String.valueOf(orderData.get("shippingAddress"));
                }
                if (orderData.get("shippingCity") != null) {
                    city = String.valueOf(orderData.get("shippingCity"));
                }
                if (orderData.get("shippingPostal") != null) {
                    postalCode = String.valueOf(orderData.get("shippingPostal"));
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener la direccion de la orden {} para el envio: {}", orderId, e.getMessage());
        }

        Shipment shipment = Shipment.builder()
                .orderId(orderId)
                .userId(userId)
                .address(address)
                .city(city)
                .postalCode(postalCode)
                .status(ShipmentStatus.PENDING)
                .trackingNumber(generateTrackingNumber())
                .carrier(assignCarrier())
                .estimatedDelivery(LocalDateTime.now().plusDays(5))
                .build();

        return toResponse(shipmentRepository.save(shipment));
    }

    public ShipmentResponse getShipment(UUID id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Envío no encontrado con id: " + id));
        return toResponse(shipment);
    }

    public List<ShipmentResponse> getShipmentsByUser(String userId) {
        return shipmentRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public ShipmentResponse updateStatus(UUID id, ShipmentStatus status) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Envío no encontrado con id: " + id));
        shipment.setStatus(status);
        return toResponse(shipmentRepository.save(shipment));
    }

    public ShipmentResponse trackShipment(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new NotFoundException("Envío no encontrado con número de seguimiento: " + trackingNumber));
        return toResponse(shipment);
    }

    private String generateTrackingNumber() {
        return "SH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String assignCarrier() {
        return CARRIERS.get((int) (Math.random() * CARRIERS.size()));
    }

    private ShipmentResponse toResponse(Shipment shipment) {
        return ShipmentResponse.builder()
                .id(shipment.getId())
                .orderId(shipment.getOrderId())
                .userId(shipment.getUserId())
                .address(shipment.getAddress())
                .city(shipment.getCity())
                .postalCode(shipment.getPostalCode())
                .status(shipment.getStatus())
                .trackingNumber(shipment.getTrackingNumber())
                .carrier(shipment.getCarrier())
                .estimatedDelivery(shipment.getEstimatedDelivery())
                .createdAt(shipment.getCreatedAt())
                .updatedAt(shipment.getUpdatedAt())
                .build();
    }
}
