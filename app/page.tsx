import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="font-mono font-bold text-3xl tracking-widest text-zinc-100 uppercase mb-2">
        POLITIC<span className="text-emerald-400">·</span>TRADE
      </div>
      <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-12">
        US Congress · STOCK Act Disclosures
      </p>

      <div className="max-w-xl mb-12">
        <h1 className="text-4xl font-bold text-zinc-100 leading-tight mb-4">
          Track what Congress is buying and selling
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Real-time alerts on House and Senate trade disclosures under the STOCK Act.
          Monitor specific politicians, tickers, or chambers — get notified by email the moment new filings appear.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl mb-12 text-left">
        {[
          { icon: '▸', title: 'Live Ingestion', desc: 'House + Senate disclosures polled every 30 minutes' },
          { icon: '▸', title: 'Smart Alerts', desc: 'Filter by politician, ticker, or chamber' },
          { icon: '▸', title: 'Email Delivery', desc: 'Instant email when a matching trade is filed' },
        ].map((f) => (
          <div key={f.title} className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/20">
            <div className="text-emerald-400 font-mono text-xs mb-2">{f.icon} {f.title}</div>
            <div className="text-zinc-500 text-xs leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/signup"
          className="bg-zinc-50 text-zinc-950 font-mono font-bold text-sm px-6 py-3 rounded hover:bg-zinc-200 transition-colors uppercase tracking-wide"
        >
          Get Started →
        </Link>
        <Link
          href="/login"
          className="font-mono text-sm text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wide"
        >
          Sign In
        </Link>
      </div>

      <div className="mt-16 text-[10px] font-mono text-zinc-800 uppercase tracking-widest">
        Data sourced from disclosures.house.gov and efts.senate.gov · Public record
      </div>
    </div>
  )
}
