// camelCase(TS 모델) <-> snake_case(Postgres 컬럼) 변환 유틸리티
function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())
}

/** JS 객체(camelCase) -> DB row(snake_case). undefined는 명시적으로 null로 저장해
 *  "값을 비운다"는 의도(예: finishDate: undefined)가 실제로 반영되도록 합니다. */
export function toRow(obj: object): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    row[camelToSnake(k)] = v === undefined ? null : v
  }
  return row
}

/** DB row(snake_case) -> JS 객체(camelCase). null은 undefined로 되돌립니다. */
export function fromRow<T>(row: Record<string, unknown>): T {
  const obj: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) {
    obj[snakeToCamel(k)] = v === null ? undefined : v
  }
  return obj as T
}
