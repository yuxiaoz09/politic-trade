import { getTrades, TradeFilters } from '@/lib/db/queries/trades'
import { TradeRow } from './TradeRow'

const HEADERS = ['POLITICIAN', 'TICKER', 'SIDE', 'AMOUNT', 'ASSET', 'DATE', '']

interface TradeFeedProps {
  filters?: TradeFilters
}

export async function TradeFeed({ filters }: TradeFeedProps) {
  const { rows, total, page, limit } = await getTrades(filters)

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-zinc-600 font-mono text-sm">NO TRADES FOUND</p>
        <p className="text-zinc-700 font-mono text-xs mt-1">Try adjusting your filters or check back later</p>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {HEADERS.map((h, i) => (
                <th key={i} className="py-2 px-4 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ trade, politician }) => (
              <TradeRow key={trade.id} trade={trade} politician={politician ?? null} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 mt-1">
        <span className="text-[11px] font-mono text-zinc-600">
          {total.toLocaleString()} total trades
        </span>
        <span className="text-[11px] font-mono text-zinc-600">
          Page {page} of {Math.ceil(total / limit) || 1}
        </span>
      </div>
    </div>
  )
}
