import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !anonKey) {
  throw new Error(
    'Supabase 환경변수가 설정되지 않았습니다. .env.local에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정해주세요.',
  )
}

export const supabase = createClient(url, anonKey)
