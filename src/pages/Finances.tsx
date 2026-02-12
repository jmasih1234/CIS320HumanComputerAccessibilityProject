import { useEffect, useState } from 'react'
import { DollarSign, Plus, Trash2 } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { useHouse } from '../context/HouseContext'
import type { Payment, Contribution } from '../types'
import * as financeService from '../services/financeService'

const inputClasses =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-colors'

export default function Finances() {
  const { roommates } = useHouse()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [contributeTarget, setContributeTarget] = useState<string | null>(null)

  const [reason, setReason] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal')
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({})

  const [contributeName, setContributeName] = useState('')
  const [contributeAmount, setContributeAmount] = useState('')

  const load = async () => {
    setPayments(await financeService.getPayments())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setReason('')
    setAmount('')
    setNotes('')
    setSplitType('equal')
    setCustomSplits({})
  }

  const handleCreate = async () => {
    if (!reason.trim() || !amount) return
    const total = parseFloat(amount)
    if (isNaN(total) || total <= 0) return

    let contributions: Contribution[]
    if (splitType === 'equal') {
      const perPerson = total / roommates.length
      contributions = roommates.map((r) => ({
        roommateId: r.id,
        responsible: Math.round(perPerson * 100) / 100,
        paid: 0,
      }))
    } else {
      contributions = roommates.map((r) => ({
        roommateId: r.id,
        responsible: parseFloat(customSplits[r.id] || '0') || 0,
        paid: 0,
      }))
    }

    await financeService.createPayment({
      reason: reason.trim(),
      totalAmount: total,
      notes: notes.trim(),
      contributions,
    })
    resetForm()
    setCreateOpen(false)
    load()
  }

  const handleContribute = async () => {
    if (!contributeTarget || !contributeName || !contributeAmount) return
    const amt = parseFloat(contributeAmount)
    if (isNaN(amt) || amt <= 0) return
    await financeService.contribute(contributeTarget, contributeName, amt)
    setContributeTarget(null)
    setContributeName('')
    setContributeAmount('')
    load()
  }

  const handleDelete = async (id: string) => {
    await financeService.deletePayment(id)
    load()
  }

  const getRoommateName = (id: string) => roommates.find((r) => r.id === id)?.name ?? 'Unknown'

  return (
    <PageShell
      title="Finances"
      action={
        <Button size="lg" onClick={() => setCreateOpen(true)}>
          <span className="flex items-center gap-2">
            <Plus size={18} />
            New Payment
          </span>
        </Button>
      }
    >
      {loading ? (
        <Spinner />
      ) : payments.length === 0 ? (
        <EmptyState icon={<DollarSign size={24} />} message="No payments yet" />
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const remaining = financeService.getRemainingBalance(payment)
            const paidPercent = payment.totalAmount > 0
              ? ((payment.totalAmount - remaining) / payment.totalAmount) * 100
              : 0

            return (
              <Card key={payment.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white">{payment.reason}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-500">${payment.totalAmount.toFixed(2)}</span>
                      <span className="text-slate-700">&middot;</span>
                      <span className={`text-sm font-medium ${remaining === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {remaining === 0 ? 'Paid' : `$${remaining.toFixed(2)} left`}
                      </span>
                    </div>
                    {payment.notes && <p className="text-xs text-slate-600 mt-1">{payment.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="secondary" className="text-xs px-3 py-1.5" onClick={() => setContributeTarget(payment.id)}>
                      Contribute
                    </Button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="w-full h-1 rounded-full bg-white/[0.04] mb-4 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-700"
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>

                <div className="space-y-1.5">
                  {payment.contributions.map((c) => {
                    const fullyPaid = c.paid >= c.responsible
                    return (
                      <div
                        key={c.roommateId}
                        className={`flex items-center justify-between text-sm px-3 py-2.5 rounded-xl transition-colors ${
                          fullyPaid ? 'bg-emerald-500/[0.06] text-emerald-400' : 'bg-white/[0.02] text-slate-400'
                        }`}
                      >
                        <span className="font-medium">{getRoommateName(c.roommateId)}</span>
                        <span className="text-xs tabular-nums">${c.paid.toFixed(2)} / ${c.responsible.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); resetForm() }} title="Create Payment">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Reason</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rent, Electricity..." className={inputClasses} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Total Amount ($)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" className={inputClasses} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Split Type</label>
            <div className="flex gap-2">
              {(['equal', 'custom'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSplitType(t)}
                  className={`flex-1 py-2.5 text-sm rounded-xl border transition-all cursor-pointer capitalize ${
                    splitType === t
                      ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-500 hover:bg-white/[0.06]'
                  }`}
                >
                  {t === 'equal' ? 'Split Equally' : 'Custom Split'}
                </button>
              ))}
            </div>
          </div>
          {splitType === 'custom' && (
            <div className="space-y-2">
              {roommates.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 w-24 truncate">{r.name}</span>
                  <input
                    type="number"
                    value={customSplits[r.id] || ''}
                    onChange={(e) => setCustomSplits((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    min="0" step="0.01" placeholder="0.00"
                    className={`flex-1 ${inputClasses}`}
                  />
                </div>
              ))}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputClasses} resize-none`} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => { setCreateOpen(false); resetForm() }}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!reason.trim() || !amount}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!contributeTarget}
        onClose={() => { setContributeTarget(null); setContributeName(''); setContributeAmount('') }}
        title="Contribute"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Who is paying?</label>
            <select value={contributeName} onChange={(e) => setContributeName(e.target.value)} className={inputClasses}>
              <option value="">Select roommate</option>
              {roommates.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Amount ($)</label>
            <input type="number" value={contributeAmount} onChange={(e) => setContributeAmount(e.target.value)} min="0" step="0.01" className={inputClasses} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => { setContributeTarget(null); setContributeName(''); setContributeAmount('') }}>Cancel</Button>
            <Button onClick={handleContribute} disabled={!contributeName || !contributeAmount}>Submit</Button>
          </div>
        </div>
      </Modal>
    </PageShell>
  )
}
