# 행촉남 Compass

> 성찰을 행동으로, 행동을 행복으로.

읽고(READ), 생각하고(THINK), 쓰고(WRITE), 행동하고(ACT), 다시 돌아보는(REFLECT) 과정을 하나로 연결하는 개인용 Life OS입니다. 습관의 연속 기록(streak)보다 **중단 후 얼마나 빨리 돌아왔는지(복귀력)**를 더 중요한 지표로 다룹니다.

## 설치 및 실행

```bash
npm install
npm run dev       # 개발 서버 (http://localhost:5173)
npm run build      # 프로덕션 빌드 (dist/)
npm run preview    # 빌드 결과 미리보기
npm run test       # vitest 실행 (watch)
npx vitest run     # vitest 1회 실행
npm run lint        # oxlint
npx tsc -b          # 타입 체크
```

Node.js 18 이상을 권장합니다.

## 프로젝트 구조

```
src/
  types/            데이터 모델(인터페이스) 정의
  db/db.ts          Dexie(IndexedDB) 스키마
  data/
    services.ts     CRUD 서비스 레이어 (UI는 이 함수만 호출)
    hooks.ts        dexie-react-hooks 기반 useLiveQuery 래퍼
    seed.ts         첫 실행 시 샘플 데이터
    exportImport.ts JSON 백업 내보내기/가져오기
  lib/
    calculations.ts 전환율/복귀력/주간 통계 등 핵심 계산 (순수 함수)
    calculations.test.ts  위 로직에 대한 vitest 테스트
    date.ts, id.ts   날짜/ID 유틸
  nav/NavContext.tsx  화면 전환 상태(간단한 상태 기반 라우팅)
  components/
    layout/         AppShell(사이드바/모바일 하단 탭)
    today/          오늘 화면
    reading/        서재(책 목록/상세), 독서 기록
    reflection/      성찰 목록/작성, "가장 작은 행동" 연결
    action/          행동 목록/작성, 완료 시 만족도 선택
    writing/         글쓰기 스튜디오(에디터 + 글감 연결)
    principle/       나의 원칙
    review/          주간 회고 대시보드
    settings/        내보내기/가져오기/초기화
    common/          공용 UI(Button, Card, Modal, FormField 등)
```

## 주요 기능

- **오늘 화면**: "오늘 무엇을 읽고, 무엇을 생각하고, 무엇을 행동하시겠습니까?" — 독서/생각/글쓰기/행동을 카드 하나씩, 5분 안에 기록할 수 있도록 구성했습니다.
- **독서 기록**: 책(읽는 중/완독/보류)에 여러 개의 독서 기록을 연결합니다. 인상 깊은 문장을 적으면 "이 문장은 왜 마음에 남았습니까?", "이 생각을 당신의 삶으로 가져온다면 어떤 질문이 됩니까?"를 이어서 물어봅니다.
- **성찰**: 독서 외에도 가족/일/투자/운동/관계/기타 등 삶의 모든 영역에서 떠오른 생각을 기록합니다. 각 성찰 하단에는 항상 "이 생각에서 오늘 할 수 있는 가장 작은 행동은 무엇입니까?"를 묻고, 답을 입력하면 Action이 생성되어 성찰과 연결됩니다.
- **행동**: 아주 작은 실천(책 1쪽 읽기, 10분 걷기 등)도 기록합니다. 완료 시 1~5점 만족도를 남길 수 있습니다.
- **글쓰기 스튜디오**: 독서 기록과 성찰을 글감으로 선택해 하나의 글로 엮습니다. 질문 · 경험/장면 · 나의 생각 · 반대 관점 · 메시지 · 오늘의 행동 제안 · 완성된 글 순으로 작성하며, 상태(아이디어/초안/완성)를 관리합니다.
- **나의 원칙**: 살아가며 중요하다고 느낀 문장을 원칙으로 남기고, 그 배경이 된 독서 기록/성찰/글을 연결합니다.
- **주간 회고**: 최근 7일의 활동을 요약합니다. 가장 먼저 보여주는 숫자는 streak이 아니라 **성찰→행동 전환율**과 **복귀력**입니다.
- **데이터 내보내기/가져오기**: 모든 데이터를 JSON으로 내려받거나, 백업 파일로 복원할 수 있습니다.
- **PWA**: 모바일 홈 화면에 설치할 수 있습니다(오프라인 캐싱 포함).
- **투자 의사결정 저널**: 데이터 타입(`InvestmentDecision`)과 서비스 함수는 준비되어 있으나, 철학에 맞게 초기 화면에는 노출하지 않았습니다. 향후 화면만 추가하면 바로 사용할 수 있습니다.

## 데이터 모델 (`src/types/index.ts`)

`Book`, `ReadingEntry`, `Reflection`, `ActionItem`, `Writing`, `Principle`, `ActivityLog`, `InvestmentDecision` 등으로 구성되어 있으며, 핵심 연결 관계는 다음과 같습니다.

