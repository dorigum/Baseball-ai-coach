package com.baseball.ai.coach.service;

import com.baseball.ai.coach.dto.AdviceRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiAdviceService {

    private final ChatModel chatModel;

    /**
     * Gemini 3.5 Flash-Lite API를 활용하여 상황별 실시간 야구 전술 조언 생성
     */
    public String generateTacticalAdvice(AdviceRequestDto dto) {
        String systemInstructions = """
            당신은 한국 프로야구(KBO)의 최고 베테랑 야구 전술 분석 코치입니다.
            제시되는 경기 상황 데이터를 종합하여, 사용자의 기준 구단(myTeam)의 입장에서 팀이 승리할 수 있도록 실시간 전술 조언을 제공해 주세요.
            
            [필수 준수 사항]
            1. 분석 시점은 항상 사용자의 구단인 **myTeam (기준 구단)** 기준이어야 합니다.
               - **myTeam이 공격 중일 때** (타자 소속 팀이 myTeam인 경우): 타자가 상대 투수의 구속/구종과 수비 시프트를 뚫고 출루/득점하기 위한 구체적인 타격 공략법 및 주루 전략을 조언하십시오. (상대 투수를 공략하는 아군 타자 위주 조언)
               - **myTeam이 수비 중일 때** (투수 소속 팀이 myTeam인 경우): 투수와 야수가 상대 타자의 약점을 공략해 아웃카운트를 효과적으로 잡기 위한 투구 위치 전략 및 수비 시프트 운용 지침을 조언하십시오. (상대 타자를 잡는 아군 투수/야수 위주 조언)
            2. 구장(stadium)의 특성(예: 잠실은 광활하므로 수비 시 뜬공 유도 유리/공격 시 빈 공간 공략 기습 타격 등, 인천/대구는 홈런 친화적이므로 수비 시 가라앉는 투구 필수/공격 시 장타 지향 타격 등)을 전술에 명확히 반영하십시오.
            3. 현재 볼카운트(B-S-O), 주자 상황, 선택 구종 및 수비 시프트 형태를 myTeam의 공/수 맥락에 맞춰 입체적으로 해석하십시오.
            4. 정중하고 단호한 베테랑 야구 코치 어조(한국어)를 사용하고, 줄바꿈을 활용해 가독성 있게 3~4문장 내외로 작성하십시오.
            """;

        // 기준 구단의 현재 공수 상태 판별
        boolean isTop = "초".equals(dto.getInningHalf());
        String attackingTeam = isTop ? dto.getOpponentTeam() : dto.getMyTeam();
        boolean isMyTeamOffense = dto.getMyTeam().equals(attackingTeam);
        String myTeamRole = isMyTeamOffense ? "공격 중 (타자/주자 전술 수립 필요)" : "수비 중 (투수/야수 시프트 전술 수립 필요)";

        String userPrompt = String.format("""
            [경기 상황 데이터]
            - 경기 정보: %d회%s
            - 구장: %s
            - 대진: %s (홈/기준팀) vs %s (원정/상대팀)
            - 기준 구단(%s)의 현재 상황: %s
            - 카운트: %d 볼 - %d 스트라이크 - %d 아웃
            - 주자: %s
            - 투수: %s (%s)
            - 타자: %s (%s)
            - 선택 구종: %s
            - 수비 시프트 형태: %s
            
            위 데이터를 분석하여 베테랑 코치로서의 실시간 전략 조언을 한글로 작성해 주세요.
            """,
            dto.getInning(),
            dto.getInningHalf(),
            dto.getStadium(),
            dto.getMyTeam(),
            dto.getOpponentTeam(),
            dto.getMyTeam(),
            myTeamRole,
            dto.getBalls(),
            dto.getStrikes(),
            dto.getOuts(),
            formatRunners(dto),
            dto.getPitcherName(),
            dto.getPitcherTeam(),
            dto.getBatterName(),
            dto.getBatterTeam(),
            dto.getPitchType(),
            dto.getShiftType()
        );

        SystemMessage systemMsg = new SystemMessage(systemInstructions);
        UserMessage userMsg = new UserMessage(userPrompt);

        Prompt prompt = new Prompt(List.of(systemMsg, userMsg));
        
        return chatModel.call(prompt).getResult().getOutput().getText();
    }

    private String formatRunners(AdviceRequestDto dto) {
        List<String> activeBases = new ArrayList<>();
        if (dto.isFirstBase()) activeBases.add("1루");
        if (dto.isSecondBase()) activeBases.add("2루");
        if (dto.isThirdBase()) activeBases.add("3루");
        
        if (activeBases.isEmpty()) {
            return "주자 없음";
        }
        return String.join(", ", activeBases) + " 주자 포진";
    }
}
