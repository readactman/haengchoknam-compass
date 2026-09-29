import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {icon && <div className="text-ink-faint mb-3">{icon}</div>}
      <p className="text-ink-soft font-medium">{title}</p>
      {description && <p className="text-sm text-ink-faint mt-1.5 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
