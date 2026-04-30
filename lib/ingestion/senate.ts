import { daysAgo } from '../utils'
import { normalizeSenateTrade, NormalizedTrade, NormalizedPolitician } from './normalize'

// Known Senate eFD endpoints to try in order
const SENATE_ENDPOINTS = [
  'https://efts.senate.gov/LATEST/search-index',
  'https://efs.senate.gov/efds/api/search-index',
  'https://financial.senate.gov/api/search-index',
]

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

  for (const base of SENATE_ENDPOINTS) {
    const url = `${base}?${params}`
    console.log(`[senate] Trying ${url}`)
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) {
        console.warn(`[senate] ${base} returned ${res.status}`)
        continue
      }

      const data = await res.json()
      const hits: Record<string, unknown>[] = data?.hits?.hits ?? []
      console.log(`[senate] Got ${hits.length} filings from ${base}`)

      return parseSenateHits(hits, toDate)
    } catch (e) {
      console.error(`[senate] Error from ${base}:`, (e as Error).message)
    }
  }

  console.warn('[senate] All endpoints failed — returning empty result')
  return { trades: [], politicians: [], lastSeenDate: toDate }
}

function parseSenateHits(hits: Record<string, unknown>[], lastSeenDate: string): SenateResult {
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

    const transactions: Record<string, unknown>[] = Array.isArray(src.transactions) ? src.transactions : []
    for (const tx of transactions) {
      const raw: Record<string, string> = {}
      for (const [k, v] of Object.entries(tx as Record<string, unknown>)) raw[k] = String(v ?? '')

      const result = normalizeSenateTrade(raw, filingMeta)
      if (!result) continue
      trades.push(result.trade)
      if (!seenPoliticians.has(result.politician.id)) {
        politicians.push(result.politician)
        seenPoliticians.add(result.politician.id)
      }
    }
  }

  return { trades, politicians, lastSeenDate }
}
