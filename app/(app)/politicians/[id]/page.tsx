export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getPoliticianById } from '@/lib/db/queries/politicians'
import { getTrades } from '@/lib/db/queries/trades'
import { TradeRow } from '@/components/trades/TradeRow'
import { TradeRowSkeleton } from '@/components/ui/Skeleton'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

async function PoliticianTrades({ id }: { id: string }) {
  const { rows } = await getTrades({ politician: id, limit: 100 })
  if (rows.length === 0) {
    return <p className="text-zinc-600 font-mono text-sm py-8 text-center">No trades on record</p>
  }
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-zinc-800">
          {['POLITICIAN', 'TICKER', 'SIDE', 'AMOUNT', 'ASSET', 'DATE', ''].map((h, i) => (
            <th key={i} className="py-2 px-4 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-600">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(({ trade, politician }) => (
          <TradeRow key={trade.id} trade={trade} politician={politician ?? null} />
        ))}
      </tbody>
    </table>
  )
}

export default async function PoliticianProfilePage({ params }: PageProps) {
  const { id } = await params
  const politician = await getPoliticianById(id)
  if (!politician) notFound()

  const partyColor = politician.party === 'D' ? 'text-blue-400' : politician.party === 'R' ? 'text-red-400' : 'text-zinc-400'

  return (
    <div className="p-6 max-w-6xl space-y-5">
      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
        <Link href="/politicians" className="hover:text-zinc-400 transition-colors uppercase tracking-wider">Politicians</Link>
        <span>›</span>
        <span className="text-zinc-400">{politician.name}</span>
      </div>

      <div className="flex items-start gap-4 p-5 border border-zinc-800 rounded-lg bg-zinc-900/20">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-lg border border-zinc-800 ${partyColor}`}>
          {politician.party}
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100 font-mono">{politician.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-mono text-zinc-500 uppercase">{politician.chamber}</span>
            <span className="text-zinc-700">·</span>
            <span className="text-xs font-mono text-zinc-500">{politician.state}</span>
            {politician.district && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="text-xs font-mono text-zinc-500">District {politician.district}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Trade History</span>
        </div>
        <Suspense fallback={
          <table className="w-full">
            <tbody>{[...Array(10)].map((_, i) => <TradeRowSkeleton key={i} />)}</tbody>
          </table>
        }>
          <PoliticianTrades id={id} />
        </Suspense>
      </div>
    </div>
  )
}
