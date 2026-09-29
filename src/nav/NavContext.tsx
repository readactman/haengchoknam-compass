import { createContext, useContext, useState, type ReactNode } from 'react'

export type ViewId =
  | 'today'
  | 'books'
  | 'reflections'
  | 'actions'
  | 'writing'
  | 'principles'
  | 'review'
  | 'settings'

interface NavState {
  view: ViewId
  selectedBookId: string | null
  goTo: (view: ViewId) => void
  openBook: (bookId: string) => void
}

const NavCtx = createContext<NavState | null>(null)

export function NavProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewId>('today')
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)

  const goTo = (next: ViewId) => {
    setView(next)
    if (next !== 'books') setSelectedBookId(null)
  }

  const openBook = (bookId: string) => {
    setSelectedBookId(bookId)
    setView('books')
  }

  return (
    <NavCtx.Provider value={{ view, selectedBookId, goTo, openBook }}>
      {children}
    </NavCtx.Provider>
  )
}

export function useNav(): NavState {
  const ctx = useContext(NavCtx)
  if (!ctx) throw new Error('useNav는 NavProvider 내부에서만 사용할 수 있습니다.')
  return ctx
}
