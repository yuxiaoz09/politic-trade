'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Input, Select } from '@/components/ui/Input'

export function TradeFeedFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  return (
    <div className={`flex flex-wrap items-center gap-2 p-4 border-b border-zinc-800 ${isPending ? 'opacity-60' : ''}`}>
      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mr-1">Filter:</span>

      <Select
        defaultValue={searchParams.get('chamber') ?? ''}
        onChange={(e) => updateFilter('chamber', e.target.value)}
        className="text-xs py-1.5"
      >
        <option value="">All Chambers</option>
        <option value="house">House</option>
        <option value="senate">Senate</option>
      </Select>

      <Input
        defaultValue={searchParams.get('ticker') ?? ''}
        placeholder="TICKER"
        onChange={(e) => updateFilter('ticker', e.target.value.toUpperCase())}
        className="w-24 text-xs py-1.5 uppercase"
      />

      <Input
        defaultValue={searchParams.get('from') ?? ''}
        type="date"
        onChange={(e) => updateFilter('from', e.target.value)}
        className="w-36 text-xs py-1.5"
      />

      <span className="text-zinc-700 font-mono text-xs">→</span>

      <Input
        defaultValue={searchParams.get('to') ?? ''}
        type="date"
        onChange={(e) => updateFilter('to', e.target.value)}
        className="w-36 text-xs py-1.5"
      />

      {searchParams.toString() && (
        <button
          onClick={() => router.push(pathname)}
          className="text-[10px] font-mono text-zinc-600 hover:text-rose-400 uppercase tracking-wider transition-colors"
        >
          ✕ CLEAR
        </button>
      )}
    </div>
  )
}
