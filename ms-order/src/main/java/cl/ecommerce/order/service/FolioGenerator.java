package cl.ecommerce.order.service;

import cl.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class FolioGenerator {

    private static final DateTimeFormatter FMT = DateTimeFormatter.BASIC_ISO_DATE; // yyyyMMdd
    private final OrderRepository repo;

    public String nextFolio(LocalDate date) {
        long seq = repo.nextFolioSequence();
        return "CH-" + date.format(FMT) + "-" + String.format("%06d", seq);
    }
}
