package com.zone.meal;

import com.zone.common.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin
public class MealController {

    private final MealRepository repo;

    public MealController(MealRepository repo) {
        this.repo = repo;
    }

    public record MealDto(Long id, LocalDate date, String mealType, String description, Integer calories) {
        static MealDto from(Meal m) {
            return new MealDto(m.getId(), m.getDate(), m.getMealType(), m.getDescription(), m.getCalories());
        }
    }

    public record MealRequest(
            @NotNull LocalDate date,
            @NotBlank String mealType,
            @NotBlank String description,
            @NotNull @Min(0) Integer calories
    ) {}

    @GetMapping
    public List<MealDto> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<Meal> rows = (from != null && to != null)
                ? repo.findAllByUserIdAndDateBetweenOrderByDateDescCreatedAtAsc(CurrentUser.ID, from, to)
                : repo.findAllByUserIdOrderByDateDescCreatedAtAsc(CurrentUser.ID);
        return rows.stream().map(MealDto::from).toList();
    }

    @PostMapping
    public MealDto create(@Valid @RequestBody MealRequest req) {
        Meal meal = new Meal();
        meal.setUserId(CurrentUser.ID);
        apply(meal, req);
        return MealDto.from(repo.save(meal));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MealDto> update(@PathVariable Long id, @Valid @RequestBody MealRequest req) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(meal -> { apply(meal, req); return ResponseEntity.ok(MealDto.from(repo.save(meal))); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(meal -> { repo.delete(meal); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }

    private static void apply(Meal meal, MealRequest req) {
        meal.setDate(req.date());
        meal.setMealType(req.mealType());
        meal.setDescription(req.description());
        meal.setCalories(req.calories());
    }
}
