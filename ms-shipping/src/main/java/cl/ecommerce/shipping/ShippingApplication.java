package cl.ecommerce.shipping;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = {"cl.ecommerce.shipping", "cl.ecommerce.common"})
@EnableFeignClients(basePackages = {"cl.ecommerce.common", "cl.ecommerce.shipping.client"})
public class ShippingApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShippingApplication.class, args);
    }
}
