package com.zone.activity;

import com.zone.common.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin
public class ActivityController {

    private final ActivityRepository repo;

    public ActivityController(ActivityRepository repo) {
        this.repo = repo;
    }

    public record ActivityDto(
            Long id, String title, OffsetDateTime startTime, OffsetDateTime endTime,
            Long categoryId, String notes) {
        static ActivityDto from(Activity a) {
            return new ActivityDto(a.getId(), a.getTitle(), a.getStartTime(),
                    a.getEndTime(), a.getCategoryId(), a.getNotes());
        }
    }

    public record ActivityRequest(
            @NotBlank String title,
            @NotNull OffsetDateTime startTime,
            @NotNull OffsetDateTime endTime,
            Long categoryId,
            String notes) {}

    @GetMapping
    public List<ActivityDto> list(
            @RequestParam(required = false) OffsetDateTime from,
            @RequestParam(required = false) OffsetDateTime to) {
        List<Activity> rows = (from != null && to != null)
                ? repo.findAllByUserIdAndStartTimeBetweenOrderByStartTimeAsc(CurrentUser.ID, from, to)
                : repo.findAllByUserIdOrderByStartTimeAsc(CurrentUser.ID);
        return rows.stream().map(ActivityDto::from).toList();
    }

    @PostMapping
    public ActivityDto create(@Valid @RequestBody ActivityRequest req) {
        Activity a = new Activity();
        a.setUserId(CurrentUser.ID);
        apply(a, req);
        return ActivityDto.from(repo.save(a));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ActivityDto> update(@PathVariable Long id, @Valid @RequestBody ActivityRequest req) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(a -> { apply(a, req); return ResponseEntity.ok(ActivityDto.from(repo.save(a))); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(a -> { repo.delete(a); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }

    private static void apply(Activity a, ActivityRequest req) {
        a.setTitle(req.title());
        a.setStartTime(req.startTime());
        a.setEndTime(req.endTime());
        a.setCategoryId(req.categoryId());
        a.setNotes(req.notes());
    }
}
