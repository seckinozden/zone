package com.zone.meal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MealRepository extends JpaRepository<Meal, Long> {
    List<Meal> findAllByUserIdAndDateBetweenOrderByDateDescCreatedAtAsc(
            String userId, LocalDate from, LocalDate to);

    List<Meal> findAllByUserIdOrderByDateDescCreatedAtAsc(String userId);

    Optional<Meal> findByIdAndUserId(Long id, String userId);
}
