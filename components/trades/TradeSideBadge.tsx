interface TradeSideBadgeProps {
  transactionType: string
}

export function TradeSideBadge({ transactionType }: TradeSideBadgeProps) {
  const isSell = transactionType.toLowerCase().includes('sale') || transactionType.toLowerCase().includes('sell')
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
      isSell
        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    }`}>
      {isSell ? 'SELL' : 'BUY'}
    </span>
  )
}
