package cl.ecommerce.product.controller;

import cl.ecommerce.common.exception.BusinessException;
import cl.ecommerce.common.exception.GlobalExceptionHandler;
import cl.ecommerce.product.dto.BatchPriceResponse;
import cl.ecommerce.product.dto.ProductResponse;
import cl.ecommerce.product.dto.StockItemRequest;
import cl.ecommerce.product.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService productService;

    private MockMvc mockMvc;

    private final UUID id = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ProductController(productService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void elControladorSePublicaBajoApiV1() {
        RequestMapping mapping = ProductController.class.getAnnotation(RequestMapping.class);

        assertThat(mapping).isNotNull();
        assertThat(mapping.value()).containsExactly("/api/v1/products");
    }

    @Test
    void listadoPropagaElFiltroLowStock() throws Exception {
        when(productService.getAll(true)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/products").param("lowStock", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitoso").value(true));

        verify(productService).getAll(true);
    }

    @Test
    void reservaRespondeElSobreApiResponse() throws Exception {
        mockMvc.perform(post("/api/v1/products/stock/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[{\"productId\":\"" + id + "\",\"quantity\":2}]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitoso").value(true))
                .andExpect(jsonPath("$.datos.operation").value("reserve"))
                .andExpect(jsonPath("$.datos.items").value(1));

        verify(productService).reserveStock(List.of(new StockItemRequest(id, 2)));
    }

    @Test
    void batchRecibeElLoteDeIdsYDevuelveElDetalleSeparado() throws Exception {
        UUID faltante = UUID.randomUUID();
        when(productService.batch(anyList())).thenReturn(new BatchPriceResponse(
                List.of(ProductResponse.builder().id(id).stockQuantity(7).reservedQuantity(2)
                        .lowStockThreshold(5).available(5).build()),
                List.of(faltante),
                List.of()));

        mockMvc.perform(post("/api/v1/products/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[\"" + id + "\",\"" + faltante + "\"]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.found[0].available").value(5))
                .andExpect(jsonPath("$.datos.missing[0]").value(faltante.toString()))
                .andExpect(jsonPath("$.datos.inactive").isEmpty());
    }

    @Test
    void unErrorDeNegocioRespondeCuatrocientosConElSobreDeError() throws Exception {
        doThrow(new BusinessException("La cantidad debe ser mayor a cero"))
                .when(productService).reserveStock(any());

        mockMvc.perform(post("/api/v1/products/stock/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[{\"productId\":\"" + id + "\",\"quantity\":0}]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exitoso").value(false))
                .andExpect(jsonPath("$.datos.error").value("BUSINESS_ERROR"));
    }
}
