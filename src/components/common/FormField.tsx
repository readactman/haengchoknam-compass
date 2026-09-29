import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

interface FieldWrapperProps {
  label: string
  hint?: string
  children: ReactNode
  required?: boolean
}

export function FieldWrapper({ label, hint, children, required }: FieldWrapperProps) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-ink-soft mb-1.5">
        {label}
        {required && <span className="text-accent-warm"> *</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-ink-faint mt-1">{hint}</span>}
    </label>
  )
}

const inputClass =
  'w-full rounded-xl border border-border bg-paper-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-soft/40 focus:border-brand-soft'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} resize-none ${props.className ?? ''}`} />
}