- `ReadingEntry.bookId` → `Book` (한 책에 여러 독서 기록)
- `Reflection.sourceReadingEntryId` → 독서 기록에서 이어진 성찰
- `Reflection.actionId` ↔ `ActionItem.reflectionId` → 성찰과 행동의 양방향 연결
- `Writing.linkedReflectionIds` / `linkedReadingEntryIds` → 글쓰기 재료
- `Principle.linkedReadingEntryIds` / `linkedReflectionIds` / `linkedWritingIds` → 원칙의 근거
- `ActivityLog` → 날짜별 활동 기록(복귀력·주간 통계 계산의 원천 데이터)

## 데이터 저장 방식

MVP 단계에서는 서버 없이 브라우저의 **IndexedDB**(Dexie.js, `src/db/db.ts`)에 모든 데이터를 저장합니다. UI는 `src/data/services.ts`의 함수만 호출하도록 계층을 분리했기 때문에, 이후 Supabase 등 외부 백엔드로 옮길 때는 **이 서비스 레이어의 구현만 교체**하면 됩니다(함수 시그니처와 반환 타입은 그대로 유지하고, 내부에서 Dexie 호출 대신 Supabase 클라이언트 호출로 바꾸는 방식). `src/data/hooks.ts`의 `useLiveQuery` 기반 훅들도 Supabase의 realtime 구독으로 자연스럽게 대체할 수 있는 구조입니다.

## 복귀력(회복탄력) 계산 방식

`src/lib/calculations.ts`의 `computeRecoveryEvents` / `computeRecoveryStats`가 담당합니다.

1. `ActivityLog`에서 활동이 있었던 날짜(중복 제거)를 오름차순으로 정렬합니다.
2. 연속된 두 활동일 사이의 간격이 **2일 이상**이면(즉, 하루 이상 쉰 날이 있으면) 그 지점을 "복귀 이벤트"로 기록합니다. `gapDays`는 쉬었던 일수입니다. 예: 9/1에 활동하고 9/7에 다시 활동했다면 `gapDays = 5` → "5일 만에 돌아왔습니다."
3. 직전 복귀 이벤트의 `gapDays`와 비교해 "지난번보다 N일 빨리 복귀했어요" 같은 긍정적인 메시지를 만듭니다(`recoveryMessage`).
4. 연속으로 기록한 날(간격 0~1일)은 복귀 이벤트로 세지 않습니다 — 실패나 경고 문구를 띄우지 않고, 복귀했을 때만 긍정적으로 보여준다는 철학을 지키기 위함입니다.
5. 주간 회고에서는 전체 복귀 이벤트의 평균 `gapDays`를 "평균 복귀 소요일"로 보여줍니다.

## 성찰→행동 전환율 계산 방식

`reflectionToActionRate(reflections)`가 담당합니다.

```
전환율(%) = (actionId가 연결된 성찰 수 / 전체 성찰 수) × 100
```

주간 회고에서는 최근 7일 동안 작성된 성찰만 대상으로 계산합니다. 성찰이 하나도 없으면 `null`을 반환해 "0%"로 오해하지 않도록 구분합니다.

## 테스트

`src/lib/calculations.test.ts`에서 다음 항목을 검증합니다.

- 성찰→행동 전환율 계산 (0개/일부/반올림 케이스)
- 평균 행동 만족도 계산 (미완료·미평가 항목 제외)
- 복귀 이벤트 계산 (연속 기록은 이벤트가 아님, gapDays 계산, 이전 대비 개선 여부, 중복 날짜 처리)
- 복귀 통계(평균 복귀 일수) 계산
- 주간 회고 통계(활동일 수, 전환율, 평균 만족도) 계산

## 향후 Supabase 연동 가이드

1. `src/db/db.ts`를 대체할 Supabase 클라이언트 초기화 파일을 추가합니다.
2. `src/data/services.ts`의 각 함수 내부 구현을 Supabase 쿼리로 교체합니다(함수 시그니처는 그대로 유지).
3. `src/data/hooks.ts`의 `useLiveQuery`를 Supabase realtime 구독 + `useState`/`useEffect` 조합으로 교체합니다.
4. 로그인/사용자 식별이 필요하다면 각 테이블에 `user_id` 컬럼을 추가하고, RLS(Row Level Security)로 본인 데이터만 접근하도록 설정합니다.
5. 기존 IndexedDB 사용자를 위해 `exportAllData()` → Supabase에 일괄 삽입하는 마이그레이션 스크립트를 추가하면 데이터 이전도 매끄럽게 처리할 수 있습니다.

## 향후 AI 연동 가이드

AI 기능은 API Key 없이도 앱 전체가 완전히 동작하도록 설계했습니다. 이후 AI를 붙일 때는 `src/data/services.ts`와 별개로 `src/ai/` 같은 서비스 레이어를 새로 만들어, 최근 성찰/독서 기록을 입력으로 받아 "반복되는 질문", "중요하게 여기는 가치", "행동으로 이어지지 않는 생각" 등을 분석하는 함수를 추가하는 방식을 권장합니다. UI 쪽에서는 이 서비스가 없을 때(=API Key 미설정) 관련 카드를 조용히 숨기도록 구성하면 됩니다.
