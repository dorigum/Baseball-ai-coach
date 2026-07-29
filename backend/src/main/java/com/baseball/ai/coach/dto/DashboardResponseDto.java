package com.baseball.ai.coach.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponseDto {
    private List<PitchLogDto> pitchLogs;
    private List<PitchTypeStatDto> pitchTypeStats;
    private List<PlayResultStatDto> playResultStats;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PitchLogDto {
        private Long id;
        private GameInfoDto gameInfo;
        private String pitcherName;
        private String pitcherTeam;
        private String batterName;
        private String batterTeam;
        private String pitchType;
        private Integer pitchSpeed;
        private String pitchResult;
        private String playResult;
        private Double hitLocationX;
        private Double hitLocationY;
        private Integer pitchZone;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GameInfoDto {
        private String date;
        private String stadium;
        private String myTeam;
        private String opponentTeam;
        private Integer inning;
        private String inningHalf;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PitchTypeStatDto {
        private String name;
        private Long value;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayResultStatDto {
        private String name;
        private Long count;
    }
}
