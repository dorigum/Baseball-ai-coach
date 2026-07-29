package com.baseball.ai.coach.config;

import com.baseball.ai.coach.domain.Member;
import com.baseball.ai.coach.repository.MemberRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private final MemberRepository memberRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            Member member = null;

            if (FirebaseConfig.isMockMode()) {
                // Mock 모드인 경우 - 가상 토큰 파싱
                member = handleMockAuthentication(token, request);
            } else {
                // 실 서비스 Firebase 인증
                try {
                    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                    String uid = decodedToken.getUid();
                    String email = decodedToken.getEmail() != null ? decodedToken.getEmail() : "anonymous@baseball.com";
                    String name = decodedToken.getName() != null ? decodedToken.getName() : "야구팬";
                    String photoUrl = decodedToken.getPicture();

                    member = getOrCreateMember(uid, email, name, photoUrl);
                    // [1] 식별 정보(UID, 이름) 제거 - 이벤트명만 로깅
                    log.debug("[Firebase Auth] 인증 성공");
                } catch (Exception e) {
                    log.error("[Firebase Auth] ID Token 검증 에러: {}", e.getMessage());
                    // 토큰 검증 실패 시 401 리턴
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Firebase ID Token");
                    return;
                }
            }

            if (member != null) {
                MemberContext.setMember(member);
                request.setAttribute("currentMember", member);
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // 요청 처리가 끝나면 ThreadLocal 메모리 누수를 막기 위해 무조건 클리어
            MemberContext.clear();
        }
    }

    private Member handleMockAuthentication(String token, HttpServletRequest request) {
        // 프론트엔드에서 전달된 mock UID가 있으면 이를 활용, 없으면 기본 mock-uid 사용
        String mockUid = request.getHeader("X-Mock-UID");
        if (mockUid == null || mockUid.trim().isEmpty()) {
            mockUid = "mock-user-123";
        }

        String mockEmail = mockUid + "@baseball-mock.com";
        String mockName = "Mock " + (mockUid.equals("mock-user-123") ? "테스트 주자" : mockUid);
        String mockPhotoUrl = "https://lh3.googleusercontent.com/a/mock-photo-url";

        // [1] 식별 정보(UID) 제거
        log.debug("[Mock Auth] Bypass 인증 활성화");
        return getOrCreateMember(mockUid, mockEmail, mockName, mockPhotoUrl);
    }

    private Member getOrCreateMember(String uid, String email, String name, String photoUrl) {
        return memberRepository.findByUid(uid)
                .map(existingMember -> {
                    // 로그인 시 이름이나 프로필 사진이 바뀌었으면 업데이트
                    existingMember.updateProfile(name, photoUrl);
                    return memberRepository.save(existingMember);
                })
                .orElseGet(() -> createMemberWithRetry(uid, email, name, photoUrl));
    }

    /**
     * [2] 동일 UID 동시 요청(Race Condition) 방어.
     * 첫 INSERT 시도가 unique 제약 위반으로 실패하면 재조회하여 반환합니다.
     */
    private Member createMemberWithRetry(String uid, String email, String name, String photoUrl) {
        // 내부 상관관계 ID (회원 식별값 대신 트레이스용으로만 사용)
        String correlationId = UUID.randomUUID().toString().substring(0, 8);
        try {
            Member newMember = Member.builder()
                    .uid(uid)
                    .email(email)
                    .displayName(name)
                    .photoUrl(photoUrl)
                    .myTeam("LG") // 기본 선호 구단은 LG로 초기화
                    .build();
            // [1] 신규 가입 로그에서 UID, 이름 제거 → 내부 상관관계 ID만 기록
            log.info("[Firebase Auth] 신규 회원 가입 처리 (correlationId={})", correlationId);
            return memberRepository.save(newMember);
        } catch (DataIntegrityViolationException e) {
            // unique 제약 위반 → 동시 요청에 의해 이미 다른 스레드가 삽입 완료한 경우
            log.warn("[Firebase Auth] 회원 생성 경합 감지, 기존 레코드 재조회 (correlationId={})", correlationId);
            return memberRepository.findByUid(uid)
                    .orElseThrow(() -> new IllegalStateException(
                            "[Firebase Auth] 회원 재조회에 실패했습니다. (correlationId=" + correlationId + ")"));
        }
    }
}
