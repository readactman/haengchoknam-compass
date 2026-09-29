// 첫 실행 시 넣어주는 샘플 데이터 — 앱의 작동 방식을 보여주기 위한 용도입니다.
import { supabase } from '../db/supabaseClient'
import { toRow } from './mappers'
import { createId } from '../lib/id'
import { lastNDays } from '../lib/date'
import type {
  Book,
  ReadingEntry,
  Reflection,
  ActionItem,
  Writing,
  Principle,
  ActivityLog,
} from '../types'

const SEED_FLAG_KEY = 'seeded'

// React StrictMode(개발 모드)는 effect를 두 번 실행하므로, 동시 호출이 겹쳐도
// 시딩이 한 번만 일어나도록 진행 중인 Promise를 재사용합니다.
let seedingPromise: Promise<void> | null = null

export function seedIfEmpty(): Promise<void> {
  if (!seedingPromise) {
    seedingPromise = seedIfEmptyInternal()
  }
  return seedingPromise
}

async function seedIfEmptyInternal(): Promise<void> {
  const { data: flag } = await supabase.from('meta').select('value').eq('key', SEED_FLAG_KEY).maybeSingle()
  if (flag) return
  const { count } = await supabase.from('books').select('id', { count: 'exact', head: true })
  if ((count ?? 0) > 0) {
    await supabase.from('meta').insert({ key: SEED_FLAG_KEY, value: 'true' })
    return
  }
  await seedSampleData()
  await supabase.from('meta').insert({ key: SEED_FLAG_KEY, value: 'true' })
}

async function insertAll(table: string, rows: object[]): Promise<void> {
  if (rows.length === 0) return
  const { error } = await supabase.from(table).insert(rows.map(toRow))
  if (error) throw new Error(`[${table}] 샘플 데이터 추가 실패: ${error.message}`)
}

