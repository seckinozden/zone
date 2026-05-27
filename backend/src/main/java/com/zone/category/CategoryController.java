package com.zone.category;

import com.zone.common.CurrentUser;
import jakarta.validation.Valid;
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

    public record CategoryDto(Long id, String name, String color, String description) {
        static CategoryDto from(Category c) {
            return new CategoryDto(c.getId(), c.getName(), c.getColor(), c.getDescription());
        }
    }

    public record CategoryRequest(
            @NotBlank String name,
            @NotBlank String color,
            String description
    ) {}

    @GetMapping
    public List<CategoryDto> list() {
        return repo.findAllByUserIdOrderByNameAsc(CurrentUser.ID)
                .stream().map(CategoryDto::from).toList();
    }

    @PostMapping
    public CategoryDto create(@Valid @RequestBody CategoryRequest req) {
        Category c = new Category();
        c.setUserId(CurrentUser.ID);
        apply(c, req);
        return CategoryDto.from(repo.save(c));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CategoryDto> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest req) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(c -> { apply(c, req); return ResponseEntity.ok(CategoryDto.from(repo.save(c))); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(c -> { repo.delete(c); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }

    private static void apply(Category c, CategoryRequest req) {
        c.setName(req.name());
        c.setColor(req.color());
        c.setDescription(req.description());
    }
}
