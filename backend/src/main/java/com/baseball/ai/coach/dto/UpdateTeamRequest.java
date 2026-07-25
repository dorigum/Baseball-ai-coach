package com.baseball.ai.coach.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateTeamRequest {
    @NotBlank(message = "선호 구단명은 비어 있을 수 없습니다.")
    private String myTeam;
}
