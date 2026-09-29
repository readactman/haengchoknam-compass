import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { FieldWrapper, TextArea, TextInput } from '../common/FormField'
import { BookForm } from './BookForm'
import { createReadingEntry } from '../../data/services'
import { useBooks } from '../../data/hooks'
import { todayISODate } from '../../lib/date'
import { Plus } from 'lucide-react'

interface ReadingEntryFormProps {
  open: boolean
  onClose: () => void
  defaultBookId?: string
}

export function ReadingEntryForm({ open, onClose, defaultBookId }: ReadingEntryFormProps) {
  const books = useBooks()
  const [bookId, setBookId] = useState(defaultBookId ?? '')
  const [pageFrom, setPageFrom] = useState('')
  const [pageTo, setPageTo] = useState('')
  const [quote, setQuote] = useState('')
  const [quoteReason, setQuoteReason] = useState('')
  const [personalQuestion, setPersonalQuestion] = useState('')
  const [thought, setThought] = useState('')
  const [error, setError] = useState('')
  const [newBookOpen, setNewBookOpen] = useState(false)

  if (!open) return null

  const effectiveBookId = bookId || defaultBookId || books?.[0]?.id || ''

  const reset = () => {
    setPageFrom('')
    setPageTo('')
    setQuote('')
    setQuoteReason('')
    setPersonalQuestion('')
    setThought('')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (!effectiveBookId) {
      setError('먼저 책을 선택하거나 추가해주세요.')
      return
    }
    if (!quote.trim() && !thought.trim()) {
      setError('문장이나 생각 중 하나는 적어주세요.')
      return
    }
    await createReadingEntry({
      bookId: effectiveBookId,
      date: todayISODate(),
      pageFrom: pageFrom ? Number(pageFrom) : undefined,
      pageTo: pageTo ? Number(pageTo) : undefined,
      quote: quote.trim() || undefined,
      quoteReason: quoteReason.trim() || undefined,
      personalQuestion: personalQuestion.trim() || undefined,
      thought: thought.trim() || undefined,
    })
    handleClose()
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title="오늘의 독서 기록"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              취소
            </Button>
            <Button onClick={handleSubmit}>기록하기</Button>
          </div>
        }
      >
        <FieldWrapper label="책" required>
          {books && books.length > 0 ? (
            <div className="flex gap-2">
              <select
                value={effectiveBookId}
                onChange={(e) => setBookId(e.target.value)}
                className="w-full rounded-xl border border-border bg-paper-card px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-soft/40"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setNewBookOpen(true)}
                className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border border-border text-ink-soft hover:bg-paper-dim"
                aria-label="새 책 추가"
              >
                <Plus size={18} />
              </button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setNewBookOpen(true)} icon={<Plus size={16} />}>
              읽고 있는 책 추가하기
            </Button>
          )}
        </FieldWrapper>

        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="시작 페이지">
            <TextInput
              type="number"
              inputMode="numeric"
              value={pageFrom}
              onChange={(e) => setPageFrom(e.target.value)}
              placeholder="예: 41"
            />
          </FieldWrapper>
          <FieldWrapper label="끝 페이지">
            <TextInput
              type="number"
              inputMode="numeric"
              value={pageTo}
              onChange={(e) => setPageTo(e.target.value)}
              placeholder="예: 80"
            />
          </FieldWrapper>
        </div>

        <FieldWrapper label="인상 깊은 문장">
          <TextArea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="마음에 남은 문장을 옮겨 적어보세요."
            rows={2}
          />
        </FieldWrapper>

        {quote.trim() && (
          <div className="pl-3 border-l-2 border-accent-sage-soft mb-4 space-y-4">
            <FieldWrapper label="이 문장은 왜 마음에 남았습니까?">
              <TextArea
                value={quoteReason}
                onChange={(e) => setQuoteReason(e.target.value)}
                rows={2}
              />
            </FieldWrapper>
            <FieldWrapper label="이 생각을 당신의 삶으로 가져온다면 어떤 질문이 됩니까?">
              <TextArea
                value={personalQuestion}
                onChange={(e) => setPersonalQuestion(e.target.value)}
                rows={2}
              />
            </FieldWrapper>
          </div>
        )}

        <FieldWrapper label="그 밖에 떠오른 생각">
          <TextArea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            rows={2}
          />
        </FieldWrapper>

        {error && <p className="text-sm text-accent-warm">{error}</p>}
      </Modal>
      <BookForm open={newBookOpen} onClose={() => setNewBookOpen(false)} />
    </>
  )
}
