package cl.ecommerce.product.controller;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.product.dto.ProductRequest;
import cl.ecommerce.product.dto.ProductResponse;
import cl.ecommerce.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(product, "Producto creado exitosamente"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable UUID id) {
        ProductResponse product = productService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAll() {
        List<ProductResponse> products = productService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getByCategory(@PathVariable UUID category) {
        List<ProductResponse> products = productService.getByCategory(category);
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> search(@RequestParam String name) {
        List<ProductResponse> products = productService.search(name);
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok(product, "Producto actualizado exitosamente"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id) {
        productService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Producto desactivado exitosamente"));
    }
}
