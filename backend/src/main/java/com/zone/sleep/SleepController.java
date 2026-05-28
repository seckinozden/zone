package com.zone.sleep;

import com.zone.common.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sleep")
@CrossOrigin
public class SleepController {

    private final SleepEntryRepository repo;

    public SleepController(SleepEntryRepository repo) {
        this.repo = repo;
    }

    public record SleepDto(
            Long id,
            LocalDate date,
            Integer score,
            Integer durationMin,
            String notes
    ) {
        static SleepDto from(SleepEntry e) {
            return new SleepDto(e.getId(), e.getDate(), e.getScore(), e.getDurationMin(), e.getNotes());
        }
    }

    public record SleepRequest(
            @NotNull LocalDate date,
            @NotNull @Min(0) @Max(100) Integer score,
            @Min(1) Integer durationMin,
            String notes
    ) {}

    /** Inclusive [from, to] range. Both bounds optional; without them all entries are returned. */
    @GetMapping
    public List<SleepDto> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<SleepEntry> rows = (from != null && to != null)
                ? repo.findAllByUserIdAndDateBetweenOrderByDateDesc(CurrentUser.ID, from, to)
                : repo.findAllByUserIdOrderByDateDesc(CurrentUser.ID);
        return rows.stream().map(SleepDto::from).toList();
    }

    @PostMapping
    public ResponseEntity<SleepDto> create(@Valid @RequestBody SleepRequest req) {
        SleepEntry e = new SleepEntry();
        e.setUserId(CurrentUser.ID);
        apply(e, req);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(SleepDto.from(repo.saveAndFlush(e)));
        } catch (DataIntegrityViolationException ex) {
            // UNIQUE(user_id, date) violation — an entry for this date already exists.
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SleepDto> update(@PathVariable Long id, @Valid @RequestBody SleepRequest req) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(e -> {
                    apply(e, req);
                    try {
                        return ResponseEntity.ok(SleepDto.from(repo.saveAndFlush(e)));
                    } catch (DataIntegrityViolationException ex) {
                        return ResponseEntity.status(HttpStatus.CONFLICT).<SleepDto>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repo.findByIdAndUserId(id, CurrentUser.ID)
                .map(e -> { repo.delete(e); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }

    private static void apply(SleepEntry e, SleepRequest req) {
        e.setDate(req.date());
        e.setScore(req.score());
        e.setDurationMin(req.durationMin());
        e.setNotes(req.notes());
    }
}
