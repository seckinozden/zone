package com.zone.task;

import com.zone.common.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin
public class TaskController {

    private final TaskRepository repo;

    public TaskController(TaskRepository repo) {
        this.repo = repo;
    }

    public record TaskDto(
            Long id, String title, LocalDate dueDate, Task.Status status,
            Long categoryId, String notes) {
        static TaskDto from(Task t) {
            return new TaskDto(t.getId(), t.getTitle(), t.getDueDate(),
                    t.getStatus(), t.getCategoryId(), t.getNotes());
        }
    }

    public record TaskRequest(
            @NotBlank String title,
            LocalDate dueDate,
            Task.Status status,
            Long categoryId,
            String notes) {}

    @GetMapping
    public List<TaskDto> list() {
        return repo.findAllByUserIdOrderByDueDateAscIdAsc(CurrentUser.ID)
                .stream().map(TaskDto::from).toList();
    }

    @PostMapping
    public TaskDto create(@Valid @RequestBody TaskRequest req) {
        Task t = new Task();
        t.setUserId(CurrentUser.ID);
        apply(t, req);
        return TaskDto.from(repo.save(t));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskDto> update(@PathVariable Long id, @Valid @RequestBody TaskRequest req) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(t -> { apply(t, req); return ResponseEntity.ok(TaskDto.from(repo.save(t))); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(t -> { repo.delete(t); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }

    private static void apply(Task t, TaskRequest req) {
        t.setTitle(req.title());
        t.setDueDate(req.dueDate());
        if (req.status() != null) t.setStatus(req.status());
        t.setCategoryId(req.categoryId());
        t.setNotes(req.notes());
    }
}
