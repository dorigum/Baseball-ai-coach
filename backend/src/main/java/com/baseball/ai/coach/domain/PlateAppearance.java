package com.baseball.ai.coach.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "plate_appearances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlateAppearance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(nullable = false)
    private Integer inning;

    @Column(nullable = false, length = 10)
    private String inningHalf; // "초" or "말"

    private Integer outs; // 타석 시작 시점의 아웃카운트 (0, 1, 2)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pitcher_id", nullable = false)
    private Player pitcher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batter_id", nullable = false)
    private Player batter;

    private String finalResult; // "Single", "Double", "Triple", "HomeRun", "Strikeout", "Walk", "Groundout", "Flyout", "Error"
}
