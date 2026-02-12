import { useNavigate } from 'react-router-dom'
import { Home } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="page-content flex flex-col items-center justify-center px-4">
      <div className="bg-mesh" />
      <div className="relative z-10 text-center">
        <h1 className="text-8xl font-bold text-white/[0.06] mb-2">404</h1>
        <p className="text-slate-500 mb-8">This page doesn't exist</p>
        <Button onClick={() => navigate('/')}>
          <span className="flex items-center gap-2">
            <Home size={16} />
            Back to Home
          </span>
        </Button>
      </div>
    </div>
  )
}
