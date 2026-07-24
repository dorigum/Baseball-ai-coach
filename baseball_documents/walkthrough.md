# Baseball AI Coach - 구축 완료 보고서 (프론트엔드 & 백엔드)

이전 세션의 구현 계획서 1단계 및 2단계에 따라, **Vite + React 19 + Tailwind CSS v4** 프론트엔드와 **Spring Boot 3.3.2 + Java 21 + Spring Data JPA** 백엔드 API 서버를 성공적으로 구축하였습니다.

특히, 구장 장소와 경기 맥락(일시, 상대팀, 이닝)에 따라 홈런 억제 등의 경기력 분석에 영향을 미치는 중요 특성들을 기록 및 AI 조언에 결합하고, 실시간 라인업 매칭 및 시각적 공격/수비 뱃지를 제공하며, 경기 중 대수비/대타/투수 교체 상황에 대비한 수동 라인업 & 타순 실시간 조작 인터페이스를 제공하는 고도화 기능도 함께 포함되었습니다.

---

## 💻 1단계: 프론트엔드 UI/UX

[frontend](file:///c:/PolarBear_Projects/baseball-ai-coach/frontend) 폴더에 위치해 있으며 주요 구성 요소는 다음과 같습니다:

1. **[BaseballField.jsx](file:///c:/PolarBear_Projects/baseball-ai-coach/frontend/src/components/BaseballField.jsx)**
   - **Interactive SVG Field**: 9명의 수비수 포지션을 자유롭게 드래그하여 시프트를 구상합니다.
   - **Click to Tag**: 필드를 클릭하면 타구 낙하 지점에 볼 마커와 펄스 애니메이션이 활성화되어 좌표를 수집합니다.
   - **Runners Base Clickable**: 베이스(1, 2, 3루) 클릭으로 주자 배치를 토글합니다.
   - **수비수 호버 툴팁**: 9개의 수비수 배지에 마우스를 올리면 해당 포지션의 선수 정보(예: `김도영 (KIA)`)가 플로팅 툴팁으로 즉각 나타납니다.
   - **전광판 공수 뱃지**: 현재 이닝 진행 상태에 맞추어 공격 구단(Red 🔥) 및 수비 구단(Emerald 🛡️) 정보를 실시간 계산해 표기합니다.

2. **[PlayInputPanel.jsx](file:///c:/PolarBear_Projects/baseball-ai-coach/frontend/src/components/PlayInputPanel.jsx)**
   - **경기 메타 정보 설정**: 날짜, 구장(국내 9개 대표 야구장 팁 제공), 우리팀 vs 상대팀, 진행 이닝(1~12회 초/말)을 입력합니다.
   - **공수 교대 인디케이터**: 이닝 설정 하단에 실시간 공격팀과 수비팀 정보를 표기해 입력 시의 정합성을 돕습니다.
   - **선수 팀정보 매칭**: 투수와 타자명 옆에 소속 구단(Team) 기입란을 신설하여 정합성을 정비했습니다.
   - **SBO Scoreboard & Chips**: 전광판식 볼카운트 및 구종 칩(Fastball 등), 구속 조절 슬라이더, 결과 선택 폼이 연동됩니다.

3. **[Dashboard.jsx](file:///c:/PolarBear_Projects/baseball-ai-coach/frontend/src/components/Dashboard.jsx)**
   - **실시간 공격 타순 설정 패널 (Batting Order)**:
     - 우측 대시보드 영역 상단에 **1번부터 9번까지의 공격 타순 명단 카드**를 배치했습니다.
     - 사용자가 경기 도중 대타가 투입되거나 타순 정보가 바뀔 경우, 각 번호별 타자 이름을 클릭하여 실시간 수동 교체(Inline Editor)할 수 있습니다.
     - **현재 타석 강조 연동**: 현재 타석에 들어선 타자(`currentBatterName`)와 일치하는 타순의 경우, 붉은색 활성 테두리(Red Pulse)와 `AT BAT` 배지가 시각적으로 표시되어 경기 몰입도를 극대화합니다.
   - **실시간 수비 라인업 설정 패널 (Active Lineup)**:
     - 9명의 수비 포지션별 실시간 야수 명단을 관리하는 카드입니다.
     - 각 포지션별 선수명을 클릭하면 인풋 폼으로 즉각 전환되어, 경기 도중 발생하는 **대수비 투입, 투수 교체 상황** 시 사용자가 실시간으로 선수명을 수동 편집/교체할 수 있습니다.
     - 투수(P)명을 에디터에서 수정 시, 피칭 기록 입력 패널의 투수명 정보도 자동으로 양방향 동기화 처리됩니다.
   - **Recharts Charts**: 구종 비율(PieChart), 스프레이 분포도(ScatterChart), 인플레이 아웃풋(BarChart) 및 최근 로그 테이블을 시각화합니다.
   - **AI Coach Advice Box**: 주자 상황, 카운트, 시프트 정보 및 **구장별 특징(잠실: 플라이 아웃 유도, 인천/대구: 피홈런 경계 저공 피칭 등)**에 부합하는 실시간 AI 전략 룰 피드백을 출력합니다.

4. **[App.jsx](file:///c:/PolarBear_Projects/baseball-ai-coach/frontend/src/App.jsx)**
   - 전체 컴포넌트의 단방향 데이터 흐름 조율 및 상태 관리.
   - **KBO 주요 구단 주전 라인업 및 타순 연계**: KBO 10개 구단 야수 명단 및 1~9번 스타팅 라인업 데이터를 기본 장착하여 `My Team` 및 `Opponent` 변경 시 툴팁 호버 정보와 투수/타자 정보가 유기적으로 자동 셋업 및 갱신되도록 개선했습니다.
   - **수비팀 선수 데이터 연계 정합성**: 야구장 SVG 필드에 표시되는 수비수 9명은 **현재 수비 중인 구단(defendingTeam)**의 선수여야 하므로, 이닝 초/말에 따른 실제 수비 구단의 라인업 데이터를 실시간 감지 매칭하여 야구장 호버 데이터와 동기화시켰습니다.
   - 투구 기록 추가 시, **스트라이크/볼/아웃 카운트의 자동 계산 누적 연산** 및 안타 종류에 따른 **주자 진루 시뮬레이터**가 탑재되어 유기적으로 동작합니다.

---

## ☕ 2단계: 백엔드 API 서버

[backend](file:///c:/PolarBear_Projects/baseball-ai-coach/backend) 폴더에 위치해 있으며 주요 구성 요소는 다음과 같습니다:

### 1. 기술 스택 및 데이터베이스 셋업
- **Java 21 / Spring Boot 3.3.2 / Gradle** 기반 구축.
- **H2 In-Memory DB & MySQL 듀얼 설정**: 로컬 기동 시 DB 설치 없이 즉시 실행 및 테스트할 수 있도록 H2 인메모리 설정을 기본으로 하였으며, 실제 배포/운영 시 프로필 전환(`-Dspring.profiles.active=mysql`)을 통해 MySQL을 연동할 수 있도록 `application.yml`을 구성했습니다.

### 2. JPA 데이터 모델 (com.baseball.ai.coach.domain)
야구 도메인의 강한 N:1 연관관계를 JPA 매핑을 통해 무결하게 표현했습니다:
- **Player (선수)**: 이름, 소속 팀, 포지션, 배번, 투타 방향성 관리.
- **Game (경기)**: 일자, 구장, 우리팀/상대팀 정보 및 스코어 관리.
- **PlateAppearance (타석)**: 경기(Game), 투수(Player), 타자(Player)와 N:1 매핑 및 이닝, 초/말, 최종 결과 기록.
- **PitchRecord (투구)**: 타석(PlateAppearance)과 N:1 매핑 및 투구 시퀀스, 구종, 구속, 카운트, 투구 결과 및 타구 좌표(X, Y) 보관.

### 3. 비즈니스 로직 및 API 명세 (com.baseball.ai.coach.service/controller)
- **[CoachService.java](file:///c:/PolarBear_Projects/baseball-ai-coach/backend/src/main/java/com/baseball/ai/coach/service/CoachService.java)**:
  - 투구 기록 추가 요청 시 Game 및 Player가 없으면 신규 자동 가입/생성.
  - 해당 타석 내 미종결 타석을 식별하고 투구 시퀀스를 매핑.
  - 스트라이크 3, 볼 4, 인플레이 타구 결과 발생 시 타석 최종 결과(finalResult)를 갱신 및 종결하는 자동 판단 알고리즘 탑재.
- **[CoachController.java](file:///c:/PolarBear_Projects/baseball-ai-coach/backend/src/main/java/com/baseball/ai/coach/controller/CoachController.java)**:
  - `POST /api/coach/pitch`: 프론트에서 넘어오는 투구 로그 데이터 저장.
  - `GET /api/coach/dashboard`: 시각화 및 최근 15건 세션 로그 리스트 반환.
  - `@CrossOrigin(origins = "*")` 설정을 통해 로컬 크로스 도메인(CORS) 차단 방지.

---

## 🏃 로컬 실행 및 확인 방법

### 1. 프론트엔드 가동 (Port: 5173)
```bash
cd frontend
npm run dev
```

### 2. 백엔드 가동 (Port: 8080)
IntelliJ, Eclipse 등 IDE에서 `backend` 폴더를 Gradle 프로젝트로 Import하여 `CoachApplication.java`를 실행하거나, 로컬 빌드 도구를 이용해 구동하십시오.
기본 실행 시 In-Memory H2 DB를 사용하며, [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:baseballdb`, ID: `sa`)로 데이터 테이블 상태를 웹 브라우저에서 편리하게 점검할 수 있습니다.
