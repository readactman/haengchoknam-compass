// 차분한 톤의 손그림 느낌 라인 일러스트 모음.
// 사진/외부 이미지 대신 SVG로 직접 그려 오프라인(PWA)에서도 항상 표시되고,
// 팔레트(sage/sky/warm/brand)에 맞춰 currentColor로 색을 상속받습니다.
import type { SVGProps } from 'react'

type IllustrationProps = SVGProps<SVGSVGElement>

const base = {
  fill: 'none',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** 독서 — 펼쳐진 책 */
export function ReadingIllustration(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" {...base} stroke="currentColor" {...props}>
      <path d="M32 15c-4-4-11-5-18-4v33c7-1 14 0 18 4" />
      <path d="M32 15c4-4 11-5 18-4v33c-7-1-14 0-18 4" />
      <path d="M32 15v33" />
      <path d="M18 20c3-.6 6-.6 9 .3" opacity="0.6" />
      <path d="M18 28c3-.6 6-.6 9 .3" opacity="0.6" />
      <path d="M37 20.3c3-.9 6-.9 9-.3" opacity="0.6" />
      <path d="M37 28.3c3-.9 6-.9 9-.3" opacity="0.6" />
    </svg>
  )
}

/** 성찰 — 물결처럼 퍼지는 생각 */
export function ReflectionIllustration(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" {...base} stroke="currentColor" {...props}>
      <circle cx="24" cy="24" r="9" />
      <circle cx="24" cy="24" r="1.4" fill="currentColor" stroke="none" />
      <path d="M38 20c4 1.5 7 5 7 9s-3 7.5-7 9" opacity="0.55" />
      <path d="M45 16c6 2.3 10 8 10 13.5S51 39.7 45 42" opacity="0.3" />
      <path d="M17 40c3 4 9 7 15 7" opacity="0.7" />
    </svg>
  )
}

/** 글쓰기 — 만년필과 흐르는 선 */
export function WritingIllustration(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" {...base} stroke="currentColor" {...props}>
      <path d="M42 12 20 34l-3 9 9-3 22-22a4.2 4.2 0 0 0-6-6Z" />
      <path d="M35 19l6 6" />
      <path d="M12 46c8-3 14-3 20 0s14 3 20 0" opacity="0.55" />
    </svg>
  )
}

/** 행동 — 작은 발걸음 (체크 + 움직임을 은유하는 궤적) */
export function ActionIllustration(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" {...base} stroke="currentColor" {...props}>
      <circle cx="32" cy="32" r="20" />
      <path d="M23 33l6 6 12-14" strokeWidth={2.2} />
      <path d="M10 20c2-3 4-5 6-6" opacity="0.5" />
      <path d="M50 46c2-2 4-4 5-7" opacity="0.5" />
    </svg>
  )
}

/** 나침반 — 원칙 / 히어로용 */
export function CompassIllustration(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" {...base} stroke="currentColor" {...props}>
      <circle cx="32" cy="32" r="22" />
      <path d="M32 6v6M32 52v6M6 32h6M52 32h6" opacity="0.5" />
      <path d="M40 24l-6 12-12 6 6-12 12-6Z" />
      <circle cx="32" cy="32" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** 주간 회고 — 다시 떠오르는 해 (복귀를 은유) */
export function RecoveryIllustration(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" {...base} stroke="currentColor" {...props}>
      <path d="M14 40a18 18 0 0 1 36 0" />
      <path d="M8 40h48" />
      <path d="M32 14v6M18 20l4 4M46 20l-4 4" opacity="0.6" />
    </svg>
  )
}
