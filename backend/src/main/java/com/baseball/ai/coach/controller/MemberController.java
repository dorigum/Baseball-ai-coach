package com.baseball.ai.coach.controller;

import com.baseball.ai.coach.config.MemberContext;
import com.baseball.ai.coach.domain.Member;
import com.baseball.ai.coach.dto.MemberDto;
import com.baseball.ai.coach.dto.UpdateTeamRequest;
import com.baseball.ai.coach.repository.MemberRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberRepository memberRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        Member currentMember = MemberContext.getMember();
        if (currentMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요한 서비스입니다.");
        }
        return ResponseEntity.ok(MemberDto.from(currentMember));
    }

    @PutMapping("/me/team")
    public ResponseEntity<?> updateMyTeam(@Valid @RequestBody UpdateTeamRequest request) {
        Member currentMember = MemberContext.getMember();
        if (currentMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요한 서비스입니다.");
        }

        currentMember.updateMyTeam(request.getMyTeam());
        Member savedMember = memberRepository.save(currentMember);
        
        log.info("🎯 [Member] 회원 선호 구단 업데이트 완료: Team={}", savedMember.getMyTeam());
        return ResponseEntity.ok(MemberDto.from(savedMember));
    }
}
