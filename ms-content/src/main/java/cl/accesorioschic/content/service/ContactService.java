package cl.accesorioschic.content.service;

import cl.accesorioschic.content.dto.ContactRequest;
import cl.accesorioschic.content.model.ContactMessage;
import cl.accesorioschic.content.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactService {
    private final ContactMessageRepository repository;

    public ContactMessage create(ContactRequest request) {
        ContactMessage msg = ContactMessage.builder()
                .id(UUID.randomUUID())
                .nombre(request.nombre())
                .apellido(request.apellido())
                .email(request.email())
                .mensaje(request.mensaje())
                .leido(false)
                .createdAt(LocalDateTime.now())
                .build();
        return repository.save(msg);
    }

    public List<ContactMessage> listAll() {
        return repository.findAll();
    }
}
