package cl.ecommerce.product.service;

import cl.ecommerce.common.exception.InsufficientStockException;
import cl.ecommerce.product.dto.BatchPriceResponse;
import cl.ecommerce.product.dto.ProductRequest;
import cl.ecommerce.product.dto.ProductResponse;
import cl.ecommerce.product.dto.StockItemRequest;
import cl.ecommerce.product.model.Product;
import cl.ecommerce.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductStockServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private final UUID id = UUID.randomUUID();

    @Test
    void reservaFallaSinDisponible() {
        when(productRepository.reserve(id, 5)).thenReturn(0);

        assertThrows(InsufficientStockException.class,
                () -> productService.reserveStock(List.of(new StockItemRequest(id, 5))));
    }

    @Test
    void reservaExitosaAcumula() {
        when(productRepository.reserve(id, 3)).thenReturn(1);

        productService.reserveStock(List.of(new StockItemRequest(id, 3)));

        verify(productRepository).reserve(id, 3);
    }

    @Test
    void reservaDeVariosItemsAbortaConElPrimeroSinDisponible() {
        UUID segundo = UUID.randomUUID();
        when(productRepository.reserve(id, 2)).thenReturn(1);
        when(productRepository.reserve(segundo, 4)).thenReturn(0);

        assertThrows(InsufficientStockException.class, () -> productService.reserveStock(List.of(
                new StockItemRequest(id, 2),
                new StockItemRequest(segundo, 4),
                new StockItemRequest(UUID.randomUUID(), 1))));

        verify(productRepository).reserve(id, 2);
        verify(productRepository).reserve(segundo, 4);
    }

    @Test
    void confirmarDescuentaStockYReserva() {
        when(productRepository.confirm(id, 3)).thenReturn(1);

        productService.confirmStock(List.of(new StockItemRequest(id, 3)));

        verify(productRepository).confirm(id, 3);
    }

    @Test
    void confirmarFallaSinReservaSuficiente() {
        when(productRepository.confirm(id, 3)).thenReturn(0);

        assertThrows(InsufficientStockException.class,
                () -> productService.confirmStock(List.of(new StockItemRequest(id, 3))));
    }

    @Test
    void liberarDevuelveLaReserva() {
        when(productRepository.release(id, 2)).thenReturn(1);

        productService.releaseStock(List.of(new StockItemRequest(id, 2)));

        verify(productRepository).release(id, 2);
    }

    @Test
    void liberarFallaSinReservaSuficiente() {
        when(productRepository.release(id, 2)).thenReturn(0);

        assertThrows(InsufficientStockException.class,
                () -> productService.releaseStock(List.of(new StockItemRequest(id, 2))));
    }

    @Test
    void restaurarDevuelveUnidadesAlStock() {
        when(productRepository.restore(id, 7)).thenReturn(1);

        productService.restoreStock(List.of(new StockItemRequest(id, 7)));

        verify(productRepository).restore(id, 7);
    }

    @Test
    void restaurarFallaSiElProductoNoExiste() {
        when(productRepository.restore(id, 1)).thenReturn(0);

        assertThrows(InsufficientStockException.class,
                () -> productService.restoreStock(List.of(new StockItemRequest(id, 1))));
    }

    @Test
    void operacionSinItemsNoTocaElRepositorio() {
        productService.reserveStock(List.of());
        productService.confirmStock(List.of());
        productService.releaseStock(List.of());
        productService.restoreStock(List.of());

        verifyNoInteractions(productRepository);
    }

    @Test
    void cantidadNoPositivaNoTocaElRepositorio() {
        assertThrows(cl.ecommerce.common.exception.BusinessException.class,
                () -> productService.reserveStock(List.of(new StockItemRequest(id, 0))));

        verifyNoInteractions(productRepository);
    }

    @Test
    void batchSeparaEncontradosFaltantesEInactivos() {
        UUID inactivo = UUID.randomUUID();
        UUID inexistente = UUID.randomUUID();
        Product activo = producto(id, 10, 4, 5);
        Product desactivado = producto(inactivo, 4, 0, 5);
        desactivado.setActive(false);
        when(productRepository.findAllById(any())).thenReturn(List.of(activo, desactivado));

        BatchPriceResponse respuesta = productService.batch(List.of(id, inexistente, inactivo));

        assertThat(respuesta.found()).extracting(ProductResponse::getId).containsExactly(id);
        assertThat(respuesta.found().get(0).getAvailable()).isEqualTo(6);
        assertThat(respuesta.missing()).containsExactly(inexistente);
        assertThat(respuesta.inactive()).containsExactly(inactivo);
    }

    @Test
    void batchConTodosActivosDejaLasListasDeProblemasVacias() {
        UUID segundo = UUID.randomUUID();
        when(productRepository.findAllById(any())).thenReturn(List.of(
                producto(id, 10, 4, 5), producto(segundo, 6, 0, 5)));

        BatchPriceResponse respuesta = productService.batch(List.of(id, segundo));

        assertThat(respuesta.found()).hasSize(2);
        assertThat(respuesta.missing()).isEmpty();
        assertThat(respuesta.inactive()).isEmpty();
    }

    @Test
    void batchConservaElOrdenPedidoYDescartaDuplicados() {
        UUID segundo = UUID.randomUUID();
        when(productRepository.findAllById(any())).thenReturn(List.of(
                producto(id, 10, 0, 5), producto(segundo, 6, 0, 5)));

        BatchPriceResponse respuesta = productService.batch(List.of(segundo, id, segundo, id));

        assertThat(respuesta.found()).extracting(ProductResponse::getId)
                .containsExactly(segundo, id);
    }

    @Test
    void listadoLowStockUsaLaConsultaDeUmbral() {
        Product critico = producto(id, 6, 2, 5);
        when(productRepository.findLowStock()).thenReturn(List.of(critico));

        List<ProductResponse> respuesta = productService.getAll(true);

        assertThat(respuesta).singleElement()
                .satisfies(p -> assertThat(p.getAvailable()).isEqualTo(4));
        verify(productRepository, never()).findByActiveTrue();
    }

    @Test
    void listadoNormalSoloTraeActivos() {
        when(productRepository.findByActiveTrue()).thenReturn(List.of(producto(id, 10, 0, 5)));

        assertThat(productService.getAll(false)).hasSize(1);

        verify(productRepository, never()).findLowStock();
    }

    @Test
    void crearConStockAplicaValoresYReservaCero() {
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse respuesta = productService.create(new ProductRequest(
                "Collar", "descripcion", 19990.0, UUID.randomUUID(), "img.jpg", "COL-001", 12, 3));

        assertThat(respuesta.getStockQuantity()).isEqualTo(12);
        assertThat(respuesta.getReservedQuantity()).isZero();
        assertThat(respuesta.getLowStockThreshold()).isEqualTo(3);
        assertThat(respuesta.getAvailable()).isEqualTo(12);
    }

    @Test
    void crearSinStockUsaCeroYElUmbralPorDefecto() {
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse respuesta = productService.create(new ProductRequest(
                "Collar", "descripcion", 19990.0, UUID.randomUUID(), "img.jpg", "COL-002", null, null));

        assertThat(respuesta.getStockQuantity()).isZero();
        assertThat(respuesta.getLowStockThreshold()).isEqualTo(5);
    }

    @Test
    void actualizarStockBajoLoReservadoFalla() {
        Product existente = producto(id, 10, 4, 5);
        when(productRepository.findById(id)).thenReturn(Optional.of(existente));

        assertThrows(cl.ecommerce.common.exception.BusinessException.class,
                () -> productService.update(id, new ProductRequest(
                        "Collar", "descripcion", 19990.0, UUID.randomUUID(), "img.jpg", "COL-001", 3, null)));

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void actualizarSinStockConservaElStockActual() {
        Product existente = producto(id, 10, 2, 5);
        when(productRepository.findById(id)).thenReturn(Optional.of(existente));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse respuesta = productService.update(id, new ProductRequest(
                "Collar editado", "nueva", 24990.0, UUID.randomUUID(), "img2.jpg", "COL-001", null, null));

        assertThat(respuesta.getStockQuantity()).isEqualTo(10);
        assertThat(respuesta.getReservedQuantity()).isEqualTo(2);
        assertThat(respuesta.getLowStockThreshold()).isEqualTo(5);
    }

    private Product producto(UUID productoId, int stock, int reservado, int umbral) {
        return Product.builder()
                .id(productoId)
                .sku("SKU-1")
                .name("Producto")
                .description("descripcion")
                .price(1000.0)
                .category(UUID.randomUUID())
                .active(true)
                .stockQuantity(stock)
                .reservedQuantity(reservado)
                .lowStockThreshold(umbral)
                .build();
    }
}