export async function seedSampleData(): Promise<void> {
  const d = lastNDays(14) // 최근 14일 범위에서 샘플 날짜를 고른다
  const day = (offsetFromEnd: number) => d[d.length - 1 - offsetFromEnd]
  const now = (dateISO: string) => `${dateISO}T09:00:00.000Z`

  const books: Book[] = [
    {
      id: createId(),
      title: '스토너',
      author: '존 윌리엄스',
      status: '완독',
      totalPages: 385,
      startDate: day(13),
      finishDate: day(9),
      coverColor: '#7c8a6e',
      createdAt: now(day(13)),
      updatedAt: now(day(9)),
    },
    {
      id: createId(),
      title: '오디세이아',
      author: '호메로스',
      status: '읽는 중',
      totalPages: 560,
      startDate: day(8),
      coverColor: '#8a6e5b',
      createdAt: now(day(8)),
      updatedAt: now(day(2)),
    },
    {
      id: createId(),
      title: '월든',
      author: '헨리 데이비드 소로',
      status: '보류',
      totalPages: 420,
      startDate: day(6),
      coverColor: '#5b7a8a',
      createdAt: now(day(6)),
      updatedAt: now(day(6)),
    },
  ]
  await insertAll('books', books)

  const [stoner, odyssey] = books
  const readingEntries: ReadingEntry[] = [
    {
      id: createId(),
      bookId: stoner.id,
      date: day(13),
      pageFrom: 1,
      pageTo: 40,
      quote: '그는 자신이 무엇을 사랑하는지 알았고, 그것으로 충분하다고 생각했다.',
      quoteReason: '거창한 성공이 아니라 스스로 납득할 수 있는 삶의 기준이 인상 깊었습니다.',
      personalQuestion: '나는 무엇을 사랑한다고 말할 수 있을까? 그것으로 충분하다고 느끼는가?',
      thought: '조용한 삶도 하나의 완성된 서사가 될 수 있다는 생각이 들었다.',
      createdAt: now(day(13)),
    },
    {
      id: createId(),
      bookId: stoner.id,
      date: day(11),
      pageFrom: 41,
      pageTo: 120,
      thought: '주변의 평가와 무관하게 자신의 일에 몰두하는 태도가 계속 마음에 남는다.',
      createdAt: now(day(11)),
    },
    {
      id: createId(),
      bookId: odyssey.id,
      date: day(8),
      pageFrom: 1,
      pageTo: 55,
      quote: '페넬로페이아는 20년을 기다렸다. 확신이 없이는 불가능한 일이었다.',
      quoteReason: '기다림을 버틸 수 있게 한 것이 사랑만이 아니라 일종의 믿음이었다는 점이 인상적이었습니다.',
      personalQuestion: '그렇다면 나는 무엇을 믿고, 무엇을 기다리며 살아가는가?',
      createdAt: now(day(8)),
    },
    {
      id: createId(),
      bookId: odyssey.id,
      date: day(2),
      pageFrom: 56,
      pageTo: 110,
      thought: '오디세우스의 귀환은 단순한 이동이 아니라 자기 자신으로 돌아오는 과정처럼 읽힌다.',
      createdAt: now(day(2)),
    },
  ]
  await insertAll('reading_entries', readingEntries)

  const reflections: Reflection[] = [
    {
      id: createId(),
      title: '무엇을 믿고 기다리는가',
      body: '오디세이아를 읽으며 페넬로페이아의 기다림을 생각했다. 나는 결과가 불확실한 일 앞에서 얼마나 오래 믿음을 유지할 수 있을까. 지금 진행 중인 일도 확신 없이는 지속하기 어렵다는 걸 느낀다.',
      date: day(8),
      category: '독서',
      tags: ['믿음', '기다림'],
      sourceReadingEntryId: readingEntries[2].id,
      createdAt: now(day(8)),
      updatedAt: now(day(8)),
    },
    {
      id: createId(),
      title: '회의에서 하지 못한 말',
      body: '오늘 회의에서 의견이 있었지만 끝내 말하지 못했다. 확신이 부족해서였는지, 갈등이 두려워서였는지 스스로도 명확하지 않다.',
      date: day(5),
      category: '일',
      tags: ['소통'],
      createdAt: now(day(5)),
      updatedAt: now(day(5)),
    },
    {
      id: createId(),
      title: '걷기 시작한 이유',
      body: '몸이 무거우면 생각도 무거워진다는 걸 최근에 다시 느꼈다. 거창한 운동 계획보다 매일 10분이라도 걷는 게 더 오래갈 것 같다.',
      date: day(3),
      category: '운동',
      tags: ['건강', '루틴'],
      createdAt: now(day(3)),
      updatedAt: now(day(3)),
    },
    {
      id: createId(),
      title: '스토너를 덮고 나서',
      body: '화려하지 않은 삶이었지만 끝까지 자기 자신으로 남았다는 인상이 강하게 남았다. 나는 어떤 기준으로 내 삶을 평가하고 싶은가.',
      date: day(9),
      category: '독서',
      tags: ['삶의 기준'],
      sourceReadingEntryId: readingEntries[1].id,
      createdAt: now(day(9)),
      updatedAt: now(day(9)),
    },
  ]

  const actions: ActionItem[] = [
    {
      id: createId(),
      title: '오늘 회의 전에 하고 싶은 말 한 문장으로 정리해보기',
      createdAt: now(day(5)),
      done: true,
      completedAt: now(day(4)),
      reflectionId: reflections[1].id,
      satisfaction: 4,
      activityType: 'action',
    },
    {
      id: createId(),
      title: '저녁 식사 후 10분 걷기',
      createdAt: now(day(3)),
      done: true,
      completedAt: now(day(3)),
      reflectionId: reflections[2].id,
      satisfaction: 5,
      activityType: 'exercise',
    },
    {
      id: createId(),
      title: '나에게 "무엇을 믿고 기다리는가" 질문을 하루 한 번 떠올리기',
      createdAt: now(day(8)),
      done: false,
      reflectionId: reflections[0].id,
      activityType: 'reflection',
    },
  ]
  reflections[1].actionId = actions[0].id
  reflections[2].actionId = actions[1].id
  reflections[0].actionId = actions[2].id

  // actions.reflection_id <-> reflections.action_id는 서로를 참조하는 순환 외래키이므로,
  // 1) reflection_id 없이 actions를 먼저 넣고 2) action_id가 채워진 reflections를 넣은 뒤
  // 3) actions의 reflection_id를 마저 채웁니다.
  const actionsWithoutReflection = actions.map((action) => ({ ...action, reflectionId: undefined }))
  await insertAll('actions', actionsWithoutReflection)
  await insertAll('reflections', reflections)
  for (const action of actions) {
    const { error } = await supabase
      .from('actions')
      .update(toRow({ reflectionId: action.reflectionId }))
      .eq('id', action.id)
    if (error) throw new Error(`[actions] reflection_id 연결 실패: ${error.message}`)
  }

  const writings: Writing[] = [
    {
      id: createId(),
      title: '기다림에는 근거가 필요하다',
      status: '초안',
      question: '당신은 지금 무엇을 근거로 무언가를 기다리고 있습니까?',
      sceneOrExperience: '오디세이아 속 페넬로페이아의 20년, 그리고 나의 최근 프로젝트.',
      myThought: '기다림은 수동적인 것이 아니라 믿음을 유지하는 능동적인 행위다.',
      counterpoint: '무작정 기다리는 것과 근거 있는 기다림은 다르다. 그 경계는 어디인가?',
      message: '기다림을 버티게 하는 것은 결과에 대한 확신이 아니라 과정에 대한 믿음일 수 있다.',
      actionSuggestion: '지금 기다리고 있는 일의 근거를 한 문장으로 적어보기.',
      linkedReflectionIds: [reflections[0].id],
      linkedReadingEntryIds: [readingEntries[2].id],
      createdAt: now(day(7)),
      updatedAt: now(day(2)),
    },
  ]
  await insertAll('writings', writings)

  const principles: Principle[] = [
    {
      id: createId(),
      text: '완벽함보다 복귀다.',
      description: '멈췄다는 사실보다 다시 돌아왔다는 사실이 중요하다.',
      linkedReadingEntryIds: [],
      linkedReflectionIds: [reflections[2].id],
      linkedWritingIds: [],
      createdAt: now(day(3)),
    },
    {
      id: createId(),
      text: '확신은 생각에서 만들어진다.',
      description: '기다림과 선택을 버티게 하는 것은 감정이 아니라 정리된 생각이다.',
      linkedReadingEntryIds: [readingEntries[2].id],
      linkedReflectionIds: [reflections[0].id],
      linkedWritingIds: [writings[0].id],
      createdAt: now(day(8)),
    },
    {
      id: createId(),
      text: '다른 사람이 보지 않을 때의 행동이 나를 만든다.',
      linkedReadingEntryIds: [readingEntries[0].id],
      linkedReflectionIds: [reflections[3].id],
      linkedWritingIds: [],
      createdAt: now(day(9)),
    },
  ]
  await insertAll('principles', principles)

  const activityLogs: ActivityLog[] = [
    { id: createId(), type: 'reading', date: day(13), refId: readingEntries[0].id, createdAt: now(day(13)) },
    { id: createId(), type: 'reflection', date: day(9), refId: reflections[3].id, createdAt: now(day(9)) },
    { id: createId(), type: 'reading', date: day(9), refId: readingEntries[1].id, createdAt: now(day(9)) },
    { id: createId(), type: 'reading', date: day(8), refId: readingEntries[2].id, createdAt: now(day(8)) },
    { id: createId(), type: 'reflection', date: day(8), refId: reflections[0].id, createdAt: now(day(8)) },
    { id: createId(), type: 'writing', date: day(7), refId: writings[0].id, createdAt: now(day(7)) },
    { id: createId(), type: 'reflection', date: day(5), refId: reflections[1].id, createdAt: now(day(5)) },
    { id: createId(), type: 'action', date: day(4), refId: actions[0].id, createdAt: now(day(4)) },
    { id: createId(), type: 'reflection', date: day(3), refId: reflections[2].id, createdAt: now(day(3)) },
    { id: createId(), type: 'action', date: day(3), refId: actions[1].id, createdAt: now(day(3)) },
    { id: createId(), type: 'exercise', date: day(3), refId: actions[1].id, createdAt: now(day(3)) },
    { id: createId(), type: 'reading', date: day(2), refId: readingEntries[3].id, createdAt: now(day(2)) },
    { id: createId(), type: 'writing', date: day(2), refId: writings[0].id, createdAt: now(day(2)) },
  ]
  await insertAll('activity_logs', activityLogs)
}
