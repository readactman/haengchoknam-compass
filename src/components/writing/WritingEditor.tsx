import { useState } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Card } from '../common/Card'
import { FieldWrapper, TextArea, TextInput } from '../common/FormField'
import { useBooks, useReadingEntries, useReflections } from '../../data/hooks'
import { createWriting, deleteWriting, updateWriting } from '../../data/services'
import type { Writing, WritingStatus } from '../../types'

const STATUS_OPTIONS: WritingStatus[] = ['아이디어', '초안', '완성']

interface WritingEditorProps {
  writing?: Writing
  onBack: () => void
}

function useDebouncedField(initial: string, save: (value: string) => void) {
  const [value, setValue] = useState(initial)
  const onBlur = () => save(value)
  return { value, onChange: (v: string) => setValue(v), onBlur }
}

export function WritingEditor({ writing, onBack }: WritingEditorProps) {
  const reflections = useReflections()
  const readingEntries = useReadingEntries()
  const books = useBooks()
  const bookById = new Map((books ?? []).map((b) => [b.id, b]))

  const [id, setId] = useState(writing?.id)
  const [status, setStatus] = useState<WritingStatus>(writing?.status ?? '아이디어')
  const [linkedReflectionIds, setLinkedReflectionIds] = useState<string[]>(
    writing?.linkedReflectionIds ?? [],
  )
  const [linkedReadingEntryIds, setLinkedReadingEntryIds] = useState<string[]>(
    writing?.linkedReadingEntryIds ?? [],
  )
  const [showLinker, setShowLinker] = useState(false)

  const title = useDebouncedField(writing?.title ?? '', (v) => persist({ title: v }))
  const question = useDebouncedField(writing?.question ?? '', (v) => persist({ question: v }))
  const scene = useDebouncedField(writing?.sceneOrExperience ?? '', (v) =>
    persist({ sceneOrExperience: v }),
  )
  const myThought = useDebouncedField(writing?.myThought ?? '', (v) => persist({ myThought: v }))
  const counterpoint = useDebouncedField(writing?.counterpoint ?? '', (v) =>
    persist({ counterpoint: v }),
  )
  const message = useDebouncedField(writing?.message ?? '', (v) => persist({ message: v }))
  const actionSuggestion = useDebouncedField(writing?.actionSuggestion ?? '', (v) =>
    persist({ actionSuggestion: v }),
  )
  const finalText = useDebouncedField(writing?.finalText ?? '', (v) => persist({ finalText: v }))

  async function persist(patch: Partial<Writing>) {
    if (!id) {
      if (!title.value.trim() && !Object.values(patch)[0]) return
      const created = await createWriting({
        title: title.value.trim() || '제목 없는 글',
        status,
        linkedReflectionIds,
        linkedReadingEntryIds,
        ...patch,
      })
      setId(created.id)
      return
    }
    await updateWriting(id, patch)
  }

  const handleStatusChange = async (s: WritingStatus) => {
    setStatus(s)
    await persist({ status: s })
  }

  const toggleReflection = async (rid: string) => {
    const next = linkedReflectionIds.includes(rid)
      ? linkedReflectionIds.filter((x) => x !== rid)
      : [...linkedReflectionIds, rid]
    setLinkedReflectionIds(next)
    await persist({ linkedReflectionIds: next })
  }

  const toggleEntry = async (eid: string) => {
    const next = linkedReadingEntryIds.includes(eid)
      ? linkedReadingEntryIds.filter((x) => x !== eid)
      : [...linkedReadingEntryIds, eid]
    setLinkedReadingEntryIds(next)
    await persist({ linkedReadingEntryIds: next })
  }

  const handleDelete = async () => {
    if (!id) {
      onBack()
      return
    }
    if (!confirm('이 글을 삭제할까요?')) return
    await deleteWriting(id)
    onBack()
  }

  return (
    <div className="px-5 sm:px-8 pb-10">
      <div className="flex items-center justify-between pt-6 sm:pt-8 mb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-ink-faint hover:text-ink">
          <ArrowLeft size={16} /> 글쓰기 스튜디오
        </button>
        <button onClick={handleDelete} className="text-ink-faint hover:text-accent-warm" aria-label="글 삭제">
          <Trash2 size={16} />
        </button>
      </div>

      <TextInput
        value={title.value}
        onChange={(e) => title.onChange(e.target.value)}
        onBlur={title.onBlur}
        placeholder="글의 제목"
        className="!text-xl font-heading !border-none !px-1 !py-1 mb-1 focus:!ring-0"
      />

      <div className="flex gap-2 mb-6">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`px-3 py-1 rounded-full text-xs border ${
              status === s ? 'bg-brand text-paper border-brand' : 'border-border text-ink-soft'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowLinker((v) => !v)}
          className="text-sm text-brand-soft hover:underline"
        >
          {showLinker ? '연결한 글감 닫기' : `연결된 글감 (${linkedReflectionIds.length + linkedReadingEntryIds.length})`}
        </button>
        {showLinker && (
          <Card className="p-3 mt-2 max-h-56 overflow-y-auto">
            {(reflections ?? []).length === 0 && (readingEntries ?? []).length === 0 && (
              <p className="text-xs text-ink-faint">아직 연결할 성찰이나 독서 기록이 없어요.</p>
            )}
            {(reflections ?? []).map((r) => (
              <label key={r.id} className="flex items-center gap-2 py-1.5 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={linkedReflectionIds.includes(r.id)}
                  onChange={() => toggleReflection(r.id)}
                />
                <span className="truncate">[성찰] {r.title}</span>
              </label>
            ))}
            {(readingEntries ?? []).map((e) => (
              <label key={e.id} className="flex items-center gap-2 py-1.5 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={linkedReadingEntryIds.includes(e.id)}
                  onChange={() => toggleEntry(e.id)}
                />
                <span className="truncate">
                  [독서] {bookById.get(e.bookId)?.title ?? '책'} — {e.quote?.slice(0, 20) ?? e.thought?.slice(0, 20) ?? e.date}
                </span>
              </label>
            ))}
          </Card>
        )}
      </div>

      <div className="space-y-5">
        <FieldWrapper label="독자에게 던질 질문">
          <TextArea value={question.value} onChange={(e) => question.onChange(e.target.value)} onBlur={question.onBlur} rows={2} />
        </FieldWrapper>
        <FieldWrapper label="경험 또는 책 속 장면">
          <TextArea value={scene.value} onChange={(e) => scene.onChange(e.target.value)} onBlur={scene.onBlur} rows={3} />
        </FieldWrapper>
        <FieldWrapper label="나의 생각">
          <TextArea value={myThought.value} onChange={(e) => myThought.onChange(e.target.value)} onBlur={myThought.onBlur} rows={3} />
        </FieldWrapper>
        <FieldWrapper label="반대 관점 또는 논리적으로 점검할 부분">
          <TextArea value={counterpoint.value} onChange={(e) => counterpoint.onChange(e.target.value)} onBlur={counterpoint.onBlur} rows={3} />
        </FieldWrapper>
        <FieldWrapper label="독자가 가져갈 메시지">
          <TextArea value={message.value} onChange={(e) => message.onChange(e.target.value)} onBlur={message.onBlur} rows={2} />
        </FieldWrapper>
        <FieldWrapper label="오늘의 행동 제안">
          <TextArea value={actionSuggestion.value} onChange={(e) => actionSuggestion.onChange(e.target.value)} onBlur={actionSuggestion.onBlur} rows={2} />
        </FieldWrapper>
        <FieldWrapper label="완성된 글">
          <TextArea
            value={finalText.value}
            onChange={(e) => finalText.onChange(e.target.value)}
            onBlur={finalText.onBlur}
            rows={10}
            placeholder="위 재료들을 바탕으로 완성된 글을 이어 써보세요."
          />
        </FieldWrapper>
      </div>
    </div>
  )
}
