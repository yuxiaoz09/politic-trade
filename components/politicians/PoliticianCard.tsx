import Link from 'next/link'
import { Politician } from '@/lib/db/schema'
import { Badge } from '@/components/ui/Badge'

interface PoliticianCardProps {
  politician: Politician
  tradeCount: number
}

function PartyInitial({ party }: { party: string }) {
  const colors: Record<string, string> = { D: 'bg-blue-900 text-blue-300', R: 'bg-red-900 text-red-300', I: 'bg-zinc-800 text-zinc-400' }
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm ${colors[party] ?? colors.I}`}>
      {party}
    </div>
  )
}

export function PoliticianCard({ politician, tradeCount }: PoliticianCardProps) {
  return (
    <Link
      href={`/politicians/${politician.id}`}
      className="flex items-center gap-3 p-4 border border-zinc-800 rounded-lg hover:border-zinc-600 hover:bg-zinc-900/40 transition-all group"
    >
      <PartyInitial party={politician.party} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-mono font-semibold text-zinc-200 truncate group-hover:text-zinc-100 transition-colors">
          {politician.name}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-mono text-zinc-600 uppercase">{politician.state}</span>
          <span className="text-zinc-800">·</span>
          <span className="text-[10px] font-mono text-zinc-600 capitalize">{politician.chamber}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono font-bold text-sm text-zinc-300">{tradeCount}</div>
        <div className="text-[10px] font-mono text-zinc-700 uppercase">trades</div>
      </div>
    </Link>
  )
}
