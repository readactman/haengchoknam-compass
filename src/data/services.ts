// 데이터 서비스 레이어 — UI는 이 함수들만 호출합니다.
// Supabase(Postgres)를 백엔드로 사용합니다. 이 파일(및 db/supabaseClient.ts)만 교체하면
// 다른 백엔드로도 옮길 수 있도록 함수 시그니처를 유지합니다.
import { supabase } from '../db/supabaseClient'
import { fromRow, toRow } from './mappers'
import { createId } from '../lib/id'
import { nowISODateTime, todayISODate } from '../lib/date'
import type {
  Book,
  ReadingEntry,
  Reflection,
  ActionItem,
  Writing,
  Principle,
  ActivityLog,
  ActivityType,
  InvestmentDecision,
} from '../types'

function assertOk(error: { message: string } | null): void {
  if (error) throw new Error(error.message)
}

async function logActivity(type: ActivityType, date: string, refId?: string): Promise<void> {
  const log: ActivityLog = { id: createId(), type, date, refId, createdAt: nowISODateTime() }
  const { error } = await supabase.from('activity_logs').insert(toRow(log))
  assertOk(error)
}

// ---------- Book ----------
export async function createBook(input: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
  const now = nowISODateTime()
  const book: Book = { ...input, id: createId(), createdAt: now, updatedAt: now }
  const { error } = await supabase.from('books').insert(toRow(book))
  assertOk(error)
  return book
}

export async function updateBook(id: string, patch: Partial<Book>): Promise<void> {
  const { error } = await supabase
    .from('books')
    .update(toRow({ ...patch, updatedAt: nowISODateTime() }))
    .eq('id', id)
  assertOk(error)
}

export async function deleteBook(id: string): Promise<void> {
  // reading_entries.book_id는 ON DELETE CASCADE로 함께 삭제됩니다.
  const { error } = await supabase.from('books').delete().eq('id', id)
  assertOk(error)
}

// ---------- ReadingEntry ----------
export async function createReadingEntry(
  input: Omit<ReadingEntry, 'id' | 'createdAt'>,
): Promise<ReadingEntry> {
  const entry: ReadingEntry = { ...input, id: createId(), createdAt: nowISODateTime() }
  const { error } = await supabase.from('reading_entries').insert(toRow(entry))
  assertOk(error)
  await logActivity('reading', entry.date, entry.id)
  return entry
}

export async function updateReadingEntry(id: string, patch: Partial<ReadingEntry>): Promise<void> {
  const { error } = await supabase.from('reading_entries').update(toRow(patch)).eq('id', id)
  assertOk(error)
}

export async function deleteReadingEntry(id: string): Promise<void> {
  const { error } = await supabase.from('reading_entries').delete().eq('id', id)
  assertOk(error)
}

