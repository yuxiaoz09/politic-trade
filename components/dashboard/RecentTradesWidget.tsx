import { getRecentTrades } from '@/lib/db/queries/trades'
import { TradeRow } from '@/components/trades/TradeRow'

export async function RecentTradesWidget() {
  const rows = await getRecentTrades(10)

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">Recent Disclosures</span>
        <a href="/feed" className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 uppercase tracking-wider transition-colors">
          View All →
        </a>
      </div>
      {rows.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-zinc-700 font-mono text-xs">No trades ingested yet</p>
          <p className="text-zinc-800 font-mono text-[10px] mt-1">Ingestion runs every 30 minutes</p>
        </div>
      ) : (
        <table className="w-full">
          <tbody>
            {rows.map(({ trade, politician }) => (
              <TradeRow key={trade.id} trade={trade} politician={politician ?? null} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
