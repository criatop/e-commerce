package cl.ecommerce.order.client;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.FeignClientConfig;
import cl.ecommerce.order.dto.ShipmentRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "ms-shipping", configuration = FeignClientConfig.class)
public interface ShippingClient {
    @PostMapping("/api/shipping")
    ApiResponse<Map<String, Object>> create(@RequestBody ShipmentRequest request);
}
