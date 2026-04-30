'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'

export function SubscriptionForm() {
  const router = useRouter()
  const [type, setType] = useState('all')
  const [filterValue, setFilterValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, filterValue: type === 'all' ? undefined : filterValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFilterValue('')
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 p-4 border border-zinc-800 rounded-lg bg-zinc-900/30">
      <div>
        <label className="block text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1.5">Alert Type</label>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="text-xs py-1.5">
          <option value="all">All Trades</option>
          <option value="chamber">By Chamber</option>
          <option value="politician">By Politician</option>
          <option value="ticker">By Ticker</option>
        </Select>
      </div>

      {type !== 'all' && (
        <div>
          <label className="block text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1.5">
            {type === 'chamber' ? 'Chamber' : type === 'ticker' ? 'Ticker Symbol' : 'Politician Name / ID'}
          </label>
          {type === 'chamber' ? (
            <Select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="text-xs py-1.5">
              <option value="">Select...</option>
              <option value="house">House</option>
              <option value="senate">Senate</option>
            </Select>
          ) : (
            <Input
              value={filterValue}
              onChange={(e) => setFilterValue(type === 'ticker' ? e.target.value.toUpperCase() : e.target.value)}
              placeholder={type === 'ticker' ? 'NVDA' : 'nancy-pelosi'}
              className="text-xs py-1.5 w-40"
            />
          )}
        </div>
      )}

      <Button type="submit" disabled={loading || (type !== 'all' && !filterValue)} size="sm">
        {loading ? 'ADDING...' : '+ ADD ALERT'}
      </Button>

      {error && <span className="text-xs font-mono text-rose-400">{error}</span>}
    </form>
  )
}
