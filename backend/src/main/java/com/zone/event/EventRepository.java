package com.zone.event;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByUserIdAndStartTimeBetweenOrderByStartTimeAsc(
            String userId, OffsetDateTime from, OffsetDateTime to);

    List<Event> findAllByUserIdOrderByStartTimeAsc(String userId);

    Optional<Event> findByIdAndUserId(Long id, String userId);
}
