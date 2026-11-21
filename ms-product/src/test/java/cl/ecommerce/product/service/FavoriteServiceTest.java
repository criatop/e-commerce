package cl.ecommerce.product.service;

import cl.ecommerce.product.model.Favorite;
import cl.ecommerce.product.model.Product;
import cl.ecommerce.product.repository.FavoriteRepository;
import cl.ecommerce.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private ProductRepository productRepository;

    private FavoriteService favoriteService;

    @BeforeEach
    void setUp() {
        favoriteService = new FavoriteService(favoriteRepository, productRepository);
    }

    @Test
    void alternarDosVecesDejaLaTablaVacia() {
        String uid = "42";
        UUID productId = UUID.randomUUID();

        when(favoriteRepository.findByUserIdAndProductId(uid, productId))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(Favorite.builder().id(UUID.randomUUID()).userId(uid).productId(productId).build()));
        when(productRepository.findById(productId)).thenReturn(Optional.of(Product.builder().id(productId).build()));

        favoriteService.toggle(uid, productId);
        favoriteService.toggle(uid, productId);

        verify(favoriteRepository, times(1)).save(any(Favorite.class));
        ArgumentCaptor<Favorite> captor = ArgumentCaptor.forClass(Favorite.class);
        verify(favoriteRepository).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(uid);
        assertThat(captor.getValue().getProductId()).isEqualTo(productId);

        verify(favoriteRepository, times(1)).deleteByUserIdAndProductId(uid, productId);
    }

    @Test
    void listDevuelveSoloLosDelUidRecibido() {
        String uid = "7";
        UUID p1 = UUID.randomUUID();
        UUID p2 = UUID.randomUUID();
        when(favoriteRepository.findByUserId(uid)).thenReturn(List.of(
                Favorite.builder().id(UUID.randomUUID()).userId(uid).productId(p1).build(),
                Favorite.builder().id(UUID.randomUUID()).userId(uid).productId(p2).build()
        ));

        List<UUID> result = favoriteService.list(uid);

        assertThat(result).containsExactly(p1, p2);
        verify(favoriteRepository).findByUserId(uid);
        verifyNoMoreInteractions(favoriteRepository);
        verifyNoInteractions(productRepository);
    }
}
