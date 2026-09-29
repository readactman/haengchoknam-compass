import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 sm:px-8 pt-6 sm:pt-8 pb-5">
      <div>
        <h1 className="font-heading text-2xl text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink-faint mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
