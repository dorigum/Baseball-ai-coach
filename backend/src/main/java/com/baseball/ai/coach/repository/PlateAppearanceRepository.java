package com.baseball.ai.coach.repository;

import com.baseball.ai.coach.domain.PlateAppearance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlateAppearanceRepository extends JpaRepository<PlateAppearance, Long> {
    List<PlateAppearance> findByGameId(Long gameId);
}
