import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/30 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-paper w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="font-heading text-lg text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-full text-ink-faint hover:bg-paper-dim hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border shrink-0">{footer}</div>}
      </div>
    </div>
  )
}
