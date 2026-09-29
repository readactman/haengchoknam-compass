import { useState } from 'react'
import { Plus, Compass, Trash2, Pencil } from 'lucide-react'
import { PageHeader } from '../common/PageHeader'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { EmptyState } from '../common/EmptyState'
import { PrincipleForm } from './PrincipleForm'
import { usePrinciples } from '../../data/hooks'
import { deletePrinciple } from '../../data/services'
import type { Principle } from '../../types'

export function PrinciplesScreen() {
  const principles = usePrinciples()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Principle | undefined>(undefined)

  const openNew = () => {
    setEditing(undefined)
    setFormOpen(true)
  }
  const openEdit = (p: Principle) => {
    setEditing(p)
    setFormOpen(true)
  }
  const closeForm = () => {
    setFormOpen(false)
    setEditing(undefined)
  }

  return (
    <div>
      <PageHeader
        title="나의 원칙"
        subtitle="나는 어떤 생각을 가지고 살아가는 사람인가"
        action={
          <Button size="sm" onClick={openNew} icon={<Plus size={15} />}>
            원칙 추가
          </Button>
        }
      />
      <div className="px-5 sm:px-8">
        {!principles || principles.length === 0 ? (
          <EmptyState
            icon={<Compass size={32} />}
            title="아직 정리한 원칙이 없어요"
            description="살아가며 중요하다고 느낀 문장을 원칙으로 남겨보세요."
            action={<Button onClick={openNew}>원칙 추가하기</Button>}
          />
        ) : (
          <div className="space-y-3">
            {principles.map((p) => {
              const linkedCount =
                p.linkedReadingEntryIds.length + p.linkedReflectionIds.length + p.linkedWritingIds.length
              return (
                <Card key={p.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-heading text-lg text-ink leading-snug">“{p.text}”</p>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(p)}
                        aria-label="원칙 수정"
                        className="p-1.5 text-ink-faint hover:text-ink hover:bg-paper-dim rounded-lg"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deletePrinciple(p.id)}
                        aria-label="원칙 삭제"
                        className="p-1.5 text-ink-faint hover:text-accent-warm hover:bg-paper-dim rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {p.description && <p className="text-sm text-ink-soft mt-2">{p.description}</p>}
                  {linkedCount > 0 && (
                    <p className="text-xs text-ink-faint mt-3">연결된 기록 {linkedCount}개</p>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
      <PrincipleForm open={formOpen} onClose={closeForm} editing={editing} />
    </div>
  )
}
