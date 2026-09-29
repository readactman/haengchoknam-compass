import { supabase } from '../db/supabaseClient'
import { fromRow, toRow } from './mappers'
import type { ActionItem, Reflection } from '../types'

const CURRENT_EXPORT_VERSION = 1

export interface CompassExport {
  version: number
  exportedAt: string
  data: {
    books: unknown[]
    readingEntries: unknown[]
    reflections: unknown[]
    actions: unknown[]
    writings: unknown[]
    principles: unknown[]
    activityLogs: unknown[]
    investmentDecisions: unknown[]
  }
}

async function fetchAll<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*')
  if (error) throw new Error(`[${table}] 내보내기 실패: ${error.message}`)
  return (data ?? []).map((row) => fromRow<T>(row as Record<string, unknown>))
}

export async function exportAllData(): Promise<CompassExport> {
  const [
    books,
    readingEntries,
    reflections,
    actions,
    writings,
    principles,
    activityLogs,
    investmentDecisions,
  ] = await Promise.all([
    fetchAll('books'),
    fetchAll('reading_entries'),
    fetchAll('reflections'),
    fetchAll('actions'),
    fetchAll('writings'),
    fetchAll('principles'),
    fetchAll('activity_logs'),
    fetchAll('investment_decisions'),
  ])

  return {
    version: CURRENT_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      books,
      readingEntries,
      reflections,
      actions,
      writings,
      principles,
      activityLogs,
      investmentDecisions,
    },
  }
}

export function downloadExport(data: CompassExport): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const dateStr = data.exportedAt.slice(0, 10)
  a.href = url
  a.download = `compass-backup-${dateStr}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export class ImportValidationError extends Error {}

function isCompassExport(value: unknown): value is CompassExport {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (typeof v.version !== 'number') return false
  if (typeof v.data !== 'object' || v.data === null) return false
  const requiredKeys = [
    'books',
    'readingEntries',
    'reflections',
    'actions',
    'writings',
    'principles',
    'activityLogs',
    'investmentDecisions',
  ]
  const d = v.data as Record<string, unknown>
  return requiredKeys.every((key) => Array.isArray(d[key]))
}

const CLEAR_TABLES = [
  'reading_entries',
  'reflections',
  'actions',
  'writings',
  'principles',
  'activity_logs',
  'investment_decisions',
  'books',
] as const

async function insertAll(table: string, rows: object[]): Promise<void> {
  if (rows.length === 0) return
  const { error } = await supabase.from(table).insert(rows.map(toRow))
  if (error) throw new ImportValidationError(`[${table}] 가져오기 실패: ${error.message}`)
}

/** JSON 파일을 읽어 데이터를 가져옵니다. 기존 데이터는 모두 대체됩니다. */
export async function importData(file: File): Promise<void> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new ImportValidationError('파일이 올바른 JSON 형식이 아닙니다.')
  }
  if (!isCompassExport(parsed)) {
    throw new ImportValidationError('행촉남 Compass 백업 파일 형식이 아닙니다.')
  }

  const { data } = parsed

  for (const table of CLEAR_TABLES) {
    const { error } = await supabase.from(table).delete().not('id', 'is', null)
    if (error) throw new ImportValidationError(`[${table}] 초기화 실패: ${error.message}`)
  }

  await insertAll('books', data.books as object[])
  await insertAll('reading_entries', data.readingEntries as object[])

  // reflections.action_id <-> actions.reflection_id 순환 외래키를 안전하게 채우기 위해
  // actions를 reflection_id 없이 먼저 넣고, reflections를 넣은 뒤 reflection_id를 채웁니다.
  const actions = data.actions as ActionItem[]
  const actionsWithoutReflection = actions.map((a) => ({ ...a, reflectionId: undefined }))
  await insertAll('actions', actionsWithoutReflection)
  await insertAll('reflections', data.reflections as Reflection[])
  for (const action of actions) {
    if (!action.reflectionId) continue
    const { error } = await supabase
      .from('actions')
      .update(toRow({ reflectionId: action.reflectionId }))
      .eq('id', action.id)
    if (error) throw new ImportValidationError(`[actions] reflection_id 연결 실패: ${error.message}`)
  }

  await insertAll('writings', data.writings as object[])
  await insertAll('principles', data.principles as object[])
  await insertAll('activity_logs', data.activityLogs as object[])
  await insertAll('investment_decisions', data.investmentDecisions as object[])
}
