type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral'

interface StatusBadgeProps {
  variant: BadgeVariant
  label: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
  neutral: 'bg-white/10 text-slate-400 border border-white/10',
}

export default function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {label}
    </span>
  )
}
