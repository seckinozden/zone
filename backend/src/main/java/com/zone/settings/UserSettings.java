package com.zone.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "settings")
public class UserSettings {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "weekly_calorie_budget", nullable = false)
    private Integer weeklyCalorieBudget;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Integer getWeeklyCalorieBudget() { return weeklyCalorieBudget; }
    public void setWeeklyCalorieBudget(Integer weeklyCalorieBudget) { this.weeklyCalorieBudget = weeklyCalorieBudget; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
