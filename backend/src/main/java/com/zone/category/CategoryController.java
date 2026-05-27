package com.zone.category;

import com.zone.common.CurrentUser;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin
public class CategoryController {

    private final CategoryRepository repo;

    public CategoryController(CategoryRepository repo) {
        this.repo = repo;
    }

    public record CategoryDto(Long id, String name, String color) {
        static CategoryDto from(Category c) {
            return new CategoryDto(c.getId(), c.getName(), c.getColor());
        }
    }

    public record CreateCategoryRequest(@NotBlank String name, @NotBlank String color) {}

    @GetMapping
    public List<CategoryDto> list() {
        return repo.findAllByUserIdOrderByNameAsc(CurrentUser.ID)
                .stream().map(CategoryDto::from).toList();
    }

    @PostMapping
    public CategoryDto create(@RequestBody CreateCategoryRequest req) {
        Category c = new Category();
        c.setUserId(CurrentUser.ID);
        c.setName(req.name());
        c.setColor(req.color());
        return CategoryDto.from(repo.save(c));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(c -> { repo.delete(c); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }
}
