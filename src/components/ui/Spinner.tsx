import { Loader2 } from 'lucide-react'

export default function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-indigo-400/60" />
    </div>
  )
}
