# Baseball AI Coach Project Log

Baseball AI Coach 프로젝트의 개발 여정과 기술 스택 마이그레이션, 고도화 및 주요 수정 내역을 정리한 문서 목차입니다.

## 📌 핵심 문서

- [프론트엔드/백엔드 구축 완료 보고서](baseball_documents/walkthrough.md)
- [트러블슈팅 색인](TROUBLESHOOTING.md)

## 📅 날짜별 개발 기록

- [2026-07-24](project-log/2026-07-24.md): 
  - **프론트엔드**: Vite + React 19 기본 구성, Tailwind CSS v4 연동, 대화형 SVG 야구장 및 9개 수비수 마우스 드래그 시프트 기능 구현, 경기 메타(일시, 구단 매칭, 이닝) 설정 추가, 구장별 홈런 유무 영향 반영 AI 룰 조언 고도화 및 목업 정합성 수정. **[고도화]** KBO 10개 구단 야수 주전 라인업 상수 매핑 및 우리 팀(My Team) 변경 시 호버 선수 정보 실시간 툴팁 출력 연계 구현, 이닝별 실시간 공수(공격/수비) 팀 교대 비주얼 인디케이터 장착. **[고도화]** 이닝에 따른 실제 수비팀 라인업 매칭 보정 및 우측 섹션 내 실시간 대수비/투수 교체용 수동 라인업 편집 패널(Lineup Editor) 구축. **[고도화]** 현재 공격팀의 실시간 1~9번 타순 리스트 렌더링 및 대타 교체용 타순 에디터(Batting Order Editor) 탑재, 현재 타석 타자 매칭 시 시각적 AT BAT 강조(Red Pulse) 연계 구현. **[고도화]** 클라이언트 단 로컬 룰엔진을 걷어내고 백엔드 Gemini API 조언 획득 REST API를 500ms 디바운스 비동기 호출 방식으로 전면 연동 리팩토링.
  - **백엔드**: Java 21 + Spring Boot 3.3.2 구성, JPA 데이터 모델링(선수, 경기, 타석, 투구 기록) 구축, 비즈니스 엔진(세션 기록 자동 판단 및 집계 처리) 구현, REST API 개발 및 CORS 대응 완료. **[고도화]** `spring-ai-google-ai-spring-boot-starter` 의존성 주입 및 BOM/BOM 관리 설정 추가, `AdviceRequestDto` 신설하여 상황 데이터 구조화, `AiAdviceService` 구현하여 Spring AI `ChatModel` 기반 Gemini API(gemini-1.5-flash)와 실시간 연동 및 조언 창출 서비스 구축 완료.

## ✍🏻 작성 기준

1. 구현 및 수정 내역은 작업 날짜에 맞춰 `project-log/` 하위 파일에 기록합니다.
2. 장애 오류 분석과 트러블슈팅 이력은 해당 일자 로그에 작성 후 `TROUBLESHOOTING.md`에 링크를 연결합니다.
3. 실행 및 설계 가이드라인이 수정될 시 `baseball_documents/` 하위 문서를 최신으로 유지합니다.
