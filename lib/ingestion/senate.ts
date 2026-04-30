import { daysAgo } from '../utils'
import { normalizeSenateTrade, NormalizedTrade, NormalizedPolitician } from './normalize'

const SENATE_SEARCH = 'https://efts.senate.gov/LATEST/search-index'

interface SenateResult {
  trades: NormalizedTrade[]
  politicians: NormalizedPolitician[]
  lastSeenDate: string
}

export async function fetchSenatePTR(lookbackDays = 7): Promise<SenateResult> {
  const fromDate = daysAgo(lookbackDays)
  const toDate = new Date().toISOString().split('T')[0]

  const params = new URLSearchParams({
    q: '',
    dateRange: 'custom',
    fromDate,
    toDate,
    category: 'ptr',
  })

  const url = `${SENATE_SEARCH}?${params}`
  console.log(`[senate] Fetching ${url}`)

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'politic-trade/1.0 (public data aggregator)',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(20_000),
  })

  if (!res.ok) {
    throw new Error(`Senate eFD fetch failed: ${res.status}`)
  }

  const data = await res.json()
  const hits: Record<string, unknown>[] = data?.hits?.hits ?? []

  const trades: NormalizedTrade[] = []
  const politicians: NormalizedPolitician[] = []
  const seenPoliticians = new Set<string>()

  for (const hit of hits) {
    const src = (hit._source ?? {}) as Record<string, unknown>
    const filingMeta: Record<string, string> = {
      first_name: String(src.first_name ?? ''),
      last_name: String(src.last_name ?? ''),
      date_received: String(src.date_received ?? ''),
      senator_state: String(src.senator_state ?? ''),
      senator_party: String(src.senator_party ?? ''),
      filing_url: src.link ? `https://efts.senate.gov${src.link}` : '',
    }

    // Transactions are nested inside each filing
    const transactions: Record<string, unknown>[] = Array.isArray(src.transactions) ? src.transactions : []
    for (const tx of transactions) {
      const raw: Record<string, string> = {}
      for (const [k, v] of Object.entries(tx as Record<string, unknown>)) {
        raw[k] = String(v ?? '')
      }

      const result = normalizeSenateTrade(raw, filingMeta)
      if (result) {
        trades.push(result.trade)
        if (!seenPoliticians.has(result.politician.id)) {
          politicians.push(result.politician)
          seenPoliticians.add(result.politician.id)
        }
      }
    }
  }

  return { trades, politicians, lastSeenDate: toDate }
}
