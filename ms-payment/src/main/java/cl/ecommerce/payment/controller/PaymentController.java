package cl.ecommerce.payment.controller;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.SecurityUtils;
import cl.ecommerce.payment.dto.PaymentRequest;
import cl.ecommerce.payment.dto.PaymentResponse;
import cl.ecommerce.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentResponse> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse payment = paymentService.processPayment(request);
        return ApiResponse.ok(payment, "Payment processed successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentResponse> getPayment(@PathVariable UUID id) {
        PaymentResponse payment = paymentService.getPayment(id);
        return ApiResponse.ok(payment);
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<List<PaymentResponse>> getPaymentsByOrder(@PathVariable String orderId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByOrder(orderId);
        return ApiResponse.ok(payments);
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<PaymentResponse>> getPaymentsByUser(@PathVariable String userId) {
        SecurityUtils.requireSelfPrincipal(userId, "pagos");
        List<PaymentResponse> payments = paymentService.getPaymentsByUser(userId);
        return ApiResponse.ok(payments);
    }
}
