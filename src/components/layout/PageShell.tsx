import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface PageShellProps {
  title: string
  children: ReactNode
  action?: ReactNode
}

export default function PageShell({ title, children, action }: PageShellProps) {
  const navigate = useNavigate()

  return (
    <div className="page-content">
      <div className="bg-mesh" />
      <div className="relative z-10">
        <header className="sticky top-0 z-40 glass">
          <div className="px-5 pt-6 pb-5">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} className="text-slate-400" />
              </button>
              {action && <div className="ml-auto">{action}</div>}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {title}
            </h1>
          </div>
        </header>
        <main className="px-5 py-6">{children}</main>
      </div>
    </div>
  )
}
