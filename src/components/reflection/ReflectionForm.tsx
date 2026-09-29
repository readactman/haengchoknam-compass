import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { FieldWrapper, TextArea, TextInput } from '../common/FormField'
import { createReflection } from '../../data/services'
import { todayISODate } from '../../lib/date'
import { REFLECTION_CATEGORIES, type ReflectionCategory } from '../../types'

interface ReflectionFormProps {
  open: boolean
  onClose: () => void
  defaultCategory?: ReflectionCategory
}

export function ReflectionForm({ open, onClose, defaultCategory }: ReflectionFormProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<ReflectionCategory>(defaultCategory ?? '기타')
  const [tagsInput, setTagsInput] = useState('')
  const [error, setError] = useState('')

  if (!open) return null

  const reset = () => {
    setTitle('')
    setBody('')
    setCategory(defaultCategory ?? '기타')
    setTagsInput('')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (!body.trim()) {
      setError('떠오른 생각을 적어주세요.')
      return
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    await createReflection({
      title: title.trim() || body.trim().slice(0, 20),
      body: body.trim(),
      date: todayISODate(),
      category,
      tags,
    })
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="오늘의 생각"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleSubmit}>기록하기</Button>
        </div>
      }
    >
      <FieldWrapper label="제목">
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="비워두면 본문의 앞부분으로 채워집니다"
          autoFocus
        />
      </FieldWrapper>
      <FieldWrapper label="어떤 생각이 떠올랐습니까?" required>
        <TextArea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="일, 가족, 관계, 운동, 투자, 일상 무엇이든 좋습니다."
        />
      </FieldWrapper>
      <FieldWrapper label="카테고리">
        <div className="flex flex-wrap gap-2">
          {REFLECTION_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                category === c
                  ? 'bg-brand text-paper border-brand'
                  : 'border-border text-ink-soft hover:bg-paper-dim'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </FieldWrapper>
      <FieldWrapper label="태그" hint="쉼표로 구분해서 입력하세요">
        <TextInput
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="예: 루틴, 관계"
        />
      </FieldWrapper>
      {error && <p className="text-sm text-accent-warm">{error}</p>}
    </Modal>
  )
}
