package com.baseball.ai.coach.controller;

import com.baseball.ai.coach.dto.DashboardResponseDto;
import com.baseball.ai.coach.dto.PitchRecordRequestDto;
import com.baseball.ai.coach.service.CoachService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/coach")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 로컬 개발(Port 5173)과 백엔드(Port 8080) 통신 시 CORS 에러 방지
public class CoachController {

    private final CoachService coachService;

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
}
