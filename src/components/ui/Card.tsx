import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 ${className}`}
    >
      {children}
    </div>
  )
}
