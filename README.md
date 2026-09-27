# Suki Math App (working title)

초등학교 1~6학년 대상 AI 수학놀이 앱 프로젝트.

## Product idea
**공부하라고 하지 않아도, 같이 놀다 보면 수학을 하고 있다.**

수학 공부를 싫어하는 아이가 AI 친구(가칭 `수키`)와 함께 문제를 내고, 풀고, 가르치고, 협동하면서 자연스럽게 수학적 사고를 반복하도록 설계한다.

## MVP v0.1
- 대상: 초등 1학년
- 개념: 10 이하 덧셈
- 플레이: 5~10분
- 플랫폼: 모바일 우선 웹/PWA
- AI 친구: 수키(가칭)
- 게임 모드 4종
  1. 수키가 문제내기
  2. 아이가 수키에게 문제내기
  3. 수키와 함께 풀기
  4. 수키의 실수 찾아주기
- 보상: 별, XP, 레벨, 보물상자
- 향후: 주간 리그/친구·가족 리그

## Core loop
`수키와 놀이 → 문제 해결 → 별 획득 → XP → 레벨업 → 새 미션 해금 → 다시 놀이`

## Important principles
- 아이 화면에서 점수/시험 느낌 최소화
- 오답 = 실패가 아니라 새로운 탐색
- 정답/문제 조건은 검증된 수학 엔진이 담당
- AI는 대화, 힌트, 난이도, 놀이 방식 조절 담당
- 수키 자유대화보다 수학놀이 중심 대화
- 아동 개인정보 최소 수집

## Documents
- `docs/PRODUCT_SPEC.md` — 제품/게임 상세 명세
- `docs/MVP_FLOW.md` — MVP 플레이 흐름
- `docs/ROADMAP.md` — 개발 로드맵
- `src/data/suki-states.json` — 수키 상태 12종
- `src/data/reward-system.json` — 별/XP/레벨 기본 규칙
- `src/data/mvp-addition.json` — 덧셈 MVP 샘플 데이터

## Status
Planning / Prototype
