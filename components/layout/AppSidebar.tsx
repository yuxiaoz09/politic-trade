'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

const navItems = [
  { href: '/dashboard', label: 'DASHBOARD', icon: '▪' },
  { href: '/feed', label: 'TRADE FEED', icon: '▫' },
  { href: '/politicians', label: 'POLITICIANS', icon: '▪' },
  { href: '/alerts', label: 'ALERTS', icon: '▫' },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-48 border-r border-zinc-800 flex flex-col shrink-0 py-4">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono font-semibold uppercase tracking-widest transition-colors',
              active
                ? 'text-zinc-100 bg-zinc-800/60 border-r-2 border-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <span className={active ? 'text-emerald-400' : ''}>{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
