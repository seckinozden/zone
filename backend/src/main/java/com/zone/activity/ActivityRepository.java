package com.zone.activity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findAllByUserIdAndStartTimeBetweenOrderByStartTimeAsc(
            String userId, OffsetDateTime from, OffsetDateTime to);

    List<Activity> findAllByUserIdOrderByStartTimeAsc(String userId);

    Optional<Activity> findByIdAndUserId(Long id, String userId);
}
