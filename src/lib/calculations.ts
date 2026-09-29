// 핵심 지표 계산 로직 — 순수 함수로 작성하여 테스트 가능하게 유지합니다.
import type {
  ActionItem,
  ActivityLog,
  ActivityType,
  ISODate,
  Reflection,
  RecoveryEvent,
  RecoveryStats,
  WeeklyReviewData,
} from '../types'
import { daysBetween, lastNDays } from './date'

/** 성찰 -> 행동 전환율 (0~100). 성찰이 없으면 null. */
export function reflectionToActionRate(reflections: Reflection[]): number | null {
  if (reflections.length === 0) return null
  const linked = reflections.filter((r) => Boolean(r.actionId)).length
  return Math.round((linked / reflections.length) * 1000) / 10
}

/** 완료된 행동들의 평균 만족도 (1~5). 기록이 없으면 null. */
export function averageSatisfaction(actions: ActionItem[]): number | null {
  const rated = actions.filter((a) => a.done && typeof a.satisfaction === 'number')
  if (rated.length === 0) return null
  const sum = rated.reduce((acc, a) => acc + (a.satisfaction ?? 0), 0)
  return Math.round((sum / rated.length) * 10) / 10
}

/**
 * 활동이 있었던 날짜 목록(중복 제거, 오름차순)을 받아 "복귀 이벤트" 목록을 계산합니다.
 * 복귀 이벤트 = 하루 이상 활동이 없다가 다시 활동한 날.
 * gapDays = 활동을 쉰 일수 (예: 5일 쉬고 돌아왔다면 gapDays = 5)
 */
export function computeRecoveryEvents(activeDatesInput: ISODate[]): RecoveryEvent[] {
  const activeDates = Array.from(new Set(activeDatesInput)).sort()
  const events: RecoveryEvent[] = []
  let previousGapDays: number | undefined

  for (let i = 1; i < activeDates.length; i += 1) {
    const diff = daysBetween(activeDates[i], activeDates[i - 1])
    if (diff >= 2) {
      const gapDays = diff - 1
      events.push({ date: activeDates[i], gapDays, previousGapDays })
      previousGapDays = gapDays
    }
  }
  return events
}

/** 복귀 이벤트 목록으로부터 최신 복귀와 평균 복귀 일수를 계산합니다. */
export function computeRecoveryStats(activeDatesInput: ISODate[]): RecoveryStats {
  const events = computeRecoveryEvents(activeDatesInput)
  if (events.length === 0) {
    return { latest: null, averageGapDays: null, events }
  }
  const averageGapDays =
    Math.round((events.reduce((acc, e) => acc + e.gapDays, 0) / events.length) * 10) / 10
  return { latest: events[events.length - 1], averageGapDays, events }
}

function distinctDaysOfType(
  logs: ActivityLog[],
  type: ActivityType,
  rangeStart: ISODate,
  rangeEnd: ISODate,
): number {
  const days = new Set(
    logs
      .filter((l) => l.type === type && l.date >= rangeStart && l.date <= rangeEnd)
      .map((l) => l.date),
  )
  return days.size
}

/** 최근 7일(기본값) 주간 회고 데이터를 계산합니다. */
export function computeWeeklyReview(params: {
  activityLogs: ActivityLog[]
  reflections: Reflection[]
  actions: ActionItem[]
  days?: number
  endDate?: ISODate
}): WeeklyReviewData {
  const { activityLogs, reflections, actions, days = 7 } = params
  const range = lastNDays(days, params.endDate)
  const rangeStart = range[0]
  const rangeEnd = range[range.length - 1]

  const weekReflections = reflections.filter((r) => r.date >= rangeStart && r.date <= rangeEnd)
  const weekActions = actions.filter(
    (a) => a.done && a.completedAt && a.completedAt.slice(0, 10) >= rangeStart && a.completedAt.slice(0, 10) <= rangeEnd,
  )

  const allActiveDates = Array.from(new Set(activityLogs.map((l) => l.date)))

  return {
    rangeStart,
    rangeEnd,
    readingDays: distinctDaysOfType(activityLogs, 'reading', rangeStart, rangeEnd),
    reflectionDays: distinctDaysOfType(activityLogs, 'reflection', rangeStart, rangeEnd),
    writingDays: distinctDaysOfType(activityLogs, 'writing', rangeStart, rangeEnd),
    actionDays: distinctDaysOfType(activityLogs, 'action', rangeStart, rangeEnd),
    reflectionCount: weekReflections.length,
    reflectionToActionCount: weekReflections.filter((r) => r.actionId).length,
    reflectionToActionRate: reflectionToActionRate(weekReflections) ?? 0,
    averageSatisfaction: averageSatisfaction(weekActions),
    recovery: computeRecoveryStats(allActiveDates),
  }
}

/** 복귀 이벤트를 사용자에게 보여줄 한국어 메시지로 변환합니다. 죄책감을 주지 않는 어조를 유지합니다. */
export function recoveryMessage(event: RecoveryEvent | null): string {
  if (!event) return '아직 복귀 기록이 없습니다. 꾸준히 쌓아가는 중이에요.'
  const base = `${event.gapDays}일 만에 돌아왔습니다.`
  if (event.previousGapDays === undefined) return base
  if (event.gapDays < event.previousGapDays) {
    const diff = event.previousGapDays - event.gapDays
    return `${base} 지난번보다 ${diff}일 빨리 복귀했어요.`
  }
  if (event.gapDays > event.previousGapDays) {
    return `${base} 괜찮아요, 돌아온 것이 중요합니다.`
  }
  return `${base} 지난번과 비슷한 속도로 돌아왔어요.`
}
