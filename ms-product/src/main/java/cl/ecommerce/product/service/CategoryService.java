package cl.ecommerce.product.service;

import cl.ecommerce.common.exception.NotFoundException;
import cl.ecommerce.product.dto.CategoryRequest;
import cl.ecommerce.product.dto.CategoryResponse;
import cl.ecommerce.product.model.Category;
import cl.ecommerce.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryResponse create(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.name())
                .description(request.description())
                .activa(request.activa() == null || request.activa())
                .build();
        return toResponse(categoryRepository.save(category));
    }

    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    public CategoryResponse getById(UUID id) {
        return toResponse(findById(id));
    }

    public CategoryResponse update(UUID id, CategoryRequest request) {
        Category category = findById(id);
        category.setName(request.name());
        category.setDescription(request.description());
        if (request.activa() != null) {
            category.setActiva(request.activa());
        }
        return toResponse(categoryRepository.save(category));
    }

    public void delete(UUID id) {
        Category category = findById(id);
        categoryRepository.delete(category);
    }

    private Category findById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Categoria no encontrada con id: " + id));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription(), category.isActiva());
    }
}
