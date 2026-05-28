package com.zone.sleep;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SleepEntryRepository extends JpaRepository<SleepEntry, Long> {
    List<SleepEntry> findAllByUserIdAndDateBetweenOrderByDateDesc(
            String userId, LocalDate from, LocalDate to);

    List<SleepEntry> findAllByUserIdOrderByDateDesc(String userId);

    Optional<SleepEntry> findByIdAndUserId(Long id, String userId);
}
