package com.baseball.ai.coach.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "players")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String team;

    private Integer backNumber;

    private String position;

    private String battingHand;  // "L" (좌타), "R" (우타), "S" (스위치타자)

    private String pitchingHand; // "L" (좌투), "R" (우투)
}
