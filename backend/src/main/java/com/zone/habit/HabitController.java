package com.zone.habit;

import com.zone.common.CurrentUser;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin
public class HabitController {

    private final HabitRepository habitRepo;
    private final HabitCompletionRepository completionRepo;

    public HabitController(HabitRepository habitRepo, HabitCompletionRepository completionRepo) {
        this.habitRepo = habitRepo;
        this.completionRepo = completionRepo;
    }

    public record HabitDto(Long id, String name, String color, String targetKind, Integer targetCount) {
        static HabitDto from(Habit h) {
            return new HabitDto(h.getId(), h.getName(), h.getColor(), h.getTargetKind(), h.getTargetCount());
        }
    }

    public record CompletionDto(Long id, Long habitId, LocalDate date) {
        static CompletionDto from(HabitCompletion c) {
            return new CompletionDto(c.getId(), c.getHabitId(), c.getDate());
        }
    }

    public record HabitRequest(
            @NotBlank String name,
            @NotBlank String color,
            @NotBlank String targetKind,
            @NotNull @Min(1) @Max(7) Integer targetCount
    ) {}

    @GetMapping
    public List<HabitDto> listHabits() {
        return habitRepo.findAllByUserIdOrderByCreatedAtAsc(CurrentUser.ID).stream()
                .map(HabitDto::from)
                .toList();
    }

    @PostMapping
    public HabitDto createHabit(@Valid @RequestBody HabitRequest req) {
        Habit habit = new Habit();
        habit.setUserId(CurrentUser.ID);
        apply(habit, req);
        return HabitDto.from(habitRepo.save(habit));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<HabitDto> updateHabit(@PathVariable Long id, @Valid @RequestBody HabitRequest req) {
        return habitRepo.findByIdAndUserId(id, CurrentUser.ID)
                .map(habit -> { apply(habit, req); return ResponseEntity.ok(HabitDto.from(habitRepo.save(habit))); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable Long id) {
        return habitRepo.findByIdAndUserId(id, CurrentUser.ID)
                .map(habit -> { habitRepo.delete(habit); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/completions")
    public List<CompletionDto> listCompletions(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return completionRepo.findAllForUserBetween(CurrentUser.ID, from, to).stream()
                .map(CompletionDto::from)
                .toList();
    }

    @PutMapping("/{id}/completions/{date}")
    public ResponseEntity<CompletionDto> complete(
            @PathVariable Long id,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (habitRepo.findByIdAndUserId(id, CurrentUser.ID).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return completionRepo.findByHabitIdAndDate(id, date)
                .map(c -> ResponseEntity.ok(CompletionDto.from(c)))
                .orElseGet(() -> {
                    HabitCompletion completion = new HabitCompletion();
                    completion.setHabitId(id);
                    completion.setDate(date);
                    try {
                        return ResponseEntity.ok(CompletionDto.from(completionRepo.saveAndFlush(completion)));
                    } catch (DataIntegrityViolationException ex) {
                        return completionRepo.findByHabitIdAndDate(id, date)
                                .map(c -> ResponseEntity.ok(CompletionDto.from(c)))
                                .orElse(ResponseEntity.internalServerError().build());
                    }
                });
    }

    @Transactional
    @DeleteMapping("/{id}/completions/{date}")
    public ResponseEntity<Void> uncomplete(
            @PathVariable Long id,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (habitRepo.findByIdAndUserId(id, CurrentUser.ID).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        completionRepo.deleteByHabitIdAndDate(id, date);
        return ResponseEntity.noContent().build();
    }

    private static void apply(Habit habit, HabitRequest req) {
        String kind = req.targetKind();
        habit.setName(req.name());
        habit.setColor(req.color());
        habit.setTargetKind(kind);
        habit.setTargetCount("daily".equals(kind) ? 1 : req.targetCount());
    }
}
