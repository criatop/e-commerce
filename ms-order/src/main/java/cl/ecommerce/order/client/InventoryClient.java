package cl.ecommerce.order.client;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.FeignClientConfig;
import cl.ecommerce.order.dto.InventoryReservationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ms-inventory", configuration = FeignClientConfig.class)
public interface InventoryClient {

    @PostMapping("/api/inventory/reserve")
    ApiResponse<Void> reserveStock(@RequestBody InventoryReservationRequest request);

    @PostMapping("/api/inventory/consume/{orderId}")
    ApiResponse<Void> consumeStock(@PathVariable("orderId") String orderId);

    @PostMapping("/api/inventory/release/{orderId}")
    ApiResponse<Void> releaseStock(@PathVariable("orderId") String orderId, @RequestBody InventoryReservationRequest request);
}
