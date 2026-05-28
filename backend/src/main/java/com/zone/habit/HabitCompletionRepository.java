package com.zone.habit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitCompletionRepository extends JpaRepository<HabitCompletion, Long> {
    Optional<HabitCompletion> findByHabitIdAndDate(Long habitId, LocalDate date);
    void deleteByHabitIdAndDate(Long habitId, LocalDate date);

    @Query("""
            select c from HabitCompletion c
            join Habit h on h.id = c.habitId
            where h.userId = :userId and c.date between :from and :to
            order by c.date asc
            """)
    List<HabitCompletion> findAllForUserBetween(
            @Param("userId") String userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
