# Baseball AI Coach 트러블슈팅

프로젝트 개발 과정에서 발생한 주요 문제와 해결 기록에 접근하기 위한 색인입니다.

## 1. PowerShell 환경에서의 `&&` 연산자 에러

- **발생일**: 2026-07-24
- **요약**: Windows PowerShell 환경에서 npm 패키지 설치 시 `&&` 연산자를 활용한 명령어 체이닝이 파싱 에러를 유발해 빌드가 중단된 오류 조치
- **원인**:
  일부 Windows PowerShell 버전 환경에서는 리눅스나 CMD에서 주로 사용되는 `&&` 연산자를 명령 체이너로 해석하지 못해 `InvalidEndOfLine` 및 `TokenError` 에러가 발생함.
- **해결**:
  `npm install -D tailwindcss @tailwindcss/vite` 명령어를 먼저 성공적으로 수행한 후, 이어서 `npm install lucide-react recharts` 명령어를 개별적으로 독립 실행하도록 순서를 파싱하여 해결함.
- **상세 기록**: [2026-07-24 개발 로그](project-log/2026-07-24.md)

## 2. npm 의존성 설치 시간 지연에 따른 백그라운드 태스크 전환

- **발생일**: 2026-07-24
- **요약**: `recharts` 및 `lucide-react` 패키지 설치 시 Windows 로컬 디스크 및 패키지 번들 분석 시간 지연으로 인한 동기 실행 시간 초과 처리
- **원인**:
  Vite 템플릿 환경 구성 이후 차트 시각화 및 아이콘 팩 등의 의존성 주입 시, API 툴의 기본 동기 시간 제한(`WaitMsBeforeAsync: 10000ms`)을 크게 초과하여 설치(3분 이상 소요)되면서 비동기 태스크로 자동 이전됨.
- **해결**:
  설치 프로세스를 강제 종료하지 않고 백그라운드 태스크(`task-33`)로 안전하게 놔둔 뒤, `manage_task` 'status' 및 HIGH_PRIORITY 완료 트리거 알림 메시지를 대기해 의존성이 온전히 빌드 완료된 것을 검증한 후 다음 소스 코드 개발 단계로 진행함.
- **상세 기록**: [2026-07-24 개발 로그](project-log/2026-07-24.md)

## 3. `getUpdatedDefenders is not defined` React 컴파일 참조 에러

- **발생일**: 2026-07-24
- **요약**: 실시간 수비진 라인업 연동 고도화 과정 중, 이전 함수 헬퍼(`getUpdatedDefenders`) 호출이 렌더링 영역에 잔존하여 React 컴파일이 중단되고 화면이 다운된 오류 조치
- **원인**:
  투수/타자 팀 변경 시 라인업 동적 바인딩을 리팩토링하면서 `useEffect` 동기화 구조로 이전함에 따라 기존의 임시 헬퍼 함수(`getUpdatedDefenders`)가 스코프에서 제거되었으나, `BaseballField` 및 `Dashboard` 컴포넌트 호출 프롭스단(`defenders={getUpdatedDefenders()}`)에 여전히 잔존하여 런타임 참조 에러 발생.
- **해결**:
  수비진 정보를 헬퍼 함수를 매번 실행하는 구조 대신, 상태 전파 성능과 정합성을 보장하는 **리액트 상태(`defenders` state) 직접 바인딩 구조**(`defenders={defenders}`)로 프롭스 코드를 교체 조정하여 렌더러 복원 완료.
- **상세 기록**: [2026-07-24 개발 로그](project-log/2026-07-24.md)

## 4. Spring AI Google GenAI(Gemini) 의존성 누락 및 application.yml 프리픽스 동기화 에러

- **발생일**: 2026-07-24
- **요약**: Spring Boot 백엔드에 Gemini API 연동을 위해 `spring-ai-google-ai-spring-boot-starter`를 주입했으나, Gradle 컴파일 단계에서 의존성 버전을 찾지 못해 빌드가 실패하고 `application.yml` 프로퍼티 연동이 불일치했던 오류 조치
- **원인**:
  1. **라이브러리 공식 명칭 변경**: Spring AI가 빠르게 발전하면서 구버전인 `spring-ai-google-ai-spring-boot-starter` 아티팩트가 Milestone(1.0.0-M1) BOM에서 정상적으로 해석되지 않았음.
  2. **프로퍼티 프리픽스 변경**: 이에 따라 application.yml 설정 키도 `spring.ai.google`에서 `spring.ai.google.genai`로 구조 변경이 일어났으나 구식 프리픽스를 참조하여 바인딩에 실패함.
- **해결**:
  1. `build.gradle` 의존성을 공식 최신 명칭인 **`spring-ai-starter-model-google-genai`**로 변경하여 Milestone 저장소와 올바르게 매핑되도록 처리함.
  2. `application.yml` 설정을 `spring.ai.google.genai` 프리픽스로 업데이트하여 API 키와 Gemini 3.5 Flash-Lite 모델 바인딩을 매끄럽게 동기화함.
- **상세 기록**: [2026-07-24 개발 로그](project-log/2026-07-24.md)

## 💡 참고 사항

- 로컬 실행 환경 및 기본 구조 분석은 [프론트엔드 구축 완료 보고서](baseball_documents/walkthrough.md)를 참고하세요.
- 새로운 트러블슈팅 이력은 날짜별 로그에 기록을 작성한 뒤, 이 색인 문서에 추가합니다.
