package com.baseball.ai.coach.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PitchRecordRequestDto {
    // 경기 정보
    private LocalDate gameDate;
    private String stadium;
    private String myTeam;
    private String opponentTeam;
    private Integer inning;
    private String inningHalf;
    private Integer outs;

    // 선수 정보
    private String pitcherName;
    private String pitcherTeam;
    private String batterName;
    private String batterTeam;

    // 투구 정보
    private String pitchType;
    private Integer pitchSpeed;
    private String pitchResult; // "Strike", "Ball", "Foul", "InPlay"
    private String playResult;   // "Single", "Double", "HomeRun" 등 (선택적)
    
    // 타구 좌표
    private Double hitLocationX;
    private Double hitLocationY;
}
