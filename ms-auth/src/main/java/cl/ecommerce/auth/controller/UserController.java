package cl.ecommerce.auth.controller;

import cl.ecommerce.auth.dto.UpdateUserRequest;
import cl.ecommerce.auth.dto.UserResponse;
import cl.ecommerce.auth.service.AuthService;
import cl.ecommerce.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> list(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(ApiResponse.ok(authService.listUsers(q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(authService.getUser(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> update(@PathVariable Long id,
                                                            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.updateUser(id, request), "Usuario actualizado"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> delete(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(authService.deleteUser(id), "Usuario desactivado"));
    }
}
