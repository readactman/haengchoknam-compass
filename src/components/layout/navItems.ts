import {
  Home,
  BookOpen,
  NotebookPen,
  CheckCircle2,
  PenLine,
  Compass,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import type { ViewId } from '../../nav/NavContext'

export interface NavItem {
  id: ViewId
  label: string
  icon: LucideIcon
}

export const primaryNavItems: NavItem[] = [
  { id: 'today', label: '오늘', icon: Home },
  { id: 'books', label: '독서', icon: BookOpen },
  { id: 'reflections', label: '성찰', icon: NotebookPen },
  { id: 'actions', label: '행동', icon: CheckCircle2 },
]

export const secondaryNavItems: NavItem[] = [
  { id: 'writing', label: '글쓰기', icon: PenLine },
  { id: 'principles', label: '나의 원칙', icon: Compass },
  { id: 'review', label: '주간 회고', icon: BarChart3 },
  { id: 'settings', label: '설정', icon: Settings },
]

export const allNavItems: NavItem[] = [...primaryNavItems, ...secondaryNavItems]
