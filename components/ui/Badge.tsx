import { cn } from '@/lib/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'buy' | 'sell' | 'dem' | 'rep' | 'house' | 'senate' | 'muted'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider',
      {
        'bg-zinc-800 text-zinc-300': variant === 'default',
        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': variant === 'buy',
        'bg-rose-500/10 text-rose-400 border border-rose-500/20': variant === 'sell',
        'bg-blue-500/10 text-blue-400 border border-blue-500/20': variant === 'dem',
        'bg-red-500/10 text-red-400 border border-red-500/20': variant === 'rep',
        'bg-zinc-700/50 text-zinc-400': variant === 'house' || variant === 'senate',
        'bg-transparent text-zinc-500': variant === 'muted',
      },
      className
    )}>
      {children}
    </span>
  )
}
