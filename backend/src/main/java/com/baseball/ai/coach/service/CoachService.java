package com.baseball.ai.coach.service;

import com.baseball.ai.coach.config.MemberContext;
import com.baseball.ai.coach.domain.*;
import com.baseball.ai.coach.dto.DashboardResponseDto;
import com.baseball.ai.coach.dto.PitchRecordRequestDto;
import com.baseball.ai.coach.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CoachService {

    private final GameRepository gameRepository;
    private final PlayerRepository playerRepository;
    private final PlateAppearanceRepository plateAppearanceRepository;
    private final PitchRecordRepository pitchRecordRepository;

    /**
     * 투구 세션 기록 저장 및 타석 종결 판별
     */
    @Transactional
    public void savePitchRecord(PitchRecordRequestDto dto) {
        // 1. Game 조회 또는 생성 (MemberContext에서 회원을 확인하여 연동)
        Member currentMember = MemberContext.getMember();
        if (currentMember == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증된 사용자만 기록을 저장할 수 있습니다.");
        }
        Game game = gameRepository.findByGameDateAndMemberUid(dto.getGameDate(), currentMember.getUid()).stream()
                .filter(g -> g.getStadium().equals(dto.getStadium())
                        && g.getMyTeam().equals(dto.getMyTeam())
                        && g.getOpponentTeam().equals(dto.getOpponentTeam()))
                .findFirst()
                .orElseGet(() -> gameRepository.save(Game.builder()
                        .gameDate(dto.getGameDate())
                        .stadium(dto.getStadium())
                        .myTeam(dto.getMyTeam())
                        .opponentTeam(dto.getOpponentTeam())
                        .ourScore(0)
                        .opponentScore(0)
                        .member(currentMember)
                        .build()));

        // 2. Player (투수/타자) 조회 또는 생성
        Player pitcher = playerRepository.findByNameAndTeam(dto.getPitcherName(), dto.getPitcherTeam())
                .orElseGet(() -> playerRepository.save(Player.builder()
                        .name(dto.getPitcherName())
                        .team(dto.getPitcherTeam())
                        .position("P")
                        .pitchingHand("R")
                        .build()));

        Player batter = playerRepository.findByNameAndTeam(dto.getBatterName(), dto.getBatterTeam())
                .orElseGet(() -> playerRepository.save(Player.builder()
                        .name(dto.getBatterName())
                        .team(dto.getBatterTeam())
                        .position("CF")
                        .battingHand("R")
                        .build()));

        // 3. 해당 타석 (PlateAppearance) 식별 또는 생성
        // 동일 경기, 이닝, 투수-타자 맞대결이며 아직 최종 결과가 안 나온 타석을 매칭함
        PlateAppearance pa = plateAppearanceRepository.findByGameId(game.getId()).stream()
                .filter(p -> p.getInning().equals(dto.getInning())
                        && p.getInningHalf().equals(dto.getInningHalf())
                        && p.getPitcher().getId().equals(pitcher.getId())
                        && p.getBatter().getId().equals(batter.getId())
                        && p.getFinalResult() == null)
                .findFirst()
                .orElseGet(() -> plateAppearanceRepository.save(PlateAppearance.builder()
                        .game(game)
                        .inning(dto.getInning())
                        .inningHalf(dto.getInningHalf())
                        .outs(dto.getOuts())
                        .pitcher(pitcher)
                        .batter(batter)
                        .build()));

        // 4. 해당 타석 하위 투구 개수 파악하여 시퀀스 매핑
        List<PitchRecord> existingPitches = pitchRecordRepository.findAll().stream()
                .filter(pr -> pr.getPlateAppearance().getId().equals(pa.getId()))
                .collect(Collectors.toList());
        int nextSeq = existingPitches.size() + 1;

        // 현재 투구 직전의 카운팅 시뮬레이션
        int ballsBefore = 0;
        int strikesBefore = 0;
        for (PitchRecord pr : existingPitches) {
            if ("Strike".equals(pr.getPitchResult())) strikesBefore++;
            else if ("Ball".equals(pr.getPitchResult())) ballsBefore++;
            else if ("Foul".equals(pr.getPitchResult()) && strikesBefore < 2) strikesBefore++;
        }

        // 5. PitchRecord 생성 및 저장
        PitchRecord record = PitchRecord.builder()
                .plateAppearance(pa)
                .pitchSequence(nextSeq)
                .pitchType(dto.getPitchType())
                .pitchSpeed(dto.getPitchSpeed())
                .balls(ballsBefore)
                .strikes(strikesBefore)
                .pitchResult(dto.getPitchResult())
                .hitLocationX(dto.getHitLocationX())
                .hitLocationY(dto.getHitLocationY())
                .pitchZone(dto.getPitchZone())
                .build();
        pitchRecordRepository.save(record);

        // 6. 타석 최종 결과가 발생하는 트리거인지 감지하여 종결 처리
        int strikesAfter = strikesBefore + ("Strike".equals(dto.getPitchResult()) ? 1 : 0);
        if ("Foul".equals(dto.getPitchResult()) && strikesBefore < 2) strikesAfter++;
        int ballsAfter = ballsBefore + ("Ball".equals(dto.getPitchResult()) ? 1 : 0);

        if ("InPlay".equals(dto.getPitchResult())) {
            pa.setFinalResult(dto.getPlayResult());
            plateAppearanceRepository.save(pa);
        } else if (strikesAfter >= 3) {
            pa.setFinalResult("Strikeout");
            plateAppearanceRepository.save(pa);
        } else if (ballsAfter >= 4) {
            pa.setFinalResult("Walk");
            plateAppearanceRepository.save(pa);
        }
    }

    /**
     * 특정 경기(또는 전체 경기) 기반 대시보드 통계 및 최신 로그 리포트 집계
     */
    public DashboardResponseDto getDashboardData(Long gameId) {
        Member currentMember = MemberContext.getMember();
        if (currentMember == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증된 사용자만 대시보드를 조회할 수 있습니다.");
        }
        List<PitchRecord> records;
        
        if (gameId != null) {
            records = pitchRecordRepository.findByPlateAppearanceGameIdAndPlateAppearanceGameMemberUid(gameId, currentMember.getUid());
        } else {
            records = pitchRecordRepository.findByPlateAppearanceGameMemberUid(currentMember.getUid());
        }

        // 1. 최근 투구 로그 리스트 변환 (최근 15건)
        List<DashboardResponseDto.PitchLogDto> logDtos = records.stream()
                .sorted(Comparator.comparing(PitchRecord::getId).reversed())
                .limit(15)
                .map(r -> {
                    PlateAppearance pa = r.getPlateAppearance();
                    Game g = pa.getGame();
                    return DashboardResponseDto.PitchLogDto.builder()
                            .id(r.getId())
                            .gameInfo(DashboardResponseDto.GameInfoDto.builder()
                                    .date(g.getGameDate().toString())
                                    .stadium(g.getStadium())
                                    .myTeam(g.getMyTeam())
                                    .opponentTeam(g.getOpponentTeam())
                                    .inning(pa.getInning())
                                    .inningHalf(pa.getInningHalf())
                                    .build())
                            .pitcherName(pa.getPitcher().getName())
                            .pitcherTeam(pa.getPitcher().getTeam())
                            .batterName(pa.getBatter().getName())
                            .batterTeam(pa.getBatter().getTeam())
                            .pitchType(r.getPitchType())
                            .pitchSpeed(r.getPitchSpeed())
                            .pitchResult(r.getPitchResult())
                            .playResult(pa.getFinalResult())
                            .hitLocationX(r.getHitLocationX())
                            .hitLocationY(r.getHitLocationY())
                            .pitchZone(r.getPitchZone())
                            .build();
                })
                .collect(Collectors.toList());

        // 2. 구종 비율 통계
        Map<String, Long> typeCountMap = records.stream()
                .collect(Collectors.groupingBy(PitchRecord::getPitchType, Collectors.counting()));
        List<DashboardResponseDto.PitchTypeStatDto> typeStats = typeCountMap.entrySet().stream()
                .map(e -> new DashboardResponseDto.PitchTypeStatDto(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // 3. 인플레이 타격 아웃풋 결과 통계
        Map<String, Long> playCountMap = records.stream()
                .map(r -> r.getPlateAppearance().getFinalResult())
                .filter(res -> res != null && !res.isEmpty())
                .collect(Collectors.groupingBy(res -> res, Collectors.counting()));
        List<DashboardResponseDto.PlayResultStatDto> playStats = playCountMap.entrySet().stream()
                .map(e -> new DashboardResponseDto.PlayResultStatDto(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return DashboardResponseDto.builder()
                .pitchLogs(logDtos)
                .pitchTypeStats(typeStats)
                .playResultStats(playStats)
                .build();
    }
}
