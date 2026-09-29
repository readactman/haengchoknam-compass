import { useEffect, useState } from 'react'
import { supabase } from '../db/supabaseClient'
import { fromRow } from './mappers'
import type {
  ActionItem,
  ActivityLog,
  Book,
  InvestmentDecision,
  Principle,
  ReadingEntry,
  Reflection,
  Writing,
} from '../types'

/** 특정 테이블 전체를 불러오고, 실시간 변경(insert/update/delete)이 오면 다시 불러옵니다. */
function useSupabaseTable<T>(table: string): T[] {
  const [rows, setRows] = useState<T[]>([])

  useEffect(() => {
    let active = true

    const fetchAll = async () => {
      const { data, error } = await supabase.from(table).select('*')
      if (!active) return
      if (error) {
        console.error(`[${table}] 불러오기 실패`, error)
        return
      }
      setRows((data ?? []).map((row) => fromRow<T>(row as Record<string, unknown>)))
    }

    fetchAll()

    // 채널 이름에 매 effect 실행마다 고유한 값을 섞어줍니다. React(특히 StrictMode)가
    // 같은 컴포넌트를 빠르게 mount/cleanup/remount할 때, 직전 채널의 removeChannel이
    // 비동기로 끝나기 전에 동일한 이름으로 채널을 재사용하면 "already subscribed" 오류가
    // 나기 때문에, 이름 충돌 자체를 없애는 방식으로 방지합니다.
    const channelName = `${table}-${Math.random().toString(36).slice(2)}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        fetchAll()
      })
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [table])

  return rows
}

export function useBooks(): Book[] {
  const rows = useSupabaseTable<Book>('books')
  return [...rows].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export function useBook(id: string | undefined): Book | undefined {
  const books = useSupabaseTable<Book>('books')
  return id ? books.find((b) => b.id === id) : undefined
}

export function useReadingEntries(bookId?: string): ReadingEntry[] {
  const rows = useSupabaseTable<ReadingEntry>('reading_entries')
  const filtered = bookId ? rows.filter((r) => r.bookId === bookId) : rows
  return [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function useReflections(): Reflection[] {
  const rows = useSupabaseTable<Reflection>('reflections')
  return [...rows].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function useActions(): ActionItem[] {
  const rows = useSupabaseTable<ActionItem>('actions')
  return [...rows].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function useWritings(): Writing[] {
  const rows = useSupabaseTable<Writing>('writings')
  return [...rows].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export function usePrinciples(): Principle[] {
  const rows = useSupabaseTable<Principle>('principles')
  return [...rows].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function useActivityLogs(): ActivityLog[] {
  return useSupabaseTable<ActivityLog>('activity_logs')
}

export function useInvestmentDecisions(): InvestmentDecision[] {
  const rows = useSupabaseTable<InvestmentDecision>('investment_decisions')
  return [...rows].sort((a, b) => (a.date < b.date ? 1 : -1))
}
