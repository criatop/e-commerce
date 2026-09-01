package cl.ecommerce.shipping.client;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "ms-order", configuration = FeignClientConfig.class)
public interface ShippingOrderClient {

    @GetMapping("/api/orders/{id}")
    ApiResponse<Map<String, Object>> getOrder(@PathVariable("id") String id);
}
