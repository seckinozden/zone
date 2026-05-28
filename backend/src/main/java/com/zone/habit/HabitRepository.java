package com.zone.habit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findAllByUserIdOrderByCreatedAtAsc(String userId);
    Optional<Habit> findByIdAndUserId(Long id, String userId);
}
