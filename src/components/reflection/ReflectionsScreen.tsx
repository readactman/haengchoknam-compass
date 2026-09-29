import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../common/PageHeader'
import { Button } from '../common/Button'
import { EmptyState } from '../common/EmptyState'
import { ReflectionForm } from './ReflectionForm'
import { ReflectionCard } from './ReflectionCard'
import { ReflectionIllustration } from '../illustrations'
import { useActions, useReflections } from '../../data/hooks'
import { REFLECTION_CATEGORIES, type ReflectionCategory } from '../../types'

export function ReflectionsScreen() {
  const reflections = useReflections()
  const actions = useActions()
  const [formOpen, setFormOpen] = useState(false)
  const [filter, setFilter] = useState<ReflectionCategory | 'all'>('all')

  const actionById = new Map((actions ?? []).map((a) => [a.id, a]))
  const filtered = (reflections ?? []).filter((r) => filter === 'all' || r.category === filter)

  return (
    <div>
      <PageHeader
        title="성찰"
        subtitle="책, 일, 관계, 일상에서 떠오른 생각들"
        action={
          <Button size="sm" onClick={() => setFormOpen(true)} icon={<Plus size={15} />}>
            생각 기록
          </Button>
        }
      />
      <div className="px-5 sm:px-8">
        {reflections && reflections.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
            <button
              onClick={() => setFilter('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm border ${
                filter === 'all' ? 'bg-brand text-paper border-brand' : 'border-border text-ink-soft'
              }`}
            >
              전체
            </button>
            {REFLECTION_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm border ${
                  filter === c ? 'bg-brand text-paper border-brand' : 'border-border text-ink-soft'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {!reflections || reflections.length === 0 ? (
          <EmptyState
            icon={<ReflectionIllustration className="w-10 h-10" />}
            title="아직 남긴 생각이 없어요"
            description="책을 읽다가, 혹은 하루를 보내다가 떠오른 생각을 적어보세요."
            action={<Button onClick={() => setFormOpen(true)}>생각 기록하기</Button>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState title="이 카테고리에는 아직 기록이 없어요" />
        ) : (
          <div className="space-y-3 pb-4">
            {filtered.map((r) => (
              <ReflectionCard
                key={r.id}
                reflection={r}
                linkedAction={r.actionId ? actionById.get(r.actionId) : undefined}
              />
            ))}
          </div>
        )}
      </div>
      <ReflectionForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
