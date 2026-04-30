export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { RecentTradesWidget } from '@/components/dashboard/RecentTradesWidget'
import { Skeleton, TradeRowSkeleton } from '@/components/ui/Skeleton'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-600 mb-4">
          Overview
        </h1>
        <Suspense fallback={
          <div className="grid grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
            {[0,1,2].map(i => <div key={i} className="bg-zinc-950 px-6 py-4"><Skeleton className="h-8 w-24 mt-5" /></div>)}
          </div>
        }>
          <StatsBar />
        </Suspense>
      </div>

      <Suspense fallback={
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <Skeleton className="h-3 w-36" />
          </div>
          <table className="w-full">
            <tbody>
              {[...Array(5)].map((_, i) => <TradeRowSkeleton key={i} />)}
            </tbody>
          </table>
        </div>
      }>
        <RecentTradesWidget />
      </Suspense>
    </div>
  )
}
