import { useState } from 'react'
import { Trash2, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card } from '../common/Card'
import { TextInput } from '../common/FormField'
import { attachActionToReflection, deleteReflection } from '../../data/services'
import { formatKoreanDateShort } from '../../lib/date'
import type { ActionItem, Reflection } from '../../types'

const categoryColor: Record<string, string> = {
  독서: 'bg-accent-sage-soft text-accent-sage',
  글쓰기: 'bg-accent-warm-soft text-accent-warm',
  가족: 'bg-accent-sky-soft text-accent-sky',
  일: 'bg-paper-dim text-ink-soft',
  투자: 'bg-accent-warm-soft text-accent-warm',
  운동: 'bg-accent-sage-soft text-accent-sage',
  관계: 'bg-accent-sky-soft text-accent-sky',
  기타: 'bg-paper-dim text-ink-faint',
}

export function ReflectionCard({
  reflection,
  linkedAction,
}: {
  reflection: Reflection
  linkedAction?: ActionItem
}) {
  const [actionText, setActionText] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAttach = async () => {
    if (!actionText.trim()) return
    setSaving(true)
    await attachActionToReflection(reflection.id, actionText.trim())
    setActionText('')
    setSaving(false)
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor[reflection.category]}`}>
            {reflection.category}
          </span>
          <span className="text-xs text-ink-faint">{formatKoreanDateShort(reflection.date)}</span>
        </div>
        <button
          onClick={() => deleteReflection(reflection.id)}
          aria-label="성찰 삭제"
          className="text-ink-faint hover:text-accent-warm"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <h3 className="font-heading text-ink mb-1">{reflection.title}</h3>
      <p className="text-sm text-ink-soft whitespace-pre-wrap leading-relaxed mb-3">{reflection.body}</p>
      {reflection.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {reflection.tags.map((t) => (
            <span key={t} className="text-xs text-ink-faint bg-paper-dim px-2 py-0.5 rounded-full">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-border">
        {linkedAction ? (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2
              size={16}
              className={linkedAction.done ? 'text-accent-sage' : 'text-ink-faint'}
            />
            <span className={linkedAction.done ? 'text-ink-soft line-through' : 'text-ink-soft'}>
              {linkedAction.title}
            </span>
          </div>
        ) : (
          <div>
            <p className="text-xs text-ink-faint mb-2">
              이 생각에서 오늘 할 수 있는 가장 작은 행동은 무엇입니까?
            </p>
            <div className="flex gap-2">
              <TextInput
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="예: 책 1쪽 읽기"
                onKeyDown={(e) => e.key === 'Enter' && handleAttach()}
              />
              <button
                onClick={handleAttach}
                disabled={saving || !actionText.trim()}
                aria-label="행동으로 연결하기"
                className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-brand text-paper disabled:opacity-40"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
