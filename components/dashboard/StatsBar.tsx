import { getTradeStats } from '@/lib/db/queries/trades'

export async function StatsBar() {
  const stats = await getTradeStats()

  return (
    <div className="grid grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
      <StatCell label="Trades This Week" value={stats.thisWeek.toLocaleString()} />
      <StatCell label="Total Trades" value={stats.total.toLocaleString()} />
      <StatCell label="Top Ticker" value={stats.topTicker ?? '—'} mono />
    </div>
  )
}

function StatCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-zinc-950 px-6 py-4">
      <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-2xl font-bold text-zinc-100 ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</div>
    </div>
  )
}
