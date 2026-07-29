package com.baseball.ai.coach.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pitch_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PitchRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plate_appearance_id", nullable = false)
    private PlateAppearance plateAppearance;

    @Column(nullable = false)
    private Integer pitchSequence; // 몇 번째 투구인지 (1, 2, 3...)

    @Column(nullable = false)
    private String pitchType; // "Fastball", "Slider", "Curve", "Changeup", "Splitter", "Cutter"

    @Column(nullable = false)
    private Integer pitchSpeed; // 구속 (km/h)

    private Integer balls;   // 투구 직전 볼 카운트 (0~3)

    private Integer strikes; // 투구 직전 스트라이크 카운트 (0~2)

    @Column(nullable = false)
    private String pitchResult; // "Strike", "Ball", "Foul", "InPlay"

    private Double hitLocationX; // 타구 낙하지점 X 좌표

    private Double hitLocationY; // 타구 낙하지점 Y 좌표

    private Integer pitchZone; // 투구 코스 존 (1~9: 스트라이크존, 10~13: 외곽볼존)
}
