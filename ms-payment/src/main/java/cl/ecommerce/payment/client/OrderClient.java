package cl.ecommerce.payment.client;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "ms-order", configuration = FeignClientConfig.class)
public interface OrderClient {

    @PutMapping("/api/orders/{id}/status")
    ApiResponse<Void> updateOrderStatus(@PathVariable("id") String id, @RequestParam("status") String status);
}
