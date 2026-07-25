package com.baseball.ai.coach.repository;

import com.baseball.ai.coach.domain.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByGameDate(LocalDate gameDate);
    List<Game> findByMemberUid(String uid);
    List<Game> findByGameDateAndMemberUid(LocalDate gameDate, String uid);
    List<Game> findByGameDateAndMemberIsNull(LocalDate gameDate);
}
