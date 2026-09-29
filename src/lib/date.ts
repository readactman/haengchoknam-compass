import { format, parseISO, differenceInCalendarDays, subDays } from 'date-fns'
import type { ISODate, ISODateTime } from '../types'

export function todayISODate(): ISODate {
  return format(new Date(), 'yyyy-MM-dd')
}

export function nowISODateTime(): ISODateTime {
  return new Date().toISOString()
}

export function toISODate(date: Date): ISODate {
  return format(date, 'yyyy-MM-dd')
}

export function daysBetween(laterISO: ISODate, earlierISO: ISODate): number {
  return differenceInCalendarDays(parseISO(laterISO), parseISO(earlierISO))
}

export function lastNDays(n: number, endISO: ISODate = todayISODate()): ISODate[] {
  const end = parseISO(endISO)
  const dates: ISODate[] = []
  for (let i = n - 1; i >= 0; i -= 1) {
    dates.push(toISODate(subDays(end, i)))
  }
  return dates
}

export function formatKoreanDate(iso: ISODate): string {
  return format(parseISO(iso), 'yyyy년 M월 d일')
}

export function formatKoreanDateShort(iso: ISODate): string {
  return format(parseISO(iso), 'M월 d일')
}
