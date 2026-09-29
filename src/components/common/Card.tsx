import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-paper-card border border-border rounded-2xl shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
