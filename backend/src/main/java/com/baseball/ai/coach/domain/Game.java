package com.baseball.ai.coach.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "games")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate gameDate;

    @Column(nullable = false)
    private String stadium;

    @Column(nullable = false)
    private String myTeam;

    @Column(nullable = false)
    private String opponentTeam;

    private Integer ourScore;

    private Integer opponentScore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;
}
