import { PageHeader } from '../common/PageHeader'
import { Card } from '../common/Card'
import { useActions, useActivityLogs, useReflections } from '../../data/hooks'
import { computeWeeklyReview, recoveryMessage } from '../../lib/calculations'
import { formatKoreanDateShort } from '../../lib/date'
import { BookOpen, NotebookPen, PenLine, CheckCircle2, RotateCcw, ArrowRightCircle } from 'lucide-react'

const FACES = ['', '😔', '😐', '🙂', '😊', '🤩']

export function WeeklyReviewScreen() {
  const activityLogs = useActivityLogs()
  const reflections = useReflections()
  const actions = useActions()

  if (!activityLogs || !reflections || !actions) return null

  const review = computeWeeklyReview({ activityLogs, reflections, actions })
  const satisfactionRounded = review.averageSatisfaction ? Math.round(review.averageSatisfaction) : 0

  const dayStats = [
    { label: '읽은 날', value: review.readingDays, icon: BookOpen },
    { label: '성찰한 날', value: review.reflectionDays, icon: NotebookPen },
    { label: '글쓴 날', value: review.writingDays, icon: PenLine },
    { label: '행동한 날', value: review.actionDays, icon: CheckCircle2 },
  ]

  return (
    <div>
      <PageHeader
        title="주간 회고"
        subtitle={`${formatKoreanDateShort(review.rangeStart)} – ${formatKoreanDateShort(review.rangeEnd)}`}
      />
      <div className="px-5 sm:px-8 space-y-4 pb-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-ink-faint text-sm mb-3">
              <ArrowRightCircle size={16} />
              성찰 → 행동 전환율
            </div>
            <p className="font-heading text-3xl text-ink mb-2">{review.reflectionToActionRate}%</p>
            <div className="h-2 rounded-full bg-paper-dim overflow-hidden">
              <div
                className="h-full bg-accent-sage rounded-full transition-all"
                style={{ width: `${Math.min(100, review.reflectionToActionRate)}%` }}
              />
            </div>
            <p className="text-xs text-ink-faint mt-2">
              이번 주 성찰 {review.reflectionCount}개 중 {review.reflectionToActionCount}개가 행동으로 이어졌어요.
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 text-ink-faint text-sm mb-3">
              <RotateCcw size={16} />
              복귀력
            </div>
            <p className="text-ink leading-relaxed mb-2">{recoveryMessage(review.recovery.latest)}</p>
            {review.recovery.averageGapDays !== null && (
              <p className="text-xs text-ink-faint">
                최근 평균 복귀 소요일은 {review.recovery.averageGapDays}일입니다.
              </p>
            )}
          </Card>
        </div>

        <Card className="p-5">
          <p className="text-sm text-ink-faint mb-4">최근 7일 동안</p>
          <div className="grid grid-cols-4 gap-2">
            {dayStats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full bg-paper-dim flex items-center justify-center text-brand-soft mb-1.5">
                  <Icon size={18} />
                </div>
                <p className="text-sm font-medium text-ink">{value}/7일</p>
                <p className="text-xs text-ink-faint">{label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-ink-faint mb-3">평균 행동 만족도</p>
          {review.averageSatisfaction === null ? (
            <p className="text-sm text-ink-faint">이번 주에는 아직 평가된 행동이 없어요.</p>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-3xl">{FACES[satisfactionRounded]}</span>
              <span className="font-heading text-2xl text-ink">{review.averageSatisfaction} / 5</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
