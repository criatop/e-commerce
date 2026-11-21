package cl.ecommerce.cart.client;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@FeignClient(name = "ms-product", configuration = FeignClientConfig.class)
public interface ProductClient {

    @GetMapping("/api/v1/products/{id}")
    ApiResponse<Map<String, Object>> getProduct(@PathVariable("id") String id);

    @PostMapping("/api/v1/products/batch")
    ApiResponse<Map<String, Object>> getBatch(@RequestBody Map<String, List<String>> request);
}
