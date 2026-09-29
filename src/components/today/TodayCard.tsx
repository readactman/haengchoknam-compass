import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '../common/Card'

interface TodayCardProps {
  icon: ReactNode
  title: string
  accentClass: string
  onAdd: () => void
  addLabel?: string
  children?: ReactNode
}

export function TodayCard({ icon, title, accentClass, onAdd, addLabel, children }: TodayCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center ${accentClass}`}>
            {icon}
          </div>
          <h3 className="font-heading text-ink">{title}</h3>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs font-medium text-brand-soft hover:text-brand px-2.5 py-1.5 rounded-lg hover:bg-paper-dim"
        >
          <Plus size={14} />
          {addLabel ?? '기록'}
        </button>
      </div>
      {children}
    </Card>
  )
}
