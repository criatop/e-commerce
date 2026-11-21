package cl.accesorioschic.content.controller;

import cl.accesorioschic.content.dto.ContactRequest;
import cl.accesorioschic.content.model.ContactMessage;
import cl.accesorioschic.content.service.ContactService;
import cl.ecommerce.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
public class ContactController {
    private final ContactService contactService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ContactMessage> create(@Valid @RequestBody ContactRequest request) {
        return ApiResponse.ok(contactService.create(request), "Mensaje recibido");
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ContactMessage>> list() {
        return ApiResponse.ok(contactService.listAll());
    }
}
