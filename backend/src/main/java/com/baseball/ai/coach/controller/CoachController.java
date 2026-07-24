package com.baseball.ai.coach.controller;

import com.baseball.ai.coach.dto.AdviceRequestDto;
import com.baseball.ai.coach.dto.DashboardResponseDto;
import com.baseball.ai.coach.dto.PitchRecordRequestDto;
import com.baseball.ai.coach.service.AiAdviceService;
import com.baseball.ai.coach.service.CoachService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.ai.retry.TransientAiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/coach")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 로컬 개발(Port 5173)과 백엔드(Port 8080) 통신 시 CORS 에러 방지
@Slf4j
public class CoachController {

    private final CoachService coachService;
    private final AiAdviceService aiAdviceService;

    /**
     * 투구 세션 기록 저장 API
     */
    @PostMapping("/pitch")
    public ResponseEntity<Map<String, String>> logPitch(@RequestBody PitchRecordRequestDto requestDto) {
        coachService.savePitchRecord(requestDto);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "투구 기록이 정상적으로 저장되었습니다.");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 대시보드 시각화 및 최근 로그 목록 반환 API
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDto> getDashboard(
            @RequestParam(value = "gameId", required = false) Long gameId) {
        DashboardResponseDto dashboardData = coachService.getDashboardData(gameId);
        return ResponseEntity.ok(dashboardData);
    }

    /**
     * [NEW] Gemini API 연동 실시간 야구 전술 조언 획득 API
     * (입력값 유효성 검증 적용 및 예상치 못한 내부 런타임 에러는 500 상태코드로 분리)
     */
    @PostMapping("/advice")
    public ResponseEntity<Map<String, String>> getTacticalAdvice(@Valid @RequestBody AdviceRequestDto requestDto) {
        try {
            String advice = aiAdviceService.generateTacticalAdvice(requestDto);
            
            Map<String, String> response = new HashMap<>();
            response.put("advice", advice);
            
            return ResponseEntity.ok(response);
        } catch (TransientAiException | NonTransientAiException | RestClientException e) {
            // AI 공급자 관련 서비스 불가 상황 및 네트워크 장애 예외만 503으로 처리
            log.error("AI service is temporarily unavailable for request: {}", requestDto, e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "AI service is temporarily unavailable");
            errorResponse.put("details", "Gemini API 호출에 실패하였습니다.");
            
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        }
    }
}
