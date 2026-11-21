package cl.ecommerce.product.controller;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.security.SecurityUtils;
import cl.ecommerce.product.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    @Operation(summary = "Listar favoritos del usuario autenticado")
    public ResponseEntity<ApiResponse<List<UUID>>> list() {
        String uid = String.valueOf(SecurityUtils.currentUserId());
        return ResponseEntity.ok(ApiResponse.ok(favoriteService.list(uid)));
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Agregar o alternar favorito")
    public ResponseEntity<ApiResponse<Void>> toggle(@PathVariable UUID productId) {
        String uid = String.valueOf(SecurityUtils.currentUserId());
        favoriteService.toggle(uid, productId);
        return ResponseEntity.ok(ApiResponse.<Void>ok(null, "Favorito actualizado"));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Eliminar favorito")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable UUID productId) {
        String uid = String.valueOf(SecurityUtils.currentUserId());
        favoriteService.remove(uid, productId);
        return ResponseEntity.ok(ApiResponse.<Void>ok(null, "Favorito eliminado"));
    }
}
