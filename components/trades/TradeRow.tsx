import { Trade, Politician } from '@/lib/db/schema'
import { TradeSideBadge } from './TradeSideBadge'
import { TradeAmountBadge } from './TradeAmountBadge'
import { formatDate } from '@/lib/utils'

interface TradeRowProps {
  trade: Trade
  politician: Politician | null
}

function PartyDot({ party }: { party: string }) {
  const color = party === 'D' ? 'bg-blue-500' : party === 'R' ? 'bg-red-500' : 'bg-zinc-500'
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color} shrink-0`} />
}

export function TradeRow({ trade, politician }: TradeRowProps) {
  return (
    <tr className="border-b border-zinc-800/60 hover:bg-zinc-900/40 transition-colors group">
      {/* Politician */}
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-2">
          <PartyDot party={politician?.party ?? ''} />
          <div>
            <div className="text-xs font-mono text-zinc-200 font-medium leading-tight">
              {politician?.name ?? 'Unknown'}
            </div>
            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider leading-tight">
              {politician?.state} · {trade.chamber}
            </div>
          </div>
        </div>
      </td>

      {/* Ticker */}
      <td className="py-2.5 px-4">
        <span className="font-mono font-bold text-sm text-zinc-100 tracking-wider">
          {trade.ticker === 'N/A' ? (
            <span className="text-zinc-500 text-xs">—</span>
          ) : trade.ticker}
        </span>
      </td>

      {/* Side */}
      <td className="py-2.5 px-4">
        <TradeSideBadge transactionType={trade.transactionType} />
      </td>

      {/* Amount */}
      <td className="py-2.5 px-4">
        <TradeAmountBadge low={trade.amountRangeLow} high={trade.amountRangeHigh} />
      </td>

      {/* Asset */}
      <td className="py-2.5 px-4 max-w-[200px]">
        <span className="text-xs font-mono text-zinc-500 truncate block">
          {trade.assetName.length > 40 ? trade.assetName.slice(0, 40) + '…' : trade.assetName}
        </span>
      </td>

      {/* Date */}
      <td className="py-2.5 px-4">
        <div className="text-[11px] font-mono text-zinc-500 tabular-nums whitespace-nowrap">
          {formatDate(trade.transactionDate)}
        </div>
        <div className="text-[10px] font-mono text-zinc-700 tabular-nums whitespace-nowrap">
          filed {formatDate(trade.disclosureDate)}
        </div>
      </td>

      {/* Filing link */}
      <td className="py-2.5 px-4">
        {trade.filingUrl ? (
          <a
            href={trade.filingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 uppercase tracking-wider transition-colors"
          >
            PDF ↗
          </a>
        ) : (
          <span className="text-[10px] text-zinc-800">—</span>
        )}
      </td>
    </tr>
  )
}
