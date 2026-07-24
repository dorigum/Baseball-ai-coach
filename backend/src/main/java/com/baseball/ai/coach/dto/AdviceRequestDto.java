package com.baseball.ai.coach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdviceRequestDto {
    private String stadium;
    private String myTeam;
    private String opponentTeam;
    private Integer inning;
    private String inningHalf;
    private Integer balls;
    private Integer strikes;
    private Integer outs;
    private boolean firstBase;
    private boolean secondBase;
    private boolean thirdBase;
    private String pitcherName;
    private String pitcherTeam;
    private String batterName;
    private String batterTeam;
    private String pitchType;
    private String shiftType;
}
