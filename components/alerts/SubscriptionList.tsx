'use client'

import { AlertSubscription } from '@/lib/db/schema'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface SubscriptionListProps {
  subscriptions: AlertSubscription[]
}

function typeLabel(type: string, filterValue: string | null) {
  switch (type) {
    case 'all': return 'All Trades'
    case 'chamber': return `Chamber: ${filterValue?.toUpperCase()}`
    case 'politician': return `Politician: ${filterValue}`
    case 'ticker': return `Ticker: ${filterValue}`
    default: return type
  }
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setPending(id)
    await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
    setPending(null)
    router.refresh()
  }

  async function handleToggle(id: string, active: number) {
    setPending(id)
    await fetch(`/api/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: active === 0 }),
    })
    setPending(null)
    router.refresh()
  }

  if (subscriptions.length === 0) {
    return (
      <div className="py-12 text-center border border-zinc-800 rounded-lg">
        <p className="text-zinc-600 font-mono text-sm">NO ALERTS CONFIGURED</p>
        <p className="text-zinc-700 font-mono text-xs mt-1">Add your first alert above</p>
      </div>
    )
  }

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="py-2 px-4 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-600">Alert</th>
            <th className="py-2 px-4 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-600">Channel</th>
            <th className="py-2 px-4 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-600">Status</th>
            <th className="py-2 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/30 transition-colors">
              <td className="py-3 px-4">
                <span className="text-sm font-mono text-zinc-200">
                  {typeLabel(sub.type, sub.filterValue)}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-xs font-mono text-zinc-500 uppercase">{sub.channel}</span>
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleToggle(sub.id, sub.active)}
                  disabled={pending === sub.id}
                  className={`text-[10px] font-mono uppercase tracking-wider font-bold transition-colors ${
                    sub.active ? 'text-emerald-400 hover:text-emerald-300' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {sub.active ? '● ACTIVE' : '○ PAUSED'}
                </button>
              </td>
              <td className="py-3 px-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(sub.id)}
                  disabled={pending === sub.id}
                  className="text-zinc-600 hover:text-rose-400"
                >
                  REMOVE
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
