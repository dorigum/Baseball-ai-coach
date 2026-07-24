package com.baseball.ai.coach.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdviceRequestDto {

    @NotBlank(message = "구장 정보는 필수입니다.")
    private String stadium;

    @NotBlank(message = "우리 팀 이름은 필수입니다.")
    private String myTeam;

    @NotBlank(message = "상대 팀 이름은 필수입니다.")
    private String opponentTeam;

    @NotNull(message = "이닝 정보는 필수입니다.")
    @Min(value = 1, message = "이닝은 1회 이상이어야 합니다.")
    private Integer inning;

    @NotBlank(message = "이닝 초/말 정보는 필수입니다.")
    private String inningHalf;

    @NotNull(message = "볼 수는 필수입니다.")
    @Min(value = 0, message = "볼은 0 이상이어야 합니다.")
    @Max(value = 3, message = "볼은 3 이하여야 합니다.")
    private Integer balls;

    @NotNull(message = "스트라이크 수는 필수입니다.")
    @Min(value = 0, message = "스트라이크는 0 이상이어야 합니다.")
    @Max(value = 2, message = "스트라이크는 2 이하여야 합니다.")
    private Integer strikes;

    @NotNull(message = "아웃 수는 필수입니다.")
    @Min(value = 0, message = "아웃은 0 이상이어야 합니다.")
    @Max(value = 2, message = "아웃은 2 이하여야 합니다.")
    private Integer outs;

    private boolean firstBase;
    private boolean secondBase;
    private boolean thirdBase;

    @NotBlank(message = "투수 이름은 필수입니다.")
    private String pitcherName;

    @NotBlank(message = "투수 소속 팀은 필수입니다.")
    private String pitcherTeam;

    @NotBlank(message = "타자 이름은 필수입니다.")
    private String batterName;

    @NotBlank(message = "타자 소속 팀은 필수입니다.")
    private String batterTeam;

    @NotBlank(message = "선택 구종은 필수입니다.")
    private String pitchType;

    @NotBlank(message = "수비 시프트 종류는 필수입니다.")
    private String shiftType;
}
