package cl.ecommerce.product.service;

import cl.ecommerce.common.exception.BusinessException;
import cl.ecommerce.common.exception.InsufficientStockException;
import cl.ecommerce.common.exception.NotFoundException;
import cl.ecommerce.product.dto.BatchPriceResponse;
import cl.ecommerce.product.dto.ProductRequest;
import cl.ecommerce.product.dto.ProductResponse;
import cl.ecommerce.product.dto.StockItemRequest;
import cl.ecommerce.product.model.Product;
import cl.ecommerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final int DEFAULT_LOW_STOCK_THRESHOLD = 5;

    private final ProductRepository productRepository;

    public ProductResponse create(ProductRequest request) {
        Product product = Product.builder()
                .sku(request.sku())
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .category(request.category())
                .imageUrl(request.imageUrl())
                .active(true)
                .stockQuantity(request.stockQuantity() == null ? 0 : request.stockQuantity())
                .reservedQuantity(0)
                .lowStockThreshold(request.lowStockThreshold() == null
                        ? DEFAULT_LOW_STOCK_THRESHOLD
                        : request.lowStockThreshold())
                .build();

        return toResponse(productRepository.save(product));
    }

    public ProductResponse getById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + id));
        return toResponse(product);
    }

    public List<ProductResponse> getAll() {
        return getAll(false);
    }

    public List<ProductResponse> getAll(boolean lowStock) {
        List<Product> products = lowStock
                ? productRepository.findLowStock()
                : productRepository.findByActiveTrue();
        return products.stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProductResponse> getByCategory(UUID category) {
        return productRepository.findByCategory(category).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProductResponse> search(String name) {
        return productRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::toResponse)
                .toList();
    }

    public BatchPriceResponse batch(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return BatchPriceResponse.empty();
        }
        List<UUID> solicitados = ids.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        Map<UUID, Product> porId = productRepository.findAllById(solicitados).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        List<ProductResponse> found = new ArrayList<>();
        List<UUID> missing = new ArrayList<>();
        List<UUID> inactive = new ArrayList<>();
        for (UUID solicitado : solicitados) {
            Product producto = porId.get(solicitado);
            if (producto == null) {
                missing.add(solicitado);
            } else if (!producto.isActive()) {
                inactive.add(solicitado);
            } else {
                found.add(toResponse(producto));
            }
        }
        return new BatchPriceResponse(found, missing, inactive);
    }

    public ProductResponse update(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + id));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCategory(request.category());
        product.setImageUrl(request.imageUrl());
        if (request.stockQuantity() != null) {
            if (request.stockQuantity() < product.getReservedQuantity()) {
                throw new BusinessException("El stock no puede ser menor a las unidades reservadas ("
                        + product.getReservedQuantity() + ")");
            }
            product.setStockQuantity(request.stockQuantity());
        }
        if (request.lowStockThreshold() != null) {
            product.setLowStockThreshold(request.lowStockThreshold());
        }

        return toResponse(productRepository.save(product));
    }

    public void deactivate(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + id));
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public void reserveStock(List<StockItemRequest> items) {
        validarItems(items);
        for (StockItemRequest item : items) {
            if (productRepository.reserve(item.productId(), item.quantity()) == 0) {
                throw new InsufficientStockException(
                        "Stock insuficiente para el producto " + item.productId());
            }
        }
    }

    @Transactional
    public void confirmStock(List<StockItemRequest> items) {
        validarItems(items);
        for (StockItemRequest item : items) {
            if (productRepository.confirm(item.productId(), item.quantity()) == 0) {
                throw new InsufficientStockException(
                        "No hay reserva suficiente para confirmar el producto " + item.productId());
            }
        }
    }

    @Transactional
    public void releaseStock(List<StockItemRequest> items) {
        validarItems(items);
        for (StockItemRequest item : items) {
            if (productRepository.release(item.productId(), item.quantity()) == 0) {
                throw new InsufficientStockException(
                        "No hay reserva suficiente para liberar el producto " + item.productId());
            }
        }
    }

    @Transactional
    public void restoreStock(List<StockItemRequest> items) {
        validarItems(items);
        for (StockItemRequest item : items) {
            if (productRepository.restore(item.productId(), item.quantity()) == 0) {
                throw new InsufficientStockException(
                        "No se pudo restaurar stock del producto " + item.productId());
            }
        }
    }

    private void validarItems(List<StockItemRequest> items) {
        if (items == null) {
            throw new BusinessException("La lista de items de stock es obligatoria");
        }
        for (StockItemRequest item : items) {
            if (item == null || item.productId() == null) {
                throw new BusinessException("Cada item de stock requiere un productId");
            }
            if (item.quantity() < 1) {
                throw new BusinessException(
                        "La cantidad debe ser mayor a cero para el producto " + item.productId());
            }
        }
    }

    private ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .active(product.isActive())
                .stockQuantity(product.getStockQuantity())
                .reservedQuantity(product.getReservedQuantity())
                .lowStockThreshold(product.getLowStockThreshold())
                .available(product.getStockQuantity() - product.getReservedQuantity())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
