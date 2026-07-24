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
     * Gemini 1.5 Flash API를 활용하여 상황별 실시간 야구 전술 조언 생성
     */
    public String generateTacticalAdvice(AdviceRequestDto dto) {
        String systemInstructions = """
            당신은 한국 프로야구(KBO)의 최고 베테랑 야구 전술 분석 코치입니다.
            제시되는 경기 상황 데이터를 종합하여, 투수의 구종 선택과 내/외야 수비 시프트 방향을 지시하는 구체적인 실시간 전술 조언을 제공해 주세요.
            
            [필수 준수 사항]
            1. 구장(stadium)의 특성(예: 잠실은 광활하여 뜬공 유도 유리, 인천/대구는 홈런 친화적이므로 땅볼 유도 필수 등)을 전략에 직접적으로 반영하여 설명하십시오.
            2. 현재 볼카운트(B-S-O), 주자 상황, 그리고 적용된 수비 시프트 형태를 전술적으로 해석하십시오.
            3. 투수(소속팀)와 타자(소속팀)의 구체적인 맞대결 맥락과, 어떤 구종을 던져야 스윙을 유인하거나 맞춰잡을 수 있을지 실질적 코칭 조언을 제공하십시오.
            4. 정중하고 단호한 베테랑 야구 코치 어조(한국어)를 사용하고, 줄바꿈을 활용해 가독성 있게 3~4문장 내외로 작성하십시오.
            """;

        String userPrompt = String.format("""
            [경기 상황 데이터]
            - 경기 정보: %d회%s
            - 구장: %s
            - 대진: %s (홈/기준팀) vs %s (원정/상대팀)
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
        
        return chatModel.call(prompt).getResult().getOutput().getContent();
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
