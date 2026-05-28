package com.zone.settings;

import com.zone.common.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin
public class SettingsController {

    private static final int DEFAULT_WEEKLY_CALORIE_BUDGET = 14000;

    private final UserSettingsRepository repo;

    public SettingsController(UserSettingsRepository repo) {
        this.repo = repo;
    }

    public record SettingsDto(Integer weeklyCalorieBudget) {
        static SettingsDto from(UserSettings s) {
            return new SettingsDto(s.getWeeklyCalorieBudget());
        }
    }

    public record SettingsRequest(@NotNull @Min(1) Integer weeklyCalorieBudget) {}

    @GetMapping
    public SettingsDto get() {
        return SettingsDto.from(repo.findById(CurrentUser.ID).orElseGet(this::createDefault));
    }

    @PatchMapping
    public SettingsDto update(@Valid @RequestBody SettingsRequest req) {
        UserSettings settings = repo.findById(CurrentUser.ID).orElseGet(this::newDefault);
        settings.setWeeklyCalorieBudget(req.weeklyCalorieBudget());
        return SettingsDto.from(repo.save(settings));
    }

    private UserSettings createDefault() {
        return repo.save(newDefault());
    }

    private UserSettings newDefault() {
        UserSettings settings = new UserSettings();
        settings.setUserId(CurrentUser.ID);
        settings.setWeeklyCalorieBudget(DEFAULT_WEEKLY_CALORIE_BUDGET);
        return settings;
    }
}
