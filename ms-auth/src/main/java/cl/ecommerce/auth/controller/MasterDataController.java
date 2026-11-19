package cl.ecommerce.auth.controller;

import cl.ecommerce.auth.dto.ComunaResponse;
import cl.ecommerce.auth.dto.RegionResponse;
import cl.ecommerce.auth.dto.RoleResponse;
import cl.ecommerce.auth.service.AuthService;
import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MasterDataController {

    private final AuthService authService;

    @GetMapping("/regions")
    public ResponseEntity<ApiResponse<List<RegionResponse>>> regions() {
        return ResponseEntity.ok(ApiResponse.ok(authService.regions()));
    }

    @GetMapping("/comunas")
    public ResponseEntity<ApiResponse<List<ComunaResponse>>> comunas(
            @RequestParam(required = false) Integer regionId) {
        if (regionId == null) {
            throw new BusinessException("El parametro regionId es obligatorio");
        }
        return ResponseEntity.ok(ApiResponse.ok(authService.comunas(regionId)));
    }

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> roles() {
        return ResponseEntity.ok(ApiResponse.ok(authService.roles()));
    }
}
