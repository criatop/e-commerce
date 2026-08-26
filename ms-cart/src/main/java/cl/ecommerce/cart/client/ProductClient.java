package cl.ecommerce.cart.client;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "ms-product", configuration = FeignClientConfig.class)
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    ApiResponse<Map<String, Object>> getProduct(@PathVariable("id") String id);
}
