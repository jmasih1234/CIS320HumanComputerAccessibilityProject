import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  message: string
}

export default function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4 text-slate-600">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}
