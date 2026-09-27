# AI Math Playground — Learning Architecture v0.2

## Product loop
수키와 만남 → 월드 선택 → 미니게임 → 별/XP → 보물 → 숙련도 갱신 → 다음 스테이지 추천 → 월드 보스 → 다음 월드.

## Three progression systems
1. Stars: 아이가 모으고 사용하는 재미 보상.
2. XP/Level: 장기 게임 성장. 소비되지 않음.
3. Mastery: 개념별 실제 학습 추정치. 경쟁점수와 분리하며 부모 리포트와 적응형 난이도에 사용.

## Content hierarchy
Grade → World → Concept → Stage → GameMode → Difficulty → Reward.

코드에 학년별 문제를 하드코딩하지 않고 JSON 콘텐츠를 게임 엔진이 읽는 구조로 확장한다.

## Suki AI responsibilities
- 현재 숙련도에 맞는 다음 문제/게임 추천
- 반복 오답 시 시각 표현으로 전환
- 빠른 연속 정답 시 도전 난이도 제안
- 도움이 된 표현 방식 기억
- 답을 바로 말하기보다 힌트 단계를 사용
- 학년이 올라가며 말투와 UI 밀도를 성장시킴

## Age progression
- Grade 1–2: 캐릭터, 놀이, 시각화 중심
- Grade 3–4: 탐험, 수집, 퀘스트 중심
- Grade 5–6: 미션, 전략, 도전 중심

수키는 1학년부터 6학년까지 동일한 AI 친구로 유지한다.

## Grade 1 MVP worlds
숫자마을 → 덧셈숲 → 뺄셈동굴 → 모양공장 → 비교왕국 → 시간마을 → 큰수항구 → 별빛성.

각 월드는 여러 스테이지와 최종미션을 가지며, 숙련도 70 이상 + 보스 클리어를 기본 다음 월드 조건으로 사용한다. 이미 개념을 아는 아이는 진단 성공률에 따라 빠른 통과가 가능하다.

## Engineering next step
현재 app.js에 들어있는 문제 생성과 화면 상태를 GameEngine, ProgressEngine, SukiEngine, ContentLoader로 분리한다. curriculum.json, worlds.json, game-modes.json, mastery.json을 ContentLoader가 읽도록 전환한다.