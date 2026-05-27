package com.zone.category;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByUserIdOrderByNameAsc(String userId);
    Optional<Category> findByIdAndUserId(Long id, String userId);
}
