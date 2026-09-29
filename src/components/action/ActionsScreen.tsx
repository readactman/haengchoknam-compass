import { useState } from 'react'
import { Circle, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../common/PageHeader'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { EmptyState } from '../common/EmptyState'
import { ActionForm } from './ActionForm'
import { ActionIllustration } from '../illustrations'
import { SatisfactionPicker } from './SatisfactionPicker'
import { useActions } from '../../data/hooks'
import { deleteAction, reopenAction } from '../../data/services'
import { formatKoreanDateShort } from '../../lib/date'

const FACES = ['', '😔', '😐', '🙂', '😊', '🤩']

export function ActionsScreen() {
  const actions = useActions()
  const [formOpen, setFormOpen] = useState(false)
  const [pendingCompleteId, setPendingCompleteId] = useState<string | null>(null)

  const open = (actions ?? []).filter((a) => !a.done)
  const done = (actions ?? []).filter((a) => a.done)

  return (
    <div>
      <PageHeader
        title="행동"
        subtitle="아주 작은 실천도 기록할 가치가 있어요"
        action={
          <Button size="sm" onClick={() => setFormOpen(true)} icon={<Plus size={15} />}>
            행동 추가
          </Button>
        }
      />
      <div className="px-5 sm:px-8 space-y-8">
        <section>
          <h2 className="text-xs font-medium text-ink-faint mb-2 px-1">진행 중 · {open.length}</h2>
          {open.length === 0 ? (
            <EmptyState
              icon={<ActionIllustration className="w-9 h-9" />}
              title="지금 진행 중인 행동이 없어요"
              description="성찰에서 이어지거나, 직접 작은 행동을 추가해보세요."
            />
          ) : (
            <div className="space-y-2">
              {open.map((a) => (
                <Card key={a.id} className="p-3.5 flex items-center gap-3">
                  <button
                    onClick={() => setPendingCompleteId(a.id)}
                    aria-label="완료로 표시"
                    className="text-ink-faint hover:text-accent-sage shrink-0"
                  >
                    <Circle size={20} />
                  </button>
                  <span className="flex-1 text-sm text-ink">{a.title}</span>
                  <button
                    onClick={() => deleteAction(a.id)}
                    aria-label="행동 삭제"
                    className="text-ink-faint hover:text-accent-warm shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </section>

        {done.length > 0 && (
          <section>
            <h2 className="text-xs font-medium text-ink-faint mb-2 px-1">완료 · {done.length}</h2>
            <div className="space-y-2">
              {done.map((a) => (
                <Card key={a.id} className="p-3.5 flex items-center gap-3 bg-paper-dim/40">
                  <button
                    onClick={() => reopenAction(a.id)}
                    aria-label="다시 진행 중으로"
                    className="text-accent-sage shrink-0"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-ink-soft line-through truncate block">{a.title}</span>
                    {a.completedAt && (
                      <span className="text-xs text-ink-faint">
                        {formatKoreanDateShort(a.completedAt.slice(0, 10))}
                      </span>
                    )}
                  </div>
                  {a.satisfaction && <span className="text-lg shrink-0">{FACES[a.satisfaction]}</span>}
                  <button
                    onClick={() => deleteAction(a.id)}
                    aria-label="행동 삭제"
                    className="text-ink-faint hover:text-accent-warm shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
      <ActionForm open={formOpen} onClose={() => setFormOpen(false)} />
      <SatisfactionPicker actionId={pendingCompleteId} onClose={() => setPendingCompleteId(null)} />
    </div>
  )
}
