import { Suspense } from 'react'
import { TradeFeed } from '@/components/trades/TradeFeed'
import { TradeFeedFilters } from '@/components/trades/TradeFeedFilters'
import { TradeRowSkeleton } from '@/components/ui/Skeleton'

interface FeedPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h1 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-600">
          Trade Feed
        </h1>
      </div>

      <Suspense fallback={<div className="p-4 text-zinc-700 font-mono text-xs">Loading filters...</div>}>
        <TradeFeedFilters />
      </Suspense>

      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={
          <table className="w-full">
            <tbody>{[...Array(15)].map((_, i) => <TradeRowSkeleton key={i} />)}</tbody>
          </table>
        }>
          <TradeFeed filters={{
            chamber: params.chamber,
            ticker: params.ticker,
            from: params.from,
            to: params.to,
            page: parseInt(params.page ?? '1', 10),
          }} />
        </Suspense>
      </div>
    </div>
  )
}
