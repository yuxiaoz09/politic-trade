import { formatAmountRange } from '@/lib/utils'

export function TradeAmountBadge({ low, high }: { low: number; high: number }) {
  return (
    <span className="font-mono text-xs text-zinc-300 tabular-nums">
      {formatAmountRange(low, high)}
    </span>
  )
}
