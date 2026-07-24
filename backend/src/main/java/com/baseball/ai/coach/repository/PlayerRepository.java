package com.baseball.ai.coach.repository;

import com.baseball.ai.coach.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long> {
    Optional<Player> findByNameAndTeam(String name, String team);
}
