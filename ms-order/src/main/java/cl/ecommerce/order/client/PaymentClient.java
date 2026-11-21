package cl.ecommerce.order.client;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.FeignClientConfig;
import cl.ecommerce.order.dto.PaymentRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "ms-payment", configuration = FeignClientConfig.class)
public interface PaymentClient {
    @PostMapping("/api/payments")
    ApiResponse<Map<String, Object>> create(@RequestBody PaymentRequest request);
}
