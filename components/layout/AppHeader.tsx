import Link from 'next/link'
import { LogoutButton } from './LogoutButton'

export function AppHeader() {
  return (
    <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0">
      <Link href="/dashboard" className="font-mono font-bold text-sm tracking-widest text-zinc-100 uppercase">
        POLITIC<span className="text-emerald-400">·</span>TRADE
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          US Congress · STOCK Act
        </span>
        <LogoutButton />
      </div>
    </header>
  )
}
