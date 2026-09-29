import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { FieldWrapper, TextArea } from '../common/FormField'
import { useBooks, useReadingEntries, useReflections, useWritings } from '../../data/hooks'
import { createPrinciple, updatePrinciple } from '../../data/services'
import type { Principle } from '../../types'

interface PrincipleFormProps {
  open: boolean
  onClose: () => void
  editing?: Principle
}

export function PrincipleForm({ open, onClose, editing }: PrincipleFormProps) {
  const reflections = useReflections()
  const readingEntries = useReadingEntries()
  const writings = useWritings()
  const books = useBooks()
  const bookById = new Map((books ?? []).map((b) => [b.id, b]))

  const [text, setText] = useState(editing?.text ?? '')
  const [description, setDescription] = useState(editing?.description ?? '')
  const [linkedReflectionIds, setLinkedReflectionIds] = useState<string[]>(
    editing?.linkedReflectionIds ?? [],
  )
  const [linkedReadingEntryIds, setLinkedReadingEntryIds] = useState<string[]>(
    editing?.linkedReadingEntryIds ?? [],
  )
  const [linkedWritingIds, setLinkedWritingIds] = useState<string[]>(
    editing?.linkedWritingIds ?? [],
  )
  const [error, setError] = useState('')

  if (!open) return null

  const reset = () => {
    setText('')
    setDescription('')
    setLinkedReflectionIds([])
    setLinkedReadingEntryIds([])
    setLinkedWritingIds([])
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const toggle = (list: string[], setList: (v: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('원칙으로 삼을 문장을 적어주세요.')
      return
    }
    if (editing) {
      await updatePrinciple(editing.id, {
        text: text.trim(),
        description: description.trim() || undefined,
        linkedReflectionIds,
        linkedReadingEntryIds,
        linkedWritingIds,
      })
    } else {
      await createPrinciple({
        text: text.trim(),
        description: description.trim() || undefined,
        linkedReflectionIds,
        linkedReadingEntryIds,
        linkedWritingIds,
      })
    }
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={editing ? '원칙 수정' : '새 원칙'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleSubmit}>{editing ? '저장' : '추가하기'}</Button>
        </div>
      }
    >
      <FieldWrapper label="문장" required hint="예: 완벽함보다 복귀다.">
        <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={2} autoFocus />
      </FieldWrapper>
      <FieldWrapper label="이 생각을 하게 된 배경">
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </FieldWrapper>

      {((reflections?.length ?? 0) > 0 || (readingEntries?.length ?? 0) > 0 || (writings?.length ?? 0) > 0) && (
        <FieldWrapper label="이 원칙과 연결된 기록">
          <div className="border border-border rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
            {(readingEntries ?? []).map((e) => (
              <label key={e.id} className="flex items-center gap-2 py-1 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={linkedReadingEntryIds.includes(e.id)}
                  onChange={() => toggle(linkedReadingEntryIds, setLinkedReadingEntryIds, e.id)}
                />
                <span className="truncate">
                  [독서] {bookById.get(e.bookId)?.title ?? '책'} — {e.quote?.slice(0, 18) ?? e.date}
                </span>
              </label>
            ))}
            {(reflections ?? []).map((r) => (
              <label key={r.id} className="flex items-center gap-2 py-1 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={linkedReflectionIds.includes(r.id)}
                  onChange={() => toggle(linkedReflectionIds, setLinkedReflectionIds, r.id)}
                />
                <span className="truncate">[성찰] {r.title}</span>
              </label>
            ))}
            {(writings ?? []).map((w) => (
              <label key={w.id} className="flex items-center gap-2 py-1 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={linkedWritingIds.includes(w.id)}
                  onChange={() => toggle(linkedWritingIds, setLinkedWritingIds, w.id)}
                />
                <span className="truncate">[글] {w.title}</span>
              </label>
            ))}
          </div>
        </FieldWrapper>
      )}

      {error && <p className="text-sm text-accent-warm">{error}</p>}
    </Modal>
  )
}
