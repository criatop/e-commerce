package cl.ecommerce.product.service;

import cl.ecommerce.common.exception.NotFoundException;
import cl.ecommerce.product.model.Favorite;
import cl.ecommerce.product.repository.FavoriteRepository;
import cl.ecommerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void toggle(String userId, UUID productId) {
        favoriteRepository.findByUserIdAndProductId(userId, productId)
                .ifPresentOrElse(
                        existing -> favoriteRepository.deleteByUserIdAndProductId(userId, productId),
                        () -> {
                            productRepository.findById(productId)
                                    .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + productId));
                            favoriteRepository.save(Favorite.builder()
                                    .userId(userId)
                                    .productId(productId)
                                    .build());
                        }
                );
    }

    @Transactional(readOnly = true)
    public List<UUID> list(String userId) {
        return favoriteRepository.findByUserId(userId).stream()
                .map(Favorite::getProductId)
                .toList();
    }

    @Transactional
    public void remove(String userId, UUID productId) {
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
    }
}
