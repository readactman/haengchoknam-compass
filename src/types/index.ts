// 행촉남 Compass — 핵심 데이터 모델
// READ -> THINK -> WRITE -> ACT -> REFLECT 흐름을 연결하는 타입 정의

export type ISODate = string // yyyy-MM-dd
export type ISODateTime = string // ISO 8601

export type BookStatus = '읽는 중' | '완독' | '보류'

export interface Book {
  id: string
  title: string
  author: string
  status: BookStatus
  totalPages?: number
  startDate: ISODate
  finishDate?: ISODate
  coverColor: string
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export interface ReadingEntry {
  id: string
  bookId: string
  date: ISODate
  pageFrom?: number
  pageTo?: number
  quote?: string // 인상 깊은 문장
  quoteReason?: string // 이 문장은 왜 마음에 남았습니까?
  personalQuestion?: string // 이 생각을 당신의 삶으로 가져온다면 어떤 질문이 됩니까?
  thought?: string // 떠오른 생각
  createdAt: ISODateTime
}

export type ReflectionCategory =
  | '독서'
  | '글쓰기'
  | '가족'
  | '일'
  | '투자'
  | '운동'
  | '관계'
  | '기타'

export const REFLECTION_CATEGORIES: ReflectionCategory[] = [
  '독서',
  '글쓰기',
  '가족',
  '일',
  '투자',
  '운동',
  '관계',
  '기타',
]

export interface Reflection {
  id: string
  title: string
  body: string
  date: ISODate
  category: ReflectionCategory
  tags: string[]
  sourceReadingEntryId?: string
  actionId?: string // 이 성찰에서 이어진 행동
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export type ActivityType = 'reading' | 'reflection' | 'writing' | 'action' | 'exercise'

export interface ActionItem {
  id: string
  title: string
  createdAt: ISODateTime
  done: boolean
  completedAt?: ISODateTime
  reflectionId?: string
  satisfaction?: 1 | 2 | 3 | 4 | 5
  activityType?: ActivityType
}

export type WritingStatus = '아이디어' | '초안' | '완성'

export interface Writing {
  id: string
  title: string
  status: WritingStatus
  question?: string // 독자에게 던질 질문
  sceneOrExperience?: string // 경험 또는 책 속 장면
  myThought?: string // 나의 생각
  counterpoint?: string // 반대 관점 또는 논리적으로 점검할 부분
  message?: string // 독자가 가져갈 메시지
  actionSuggestion?: string // 오늘의 행동 제안
  finalText?: string // 완성된 글
  linkedReflectionIds: string[]
  linkedReadingEntryIds: string[]
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export interface Principle {
  id: string
  text: string
  description?: string
  linkedReadingEntryIds: string[]
  linkedReflectionIds: string[]
  linkedWritingIds: string[]
  createdAt: ISODateTime
}

export interface ActivityLog {
  id: string
  type: ActivityType
  date: ISODate
  refId?: string
  createdAt: ISODateTime
}

export interface InvestmentDecision {
  id: string
  ticker: string
  reason: string // 투자 이유
  expectedHoldingPeriod: string // 예상 보유기간
  addConditions?: string // 추가매수 조건
  sellConditions?: string // 매도 조건
  emotionAtDecision?: string // 투자 당시 감정
  retrospective?: string // 이후 회고
  date: ISODate
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export interface RecoveryEvent {
  date: ISODate
  gapDays: number // 활동이 없었던 일수
  previousGapDays?: number
}

export interface RecoveryStats {
  latest: RecoveryEvent | null
  averageGapDays: number | null
  events: RecoveryEvent[]
}

export interface WeeklyReviewData {
  rangeStart: ISODate
  rangeEnd: ISODate
  readingDays: number
  reflectionDays: number
  writingDays: number
  actionDays: number
  reflectionCount: number
  reflectionToActionCount: number
  reflectionToActionRate: number // 0-100
  averageSatisfaction: number | null
  recovery: RecoveryStats
}
