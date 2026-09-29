import { useState } from 'react'
import { BookOpen, NotebookPen, PenLine, CheckCircle2, Circle } from 'lucide-react'
import { TodayCard } from './TodayCard'
import { ReadingEntryForm } from '../reading/ReadingEntryForm'
import { ReflectionForm } from '../reflection/ReflectionForm'
import { ActionForm } from '../action/ActionForm'
import { SatisfactionPicker } from '../action/SatisfactionPicker'
import { useActions, useActivityLogs, useBooks, useReadingEntries, useReflections, useWritings } from '../../data/hooks'
import { computeRecoveryStats, recoveryMessage } from '../../lib/calculations'
import { todayISODate } from '../../lib/date'
import { useNav } from '../../nav/NavContext'
import { Button } from '../common/Button'

export function TodayScreen() {
  const { goTo } = useNav()
  const today = todayISODate()
  const books = useBooks()
  const readingEntries = useReadingEntries()
  const reflections = useReflections()
  const writings = useWritings()
  const actions = useActions()
  const activityLogs = useActivityLogs()

  const [readingOpen, setReadingOpen] = useState(false)
  const [reflectionOpen, setReflectionOpen] = useState(false)
  const [actionOpen, setActionOpen] = useState(false)
  const [pendingCompleteId, setPendingCompleteId] = useState<string | null>(null)

  const bookById = new Map((books ?? []).map((b) => [b.id, b]))
  const todaysReading = (readingEntries ?? []).filter((e) => e.date === today)
  const todaysReflections = (reflections ?? []).filter((r) => r.date === today)
  const todaysWriting = (writings ?? []).filter((w) => w.updatedAt.slice(0, 10) === today)
  const openActions = (actions ?? []).filter((a) => !a.done)

  const recovery = activityLogs ? computeRecoveryStats(Array.from(new Set(activityLogs.map((l) => l.date)))) : null
  const showRecoveryNote = recovery?.latest && recovery.latest.date === today

  return (
    <div>
      <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5">
        <h1 className="font-heading text-2xl text-ink leading-snug">
          오늘 무엇을 읽고,
          <br />
          무엇을 생각하고,
          <br />
          무엇을 행동하시겠습니까?
        </h1>
        {showRecoveryNote && (
          <p className="text-sm text-accent-sage mt-3">{recoveryMessage(recovery!.latest)}</p>
        )}
      </div>

      <div className="px-5 sm:px-8 grid sm:grid-cols-2 gap-4 pb-8">
        <TodayCard
          icon={BookOpen}
          title="오늘의 독서"
          accentClass="bg-accent-sky-soft text-accent-sky"
          onAdd={() => setReadingOpen(true)}
        >
          {todaysReading.length === 0 ? (
            <p className="text-sm text-ink-faint">아직 오늘 읽은 기록이 없어요.</p>
          ) : (
            <ul className="space-y-1.5">
              {todaysReading.map((e) => (
                <li key={e.id} className="text-sm text-ink-soft truncate">
                  {bookById.get(e.bookId)?.title ?? '책'}
                  {e.quote && <span className="text-ink-faint"> — “{e.quote.slice(0, 24)}”</span>}
                </li>
              ))}
            </ul>
          )}
        </TodayCard>

        <TodayCard
          icon={NotebookPen}
          title="오늘의 생각"
          accentClass="bg-accent-warm-soft text-accent-warm"
          onAdd={() => setReflectionOpen(true)}
        >
          {todaysReflections.length === 0 ? (
            <p className="text-sm text-ink-faint">아직 오늘 남긴 생각이 없어요.</p>
          ) : (
            <ul className="space-y-1.5">
              {todaysReflections.map((r) => (
                <li key={r.id} className="text-sm text-ink-soft truncate">
                  {r.title}
                </li>
              ))}
            </ul>
          )}
        </TodayCard>

        <TodayCard
          icon={PenLine}
          title="오늘의 글쓰기"
          accentClass="bg-accent-sage-soft text-accent-sage"
          onAdd={() => goTo('writing')}
          addLabel="스튜디오"
        >
          {todaysWriting.length === 0 ? (
            <p className="text-sm text-ink-faint">오늘 이어 쓴 글이 없어요.</p>
          ) : (
            <ul className="space-y-1.5">
              {todaysWriting.map((w) => (
                <li key={w.id} className="text-sm text-ink-soft truncate">
                  {w.title} <span className="text-ink-faint">· {w.status}</span>
                </li>
              ))}
            </ul>
          )}
        </TodayCard>

        <TodayCard
          icon={CheckCircle2}
          title="오늘의 행동"
          accentClass="bg-brand-soft/20 text-brand-soft"
          onAdd={() => setActionOpen(true)}
        >
          {openActions.length === 0 ? (
            <p className="text-sm text-ink-faint">지금 진행 중인 행동이 없어요.</p>
          ) : (
            <ul className="space-y-1.5">
              {openActions.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-sm text-ink-soft">
                  <button
                    onClick={() => setPendingCompleteId(a.id)}
                    aria-label="완료로 표시"
                    className="text-ink-faint hover:text-accent-sage shrink-0"
                  >
                    <Circle size={15} />
                  </button>
                  <span className="truncate">{a.title}</span>
                </li>
              ))}
            </ul>
          )}
          {openActions.length > 4 && (
            <Button variant="ghost" size="sm" className="mt-2 !px-0" onClick={() => goTo('actions')}>
              전체 {openActions.length}개 보기
            </Button>
          )}
        </TodayCard>
      </div>

      <ReadingEntryForm open={readingOpen} onClose={() => setReadingOpen(false)} />
      <ReflectionForm open={reflectionOpen} onClose={() => setReflectionOpen(false)} />
      <ActionForm open={actionOpen} onClose={() => setActionOpen(false)} />
      <SatisfactionPicker actionId={pendingCompleteId} onClose={() => setPendingCompleteId(null)} />
    </div>
  )
}
