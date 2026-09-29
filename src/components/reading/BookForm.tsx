import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { FieldWrapper, TextInput } from '../common/FormField'
import { createBook, updateBook } from '../../data/services'
import { todayISODate } from '../../lib/date'
import type { Book, BookStatus } from '../../types'

const STATUS_OPTIONS: BookStatus[] = ['읽는 중', '완독', '보류']
const COVER_COLORS = ['#7c8a6e', '#8a6e5b', '#5b7a8a', '#a8703f', '#6e5b8a', '#8a5b6e']

function pickColor(): string {
  return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)]
}

interface BookFormProps {
  open: boolean
  onClose: () => void
  editing?: Book
}

export function BookForm({ open, onClose, editing }: BookFormProps) {
  const [title, setTitle] = useState(editing?.title ?? '')
  const [author, setAuthor] = useState(editing?.author ?? '')
  const [status, setStatus] = useState<BookStatus>(editing?.status ?? '읽는 중')
  const [totalPages, setTotalPages] = useState(editing?.totalPages?.toString() ?? '')
  const [error, setError] = useState('')

  if (!open) return null

  const reset = () => {
    setTitle('')
    setAuthor('')
    setStatus('읽는 중')
    setTotalPages('')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('책 제목을 입력해주세요.')
      return
    }
    const pages = totalPages ? Number(totalPages) : undefined
    if (editing) {
      await updateBook(editing.id, {
        title: title.trim(),
        author: author.trim(),
        status,
        totalPages: pages,
        finishDate: status === '완독' ? editing.finishDate ?? todayISODate() : undefined,
      })
    } else {
      await createBook({
        title: title.trim(),
        author: author.trim() || '작자 미상',
        status,
        totalPages: pages,
        startDate: todayISODate(),
        coverColor: pickColor(),
      })
    }
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={editing ? '책 정보 수정' : '새 책 추가'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleSubmit}>{editing ? '저장' : '추가하기'}</Button>
        </div>
      }
    >
      <FieldWrapper label="책 제목" required>
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 오디세이아"
          autoFocus
        />
      </FieldWrapper>
      <FieldWrapper label="저자">
        <TextInput
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="예: 호메로스"
        />
      </FieldWrapper>
      <FieldWrapper label="전체 페이지 수">
        <TextInput
          type="number"
          inputMode="numeric"
          value={totalPages}
          onChange={(e) => setTotalPages(e.target.value)}
          placeholder="예: 560"
        />
      </FieldWrapper>
      <FieldWrapper label="상태">
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`px-3.5 py-2 rounded-xl text-sm border transition-colors ${
                status === s
                  ? 'bg-brand text-paper border-brand'
                  : 'border-border text-ink-soft hover:bg-paper-dim'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FieldWrapper>
      {error && <p className="text-sm text-accent-warm">{error}</p>}
    </Modal>
  )
}
