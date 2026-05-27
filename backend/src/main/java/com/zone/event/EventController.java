package com.zone.event;

import com.zone.common.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin
public class EventController {

    private final EventRepository repo;

    public EventController(EventRepository repo) {
        this.repo = repo;
    }

    public record EventDto(
            Long id, String title, OffsetDateTime startTime, OffsetDateTime endTime,
            Long categoryId, String notes) {
        static EventDto from(Event e) {
            return new EventDto(e.getId(), e.getTitle(), e.getStartTime(),
                    e.getEndTime(), e.getCategoryId(), e.getNotes());
        }
    }

    public record EventRequest(
            @NotBlank String title,
            @NotNull OffsetDateTime startTime,
            @NotNull OffsetDateTime endTime,
            Long categoryId,
            String notes) {}

    @GetMapping
    public List<EventDto> list(
            @RequestParam(required = false) OffsetDateTime from,
            @RequestParam(required = false) OffsetDateTime to) {
        List<Event> rows = (from != null && to != null)
                ? repo.findAllByUserIdAndStartTimeBetweenOrderByStartTimeAsc(CurrentUser.ID, from, to)
                : repo.findAllByUserIdOrderByStartTimeAsc(CurrentUser.ID);
        return rows.stream().map(EventDto::from).toList();
    }

    @PostMapping
    public EventDto create(@Valid @RequestBody EventRequest req) {
        Event e = new Event();
        e.setUserId(CurrentUser.ID);
        apply(e, req);
        return EventDto.from(repo.save(e));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EventDto> update(@PathVariable Long id, @Valid @RequestBody EventRequest req) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(e -> { apply(e, req); return ResponseEntity.ok(EventDto.from(repo.save(e))); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(e -> { repo.delete(e); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }

    private static void apply(Event e, EventRequest req) {
        e.setTitle(req.title());
        e.setStartTime(req.startTime());
        e.setEndTime(req.endTime());
        e.setCategoryId(req.categoryId());
        e.setNotes(req.notes());
    }
}
