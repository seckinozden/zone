package com.zone.exercise;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ExerciseEntryRepository extends JpaRepository<ExerciseEntry, Long> {
    List<ExerciseEntry> findAllByUserIdAndPerformedAtBetweenOrderByPerformedAtDesc(
            String userId, OffsetDateTime from, OffsetDateTime to);

    List<ExerciseEntry> findAllByUserIdOrderByPerformedAtDesc(String userId);

    Optional<ExerciseEntry> findByIdAndUserId(Long id, String userId);
}
