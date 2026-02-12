import type { Payment, Contribution } from '../types'
import { getItem, setItem } from './storage'

const KEY = 'payments'

export async function getPayments(): Promise<Payment[]> {
  return getItem<Payment[]>(KEY, [])
}

export async function createPayment(
  payment: Omit<Payment, 'id'>
): Promise<Payment> {
  const payments = await getPayments()
  const newPayment: Payment = { ...payment, id: crypto.randomUUID() }
  payments.push(newPayment)
  setItem(KEY, payments)
  return newPayment
}

export async function deletePayment(id: string): Promise<void> {
  const payments = await getPayments()
  setItem(
    KEY,
    payments.filter((p) => p.id !== id)
  )
}

export async function contribute(
  paymentId: string,
  roommateId: string,
  amount: number
): Promise<Payment[]> {
  const payments = await getPayments()
  const updated = payments.map((p) => {
    if (p.id !== paymentId) return p
    const contributions: Contribution[] = p.contributions.map((c) =>
      c.roommateId === roommateId ? { ...c, paid: c.paid + amount } : c
    )
    return { ...p, contributions }
  })
  setItem(KEY, updated)
  return updated
}

export function getRemainingBalance(payment: Payment): number {
  const totalPaid = payment.contributions.reduce((sum, c) => sum + c.paid, 0)
  return Math.max(0, payment.totalAmount - totalPaid)
}
