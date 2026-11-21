package cl.ecommerce.order.service;

import cl.ecommerce.order.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FolioGeneratorTest {

    @Mock
    OrderRepository repo;

    @Test
    void folioTieneElFormatoEsperado() {
        when(repo.nextFolioSequence()).thenReturn(42L);
        FolioGenerator service = new FolioGenerator(repo);
        assertEquals("CH-20261118-000042", service.nextFolio(LocalDate.of(2026, 11, 18)));
    }
}
