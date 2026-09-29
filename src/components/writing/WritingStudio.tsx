import { useState } from 'react'
import { Plus, PenLine } from 'lucide-react'
import { PageHeader } from '../common/PageHeader'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { EmptyState } from '../common/EmptyState'
import { WritingEditor } from './WritingEditor'
import { useWritings } from '../../data/hooks'
import type { Writing, WritingStatus } from '../../types'

const statusOrder: WritingStatus[] = ['아이디어', '초안', '완성']
const statusColor: Record<WritingStatus, string> = {
  아이디어: 'bg-paper-dim text-ink-faint',
  초안: 'bg-accent-sky-soft text-accent-sky',
  완성: 'bg-accent-sage-soft text-accent-sage',
}

export function WritingStudio() {
  const writings = useWritings()
  const [mode, setMode] = useState<'list' | 'new' | 'edit'>('list')
  const [selected, setSelected] = useState<Writing | undefined>(undefined)

  if (mode === 'new') {
    return <WritingEditor onBack={() => setMode('list')} />
  }
  if (mode === 'edit' && selected) {
    return <WritingEditor writing={selected} onBack={() => setMode('list')} />
  }

  return (
    <div>
      <PageHeader
        title="글쓰기 스튜디오"
        subtitle="독서와 성찰을 글감으로 엮어보세요"
        action={
          <Button size="sm" onClick={() => setMode('new')} icon={<Plus size={15} />}>
            새 글
          </Button>
        }
      />
      <div className="px-5 sm:px-8">
        {!writings || writings.length === 0 ? (
          <EmptyState
            icon={<PenLine size={32} />}
            title="아직 시작한 글이 없어요"
            description="성찰과 독서 기록을 모아 하나의 글로 엮어보세요."
            action={<Button onClick={() => setMode('new')}>새 글 시작하기</Button>}
          />
        ) : (
          <div className="space-y-6">
            {statusOrder.map((status) => {
              const group = writings.filter((w) => w.status === status)
              if (group.length === 0) return null
              return (
                <div key={status}>
                  <h2 className="text-xs font-medium text-ink-faint mb-2 px-1">
                    {status} · {group.length}
                  </h2>
                  <div className="space-y-2">
                    {group.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          setSelected(w)
                          setMode('edit')
                        }}
                        className="w-full text-left"
                      >
                        <Card className="p-4 hover:border-brand-soft transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-ink truncate">{w.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColor[w.status]}`}>
                              {w.status}
                            </span>
                          </div>
                          {w.message && (
                            <p className="text-sm text-ink-faint mt-1 truncate">{w.message}</p>
                          )}
                        </Card>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
