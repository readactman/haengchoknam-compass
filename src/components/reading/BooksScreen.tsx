import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../common/PageHeader'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { EmptyState } from '../common/EmptyState'
import { ReadingIllustration } from '../illustrations'
import { BookForm } from './BookForm'
import { BookDetail } from './BookDetail'
import { useBooks } from '../../data/hooks'
import type { Book, BookStatus } from '../../types'

const statusBadge: Record<BookStatus, string> = {
  '읽는 중': 'bg-accent-sky-soft text-accent-sky',
  완독: 'bg-accent-sage-soft text-accent-sage',
  보류: 'bg-paper-dim text-ink-faint',
}

const statusOrder: BookStatus[] = ['읽는 중', '완독', '보류']

function BookRow({ book, onOpen }: { book: Book; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="w-full text-left">
      <Card className="p-4 flex items-center gap-3 hover:border-brand-soft transition-colors">
        <div className="w-10 h-14 rounded shrink-0" style={{ backgroundColor: book.coverColor }} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink truncate">{book.title}</p>
          <p className="text-sm text-ink-faint truncate">{book.author}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusBadge[book.status]}`}>
          {book.status}
        </span>
      </Card>
    </button>
  )
}

export function BooksScreen() {
  const books = useBooks()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (selectedId) {
    return <BookDetail bookId={selectedId} onBack={() => setSelectedId(null)} />
  }

  return (
    <div>
      <PageHeader
        title="서재"
        subtitle="지금 읽고 있는, 그리고 읽어온 책들"
        action={
          <Button size="sm" onClick={() => setFormOpen(true)} icon={<Plus size={15} />}>
            책 추가
          </Button>
        }
      />
      <div className="px-5 sm:px-8">
        {!books || books.length === 0 ? (
          <EmptyState
            icon={<ReadingIllustration className="w-10 h-10" />}
            title="아직 등록한 책이 없어요"
            description="지금 읽고 있는 책을 추가하면 독서 기록을 남길 수 있어요."
            action={<Button onClick={() => setFormOpen(true)}>책 추가하기</Button>}
          />
        ) : (
          <div className="space-y-6">
            {statusOrder.map((status) => {
              const group = books.filter((b) => b.status === status)
              if (group.length === 0) return null
              return (
                <div key={status}>
                  <h2 className="text-xs font-medium text-ink-faint mb-2 px-1">
                    {status} · {group.length}
                  </h2>
                  <div className="space-y-2">
                    {group.map((book) => (
                      <BookRow key={book.id} book={book} onOpen={() => setSelectedId(book.id)} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <BookForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
