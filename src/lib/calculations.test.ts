import { describe, expect, it } from 'vitest'
import {
  averageSatisfaction,
  computeRecoveryEvents,
  computeRecoveryStats,
  computeWeeklyReview,
  reflectionToActionRate,
} from './calculations'
import type { ActionItem, ActivityLog, Reflection } from '../types'

function makeReflection(overrides: Partial<Reflection> = {}): Reflection {
  return {
    id: overrides.id ?? Math.random().toString(36),
    title: '제목',
    body: '내용',
    date: '2026-09-01',
    category: '기타',
    tags: [],
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeAction(overrides: Partial<ActionItem> = {}): ActionItem {
  return {
    id: overrides.id ?? Math.random().toString(36),
    title: '행동',
    createdAt: '2026-09-01T00:00:00.000Z',
    done: false,
    ...overrides,
  }
}

describe('reflectionToActionRate', () => {
  it('성찰이 없으면 null을 반환한다', () => {
    expect(reflectionToActionRate([])).toBeNull()
  })

  it('10개 중 6개가 행동으로 연결되면 60%를 반환한다', () => {
    const reflections = [
      ...Array.from({ length: 6 }, () => makeReflection({ actionId: 'a1' })),
      ...Array.from({ length: 4 }, () => makeReflection()),
    ]
    expect(reflectionToActionRate(reflections)).toBe(60)
  })

  it('소수점 첫째 자리까지 반올림한다', () => {
    const reflections = [
      makeReflection({ actionId: 'a1' }),
      makeReflection(),
      makeReflection(),
    ]
    expect(reflectionToActionRate(reflections)).toBe(33.3)
  })
})

describe('averageSatisfaction', () => {
  it('평가된 행동이 없으면 null을 반환한다', () => {
    expect(averageSatisfaction([makeAction({ done: false })])).toBeNull()
  })

  it('완료되고 평가된 행동들의 평균을 계산한다', () => {
    const actions = [
      makeAction({ done: true, satisfaction: 4 }),
      makeAction({ done: true, satisfaction: 5 }),
      makeAction({ done: true, satisfaction: 3 }),
      makeAction({ done: false }), // 미완료는 제외
    ]
    expect(averageSatisfaction(actions)).toBe(4)
  })
})

describe('computeRecoveryEvents', () => {
  it('연속된 날짜는 복귀 이벤트가 아니다', () => {
    const events = computeRecoveryEvents(['2026-09-01', '2026-09-02', '2026-09-03'])
    expect(events).toEqual([])
  })

  it('5일을 쉬고 돌아오면 gapDays가 5다', () => {
    // 9/1 활동, 9/2~9/6 쉼(5일), 9/7 복귀
    const events = computeRecoveryEvents(['2026-09-01', '2026-09-07'])
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ date: '2026-09-07', gapDays: 5 })
  })

  it('이전 복귀보다 빨라졌는지 알 수 있도록 previousGapDays를 포함한다', () => {
    // 첫 복귀: 7일 공백, 두 번째 복귀: 5일 공백
    const events = computeRecoveryEvents([
      '2026-09-01',
      '2026-09-09', // gap 7
      '2026-09-15', // gap 5
    ])
    expect(events).toHaveLength(2)
    expect(events[0].gapDays).toBe(7)
    expect(events[1].gapDays).toBe(5)
    expect(events[1].previousGapDays).toBe(7)
  })

  it('중복된 날짜는 하나로 취급한다', () => {
    const events = computeRecoveryEvents(['2026-09-01', '2026-09-01', '2026-09-02'])
    expect(events).toEqual([])
  })
})

describe('computeRecoveryStats', () => {
  it('복귀 이벤트가 없으면 null 통계를 반환한다', () => {
    const stats = computeRecoveryStats(['2026-09-01', '2026-09-02'])
    expect(stats.latest).toBeNull()
    expect(stats.averageGapDays).toBeNull()
  })

  it('여러 복귀 이벤트의 평균을 계산한다', () => {
    const stats = computeRecoveryStats(['2026-09-01', '2026-09-09', '2026-09-15'])
    // gaps: 7, 5 -> 평균 6
    expect(stats.averageGapDays).toBe(6)
    expect(stats.latest?.gapDays).toBe(5)
  })
})

describe('computeWeeklyReview', () => {
  const makeLog = (type: ActivityLog['type'], date: string): ActivityLog => ({
    id: `${type}-${date}`,
    type,
    date,
    createdAt: `${date}T00:00:00.000Z`,
  })

  it('최근 7일 동안의 활동 일수와 전환율을 계산한다', () => {
    const endDate = '2026-09-10'
    const activityLogs: ActivityLog[] = [
      makeLog('reading', '2026-09-04'),
      makeLog('reading', '2026-09-05'),
      makeLog('reflection', '2026-09-05'),
      makeLog('action', '2026-09-06'),
    ]
    const reflections = [
      makeReflection({ date: '2026-09-05', actionId: 'a1' }),
      makeReflection({ date: '2026-09-06' }),
    ]
    const actions = [
      makeAction({ done: true, satisfaction: 5, completedAt: '2026-09-06T10:00:00.000Z' }),
    ]

    const review = computeWeeklyReview({ activityLogs, reflections, actions, endDate })

    expect(review.rangeStart).toBe('2026-09-04')
    expect(review.rangeEnd).toBe('2026-09-10')
    expect(review.readingDays).toBe(2)
    expect(review.reflectionDays).toBe(1)
    expect(review.actionDays).toBe(1)
    expect(review.reflectionCount).toBe(2)
    expect(review.reflectionToActionCount).toBe(1)
    expect(review.reflectionToActionRate).toBe(50)
    expect(review.averageSatisfaction).toBe(5)
  })
})