// ---------- Reflection ----------
export async function createReflection(
  input: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Reflection> {
  const now = nowISODateTime()
  const reflection: Reflection = { ...input, id: createId(), createdAt: now, updatedAt: now }
  const { error } = await supabase.from('reflections').insert(toRow(reflection))
  assertOk(error)
  await logActivity('reflection', reflection.date, reflection.id)
  return reflection
}

export async function updateReflection(id: string, patch: Partial<Reflection>): Promise<void> {
  const { error } = await supabase
    .from('reflections')
    .update(toRow({ ...patch, updatedAt: nowISODateTime() }))
    .eq('id', id)
  assertOk(error)
}

export async function deleteReflection(id: string): Promise<void> {
  const { error } = await supabase.from('reflections').delete().eq('id', id)
  assertOk(error)
}

/** 성찰에서 "가장 작은 행동"을 입력하면 Action을 만들고 성찰에 연결합니다. */
export async function attachActionToReflection(
  reflectionId: string,
  actionTitle: string,
): Promise<ActionItem> {
  const action = await createAction({ title: actionTitle, reflectionId })
  const { error } = await supabase
    .from('reflections')
    .update(toRow({ actionId: action.id, updatedAt: nowISODateTime() }))
    .eq('id', reflectionId)
  assertOk(error)
  return action
}

// ---------- Action ----------
export async function createAction(
  input: Omit<ActionItem, 'id' | 'createdAt' | 'done'> & { done?: boolean },
): Promise<ActionItem> {
  const action: ActionItem = {
    done: false,
    ...input,
    id: createId(),
    createdAt: nowISODateTime(),
  }
  const { error } = await supabase.from('actions').insert(toRow(action))
  assertOk(error)
  return action
}

export async function completeAction(id: string, satisfaction?: 1 | 2 | 3 | 4 | 5): Promise<void> {
  const now = nowISODateTime()
  const { data, error } = await supabase
    .from('actions')
    .update(toRow({ done: true, completedAt: now, satisfaction }))
    .eq('id', id)
    .select()
    .single()
  assertOk(error)
  const action = fromRow<ActionItem>(data as Record<string, unknown>)
  await logActivity('action', todayISODate(), id)
  if (action.activityType === 'exercise') {
    await logActivity('exercise', todayISODate(), id)
  }
}

export async function reopenAction(id: string): Promise<void> {
  const { error } = await supabase
    .from('actions')
    .update(toRow({ done: false, completedAt: undefined, satisfaction: undefined }))
    .eq('id', id)
  assertOk(error)
}

export async function updateAction(id: string, patch: Partial<ActionItem>): Promise<void> {
  const { error } = await supabase.from('actions').update(toRow(patch)).eq('id', id)
  assertOk(error)
}

export async function deleteAction(id: string): Promise<void> {
  const { error } = await supabase.from('actions').delete().eq('id', id)
  assertOk(error)
}

// ---------- Writing ----------
export async function createWriting(
  input: Partial<Omit<Writing, 'id' | 'createdAt' | 'updatedAt'>> & { title: string },
): Promise<Writing> {
  const now = nowISODateTime()
  const writing: Writing = {
    status: '아이디어',
    linkedReflectionIds: [],
    linkedReadingEntryIds: [],
    ...input,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  }
  const { error } = await supabase.from('writings').insert(toRow(writing))
  assertOk(error)
  await logActivity('writing', todayISODate(), writing.id)
  return writing
}

export async function updateWriting(id: string, patch: Partial<Writing>): Promise<void> {
  const { error } = await supabase
    .from('writings')
    .update(toRow({ ...patch, updatedAt: nowISODateTime() }))
    .eq('id', id)
  assertOk(error)
  await logActivity('writing', todayISODate(), id)
}

export async function deleteWriting(id: string): Promise<void> {
  const { error } = await supabase.from('writings').delete().eq('id', id)
  assertOk(error)
}

// ---------- Principle ----------
export async function createPrinciple(
  input: Partial<Omit<Principle, 'id' | 'createdAt'>> & { text: string },
): Promise<Principle> {
  const principle: Principle = {
    linkedReadingEntryIds: [],
    linkedReflectionIds: [],
    linkedWritingIds: [],
    ...input,
    id: createId(),
    createdAt: nowISODateTime(),
  }
  const { error } = await supabase.from('principles').insert(toRow(principle))
  assertOk(error)
  return principle
}

export async function updatePrinciple(id: string, patch: Partial<Principle>): Promise<void> {
  const { error } = await supabase.from('principles').update(toRow(patch)).eq('id', id)
  assertOk(error)
}

export async function deletePrinciple(id: string): Promise<void> {
  const { error } = await supabase.from('principles').delete().eq('id', id)
  assertOk(error)
}

// ---------- InvestmentDecision (향후 확장용) ----------
export async function createInvestmentDecision(
  input: Omit<InvestmentDecision, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<InvestmentDecision> {
  const now = nowISODateTime()
  const decision: InvestmentDecision = { ...input, id: createId(), createdAt: now, updatedAt: now }
  const { error } = await supabase.from('investment_decisions').insert(toRow(decision))
  assertOk(error)
  return decision
}

export async function updateInvestmentDecision(
  id: string,
  patch: Partial<InvestmentDecision>,
): Promise<void> {
  const { error } = await supabase
    .from('investment_decisions')
    .update(toRow({ ...patch, updatedAt: nowISODateTime() }))
    .eq('id', id)
  assertOk(error)
}

export async function deleteInvestmentDecision(id: string): Promise<void> {
  const { error } = await supabase.from('investment_decisions').delete().eq('id', id)
  assertOk(error)
}

// ---------- 전체 초기화 ----------
const ALL_TABLES = [
  'reading_entries',
  'reflections',
  'actions',
  'writings',
  'principles',
  'activity_logs',
  'investment_decisions',
  'books',
  'meta',
] as const

export async function clearAllData(): Promise<void> {
  for (const table of ALL_TABLES) {
    // uuid 기본키가 아닌 meta는 key로 필터링
    const column = table === 'meta' ? 'key' : 'id'
    const { error } = await supabase.from(table).delete().not(column, 'is', null)
    assertOk(error)
  }
}
