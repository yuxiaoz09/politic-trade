export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getPoliticians } from '@/lib/db/queries/politicians'
import { PoliticianCard } from '@/components/politicians/PoliticianCard'
import { PoliticianSearch } from '@/components/politicians/PoliticianSearch'
import { Skeleton } from '@/components/ui/Skeleton'

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

async function PoliticianGrid({ search }: { search?: string }) {
  const rows = await getPoliticians(search)
  if (rows.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-600 font-mono text-sm">NO POLITICIANS FOUND</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {rows.map(({ politician, tradeCount }) => (
        <PoliticianCard key={politician.id} politician={politician} tradeCount={Number(tradeCount)} />
      ))}
    </div>
  )
}

export default async function PoliticiansPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <div className="p-6 max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-600">Politicians</h1>
        <Suspense fallback={<Skeleton className="h-8 w-48" />}>
          <PoliticianSearch />
        </Suspense>
      </div>
      <Suspense fallback={
        <div className="grid grid-cols-3 gap-3">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      }>
        <PoliticianGrid search={params.search} />
      </Suspense>
    </div>
  )
}
