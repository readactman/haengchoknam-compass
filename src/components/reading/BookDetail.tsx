import { useState } from 'react'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { EmptyState } from '../common/EmptyState'
import { BookForm } from './BookForm'
import { ReadingEntryForm } from './ReadingEntryForm'
import { useBook, useReadingEntries } from '../../data/hooks'
import { deleteBook, deleteReadingEntry } from '../../data/services'
import { formatKoreanDate } from '../../lib/date'
import type { Book } from '../../types'

const statusBadge: Record<Book['status'], string> = {
  '읽는 중': 'bg-accent-sky-soft text-accent-sky',
  완독: 'bg-accent-sage-soft text-accent-sage',
  보류: 'bg-paper-dim text-ink-faint',
}

export function BookDetail({ bookId, onBack }: { bookId: string; onBack: () => void }) {
  const book = useBook(bookId)
  const entries = useReadingEntries(bookId)
  const [editOpen, setEditOpen] = useState(false)
  const [entryOpen, setEntryOpen] = useState(false)

  if (!book) return null

  const handleDelete = async () => {
    if (!confirm(`"${book.title}"과(와) 관련된 독서 기록이 모두 삭제됩니다. 계속할까요?`)) return
    await deleteBook(book.id)
    onBack()
  }

  return (
    <div className="px-5 sm:px-8 pb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-ink-faint hover:text-ink mb-4 pt-6 sm:pt-8"
      >
        <ArrowLeft size={16} /> 서재로
      </button>

      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-14 h-20 rounded-md shrink-0 shadow-sm"
          style={{ backgroundColor: book.coverColor }}
        />
        <div className="flex-1 min-w-0">
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-1.5 ${statusBadge[book.status]}`}>
            {book.status}
          </span>
          <h1 className="font-heading text-xl text-ink truncate">{book.title}</h1>
          <p className="text-sm text-ink-faint mt-0.5">{book.author}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setEditOpen(true)}
            aria-label="책 정보 수정"
            className="p-2 text-ink-faint hover:text-ink hover:bg-paper-dim rounded-lg"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={handleDelete}
            aria-label="책 삭제"
            className="p-2 text-ink-faint hover:text-accent-warm hover:bg-paper-dim rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <Button onClick={() => setEntryOpen(true)} icon={<Plus size={16} />} className="mb-6">
        독서 기록 추가
      </Button>

      {!entries || entries.length === 0 ? (
        <EmptyState title="아직 기록이 없어요" description="오늘 읽은 부분을 짧게라도 남겨보세요." />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink-faint">
                  {formatKoreanDate(entry.date)}
                  {entry.pageFrom && ` · ${entry.pageFrom}${entry.pageTo ? `-${entry.pageTo}` : ''}쪽`}
                </span>
                <button
                  onClick={() => deleteReadingEntry(entry.id)}
                  aria-label="기록 삭제"
                  className="text-ink-faint hover:text-accent-warm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {entry.quote && (
                <blockquote className="font-heading text-ink border-l-2 border-accent-sage-soft pl-3 mb-2 leading-relaxed">
                  “{entry.quote}”
                </blockquote>
              )}
              {entry.quoteReason && (
                <p className="text-sm text-ink-soft mb-1.5">
                  <span className="text-ink-faint">왜 마음에 남았나 — </span>
                  {entry.quoteReason}
                </p>
              )}
              {entry.personalQuestion && (
                <p className="text-sm text-ink-soft mb-1.5">
                  <span className="text-ink-faint">나에게 던지는 질문 — </span>
                  {entry.personalQuestion}
                </p>
              )}
              {entry.thought && <p className="text-sm text-ink-soft">{entry.thought}</p>}
            </Card>
          ))}
        </div>
      )}

      <BookForm open={editOpen} onClose={() => setEditOpen(false)} editing={book} />
      <ReadingEntryForm open={entryOpen} onClose={() => setEntryOpen(false)} defaultBookId={book.id} />
    </div>
  )
}
