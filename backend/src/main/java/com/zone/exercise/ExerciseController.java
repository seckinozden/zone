package com.zone.exercise;

import com.zone.common.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/exercise")
@CrossOrigin
public class ExerciseController {

    private final ExerciseEntryRepository repo;

    public ExerciseController(ExerciseEntryRepository repo) {
        this.repo = repo;
    }

    public record ExerciseDto(
            Long id,
            OffsetDateTime performedAt,
            String type,
            Integer durationMin,
            Integer caloriesBurned,
            String notes
    ) {
        static ExerciseDto from(ExerciseEntry e) {
            return new ExerciseDto(
                    e.getId(),
                    e.getPerformedAt(),
                    e.getType(),
                    e.getDurationMin(),
                    e.getCaloriesBurned(),
                    e.getNotes()
            );
        }
    }

    public record ExerciseRequest(
            @NotNull OffsetDateTime performedAt,
            @NotBlank String type,
            @Min(1) Integer durationMin,
            @NotNull @Min(0) Integer caloriesBurned,
            String notes
    ) {}

    @GetMapping
    public List<ExerciseDto> list(
            @RequestParam(required = false) OffsetDateTime from,
            @RequestParam(required = false) OffsetDateTime to) {
        List<ExerciseEntry> rows = (from != null && to != null)
                ? repo.findAllByUserIdAndPerformedAtBetweenOrderByPerformedAtDesc(CurrentUser.ID, from, to)
                : repo.findAllByUserIdOrderByPerformedAtDesc(CurrentUser.ID);
        return rows.stream().map(ExerciseDto::from).toList();
    }

    @PostMapping
    public ExerciseDto create(@Valid @RequestBody ExerciseRequest req) {
        ExerciseEntry e = new ExerciseEntry();
        e.setUserId(CurrentUser.ID);
        apply(e, req);
        return ExerciseDto.from(repo.save(e));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ExerciseDto> update(@PathVariable Long id, @Valid @RequestBody ExerciseRequest req) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(e -> { apply(e, req); return ResponseEntity.ok(ExerciseDto.from(repo.save(e))); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(e -> { repo.delete(e); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }

    private static void apply(ExerciseEntry e, ExerciseRequest req) {
        e.setPerformedAt(req.performedAt());
        e.setType(req.type());
        e.setDurationMin(req.durationMin());
        e.setCaloriesBurned(req.caloriesBurned());
        e.setNotes(req.notes());
    }
}
