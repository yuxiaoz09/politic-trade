import { hashRecord, slugify, parseAmountRange } from '../utils'

export interface NormalizedTrade {
  id: string
  politicianId: string
  ticker: string
  assetName: string
  assetType: string
  transactionType: string
  transactionDate: string
  disclosureDate: string
  amountRangeLow: number
  amountRangeHigh: number
  chamber: 'house' | 'senate'
  filingUrl?: string
  rawJson: string
  createdAt: number
}

export interface NormalizedPolitician {
  id: string
  name: string
  chamber: 'house' | 'senate'
  state: string
  party: string
  district?: string
}

/** Normalize a raw House PTR transaction */
export function normalizeHouseTrade(raw: Record<string, string>): { trade: NormalizedTrade; politician: NormalizedPolitician } | null {
  const name = raw.Name?.trim() ?? ''
  const ticker = raw.Ticker?.trim() ?? raw.AssetName?.trim() ?? 'N/A'
  const transactionDate = normalizeDate(raw.TransactionDate ?? raw.Date ?? '')
  const disclosureDate = normalizeDate(raw.FilingDate ?? raw.DisclosureDate ?? '')
  const amountRaw = raw.Amount ?? ''
  const transactionType = raw.Type ?? raw.TransactionType ?? 'Unknown'
  const state = raw.StateDst?.slice(0, 2) ?? raw.State ?? 'XX'
  const assetName = raw.AssetName ?? raw.Description ?? ticker
  const assetType = raw.AssetType ?? 'Stock'

  if (!name || !transactionDate) return null

  const politicianId = slugify(name)
  const [amountRangeLow, amountRangeHigh] = parseAmountRange(amountRaw)

  const id = hashRecord(`house|${politicianId}|${ticker}|${transactionDate}|${transactionType}|${amountRaw}`)

  return {
    politician: { id: politicianId, name, chamber: 'house', state, party: raw.Party ?? 'Unknown' },
    trade: {
      id,
      politicianId,
      ticker: ticker.toUpperCase(),
      assetName,
      assetType,
      transactionType,
      transactionDate,
      disclosureDate,
      amountRangeLow,
      amountRangeHigh,
      chamber: 'house',
      filingUrl: raw.FilingUrl,
      rawJson: JSON.stringify(raw),
      createdAt: Date.now(),
    },
  }
}

/** Normalize a raw Senate eFD transaction */
export function normalizeSenateTrade(raw: Record<string, string>, filingMeta: Record<string, string>): { trade: NormalizedTrade; politician: NormalizedPolitician } | null {
  const firstName = filingMeta.first_name ?? ''
  const lastName = filingMeta.last_name ?? ''
  const name = `${firstName} ${lastName}`.trim()
  if (!name) return null

  const ticker = raw.ticker?.trim() ?? 'N/A'
  const transactionDate = normalizeDate(raw.transaction_date ?? '')
  const disclosureDate = normalizeDate(filingMeta.date_received ?? '')
  const assetName = raw.asset_description ?? ticker
  const assetType = raw.asset_type ?? 'Stock'
  const transactionType = raw.type ?? 'Unknown'
  const amountRaw = raw.amount ?? ''
  const state = filingMeta.senator_state ?? 'XX'
  const party = filingMeta.senator_party ?? 'Unknown'

  const politicianId = slugify(name)
  const [amountRangeLow, amountRangeHigh] = parseAmountRange(amountRaw)

  const id = hashRecord(`senate|${politicianId}|${ticker}|${transactionDate}|${transactionType}|${amountRaw}`)

  return {
    politician: { id: politicianId, name, chamber: 'senate', state, party },
    trade: {
      id,
      politicianId,
      ticker: ticker.toUpperCase(),
      assetName,
      assetType,
      transactionType,
      transactionDate,
      disclosureDate,
      amountRangeLow,
      amountRangeHigh,
      chamber: 'senate',
      filingUrl: filingMeta.filing_url,
      rawJson: JSON.stringify({ raw, filingMeta }),
      createdAt: Date.now(),
    },
  }
}

function normalizeDate(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0]
  // Handle M/D/YYYY or MM/DD/YYYY
  if (raw.includes('/')) {
    const parts = raw.split('/')
    if (parts.length === 3) {
      const [m, d, y] = parts
      return `${y.padStart(4, '20')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
  }
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)
  return raw.slice(0, 10)
}
