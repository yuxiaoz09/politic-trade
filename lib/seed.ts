import { db } from './db/index'
import { politicians, trades } from './db/schema'
import { sql } from 'drizzle-orm'
import crypto from 'crypto'

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function hash(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex').slice(0, 32)
}

function amountToRange(label: string): [number, number] {
  const map: Record<string, [number, number]> = {
    '$1K–15K':     [1_001,    15_000],
    '$15K–50K':   [15_001,    50_000],
    '$50K–100K':  [50_001,   100_000],
    '$100K–250K': [100_001,  250_000],
    '$250K–500K': [250_001,  500_000],
    '$500K–1M':   [500_001, 1_000_000],
    '$1M–5M':   [1_000_001, 5_000_000],
  }
  return map[label] ?? [1_001, 15_000]
}

interface RawTrade {
  politician: string
  party: 'D' | 'R' | 'I'
  chamber: 'house' | 'senate'
  state: string
  ticker: string
  assetName: string
  type: 'Purchase' | 'Sale' | 'Sale (Partial)' | 'Exchange'
  amount: string
  transactionDate: string
  disclosureDate: string
}

const SEED_TRADES: RawTrade[] = [
  // Bob Latta
  { politician: 'Bob Latta', party: 'R', chamber: 'house', state: 'OH', ticker: 'FMAO', assetName: 'Farmer Mac', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-04-20', disclosureDate: '2026-04-24' },

  // Maria Elvira Salazar
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'AMGN', assetName: 'Amgen Inc', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-24', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'BA', assetName: 'Boeing Co', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-19', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'CSCO', assetName: 'Cisco Systems', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-19', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'C', assetName: 'Citigroup Inc', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-19', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'GLW', assetName: 'Corning Inc', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-19', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'FDX', assetName: 'FedEx Corp', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-19', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'GE', assetName: 'GE Aerospace', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-24', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'GS', assetName: 'Goldman Sachs', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-19', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'HON', assetName: 'Honeywell International', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-24', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'NVR', assetName: 'NVR Inc', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-19', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'PTON', assetName: 'Peloton Interactive', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-19', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'RH', assetName: 'RH (Restoration Hardware)', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-19', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'ULTA', assetName: 'Ulta Beauty', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-19', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'URI', assetName: 'United Rentals', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-25', disclosureDate: '2026-04-22' },
  { politician: 'Maria Elvira Salazar', party: 'R', chamber: 'house', state: 'FL', ticker: 'WHR', assetName: 'Whirlpool Corp', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-19', disclosureDate: '2026-04-22' },

  // Terri Sewell
  { politician: 'Terri Sewell', party: 'D', chamber: 'house', state: 'AL', ticker: 'GEHC', assetName: 'GE HealthCare Technologies', type: 'Sale', amount: '$1K–15K', transactionDate: '2026-03-25', disclosureDate: '2026-04-21' },
  { politician: 'Terri Sewell', party: 'D', chamber: 'house', state: 'AL', ticker: 'TPR', assetName: 'Tapestry Inc', type: 'Sale', amount: '$15K–50K', transactionDate: '2026-03-25', disclosureDate: '2026-04-21' },

  // Cleo Fields
  { politician: 'Cleo Fields', party: 'D', chamber: 'house', state: 'LA', ticker: 'TSM', assetName: 'Taiwan Semiconductor', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-04-09', disclosureDate: '2026-04-21' },

  // Dan Meuser
  { politician: 'Dan Meuser', party: 'R', chamber: 'house', state: 'PA', ticker: 'NVDA', assetName: 'NVIDIA Corp', type: 'Sale', amount: '$1K–15K', transactionDate: '2026-03-25', disclosureDate: '2026-04-21' },

  // Dwight Evans
  { politician: 'Dwight Evans', party: 'D', chamber: 'house', state: 'PA', ticker: 'MU', assetName: 'Micron Technology', type: 'Sale', amount: '$15K–50K', transactionDate: '2026-03-24', disclosureDate: '2026-04-21' },

  // Jim Banks (Senate)
  { politician: 'Jim Banks', party: 'R', chamber: 'senate', state: 'IN', ticker: 'SBUX', assetName: 'Starbucks Corp', type: 'Sale', amount: '$1K–15K', transactionDate: '2026-04-15', disclosureDate: '2026-04-20' },

  // Jennifer McClellan
  { politician: 'Jennifer McClellan', party: 'D', chamber: 'house', state: 'VA', ticker: 'VZ', assetName: 'Verizon Communications', type: 'Sale', amount: '$100K–250K', transactionDate: '2026-04-07', disclosureDate: '2026-04-17' },

  // Sheri Biggs
  { politician: 'Sheri Biggs', party: 'R', chamber: 'house', state: 'SC', ticker: 'IBIT', assetName: 'iShares Bitcoin Trust', type: 'Purchase', amount: '$100K–250K', transactionDate: '2026-03-04', disclosureDate: '2026-04-17' },

  // August Pfluger
  { politician: 'August Pfluger', party: 'R', chamber: 'house', state: 'TX', ticker: 'UHAL', assetName: 'U-Haul Holding', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-13', disclosureDate: '2026-04-16' },
  { politician: 'August Pfluger', party: 'R', chamber: 'house', state: 'TX', ticker: 'BRK/B', assetName: 'Berkshire Hathaway Cl B', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-13', disclosureDate: '2026-04-16' },
  { politician: 'August Pfluger', party: 'R', chamber: 'house', state: 'TX', ticker: 'EPD', assetName: 'Enterprise Products Partners', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-03-13', disclosureDate: '2026-04-16' },

  // Rick Larsen
  { politician: 'Rick Larsen', party: 'D', chamber: 'house', state: 'WA', ticker: 'AXP', assetName: 'American Express', type: 'Sale', amount: '$1K–15K', transactionDate: '2026-04-07', disclosureDate: '2026-04-16' },
  { politician: 'Rick Larsen', party: 'D', chamber: 'house', state: 'WA', ticker: 'CARR', assetName: 'Carrier Global', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-04-07', disclosureDate: '2026-04-16' },
  { politician: 'Rick Larsen', party: 'D', chamber: 'house', state: 'WA', ticker: 'NEE', assetName: 'NextEra Energy', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-04-07', disclosureDate: '2026-04-16' },
  { politician: 'Rick Larsen', party: 'D', chamber: 'house', state: 'WA', ticker: 'PAYX', assetName: 'Paychex Inc', type: 'Sale', amount: '$1K–15K', transactionDate: '2026-04-07', disclosureDate: '2026-04-16' },
  { politician: 'Rick Larsen', party: 'D', chamber: 'house', state: 'WA', ticker: 'WAB', assetName: 'Westinghouse Air Brake', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-04-07', disclosureDate: '2026-04-16' },

  // Greg Steube
  { politician: 'Greg Steube', party: 'R', chamber: 'house', state: 'FL', ticker: 'IONQ', assetName: 'IonQ Inc', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-18', disclosureDate: '2026-04-15' },
  { politician: 'Greg Steube', party: 'R', chamber: 'house', state: 'FL', ticker: 'MAR', assetName: 'Marriott International', type: 'Purchase', amount: '$15K–50K', transactionDate: '2026-04-08', disclosureDate: '2026-04-15' },

  // John Boozman (Senate)
  { politician: 'John Boozman', party: 'R', chamber: 'senate', state: 'AR', ticker: 'JNJ', assetName: 'Johnson & Johnson', type: 'Sale', amount: '$1K–15K', transactionDate: '2026-03-19', disclosureDate: '2026-04-14' },
  { politician: 'John Boozman', party: 'R', chamber: 'senate', state: 'AR', ticker: 'NVDA', assetName: 'NVIDIA Corp', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-19', disclosureDate: '2026-04-14' },
  { politician: 'John Boozman', party: 'R', chamber: 'senate', state: 'AR', ticker: 'MSFT', assetName: 'Microsoft Corp', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-05', disclosureDate: '2026-04-14' },
  { politician: 'John Boozman', party: 'R', chamber: 'senate', state: 'AR', ticker: 'ARES', assetName: 'Ares Management Corp', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-13', disclosureDate: '2026-04-14' },
  { politician: 'John Boozman', party: 'R', chamber: 'senate', state: 'AR', ticker: 'VEA', assetName: 'Vanguard FTSE Developed Markets ETF', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-19', disclosureDate: '2026-04-14' },

  // Thomas Kean Jr
  { politician: 'Thomas Kean Jr', party: 'R', chamber: 'house', state: 'NJ', ticker: 'CB', assetName: 'Chubb Ltd', type: 'Sale', amount: '$15K–50K', transactionDate: '2026-03-26', disclosureDate: '2026-04-14' },
  { politician: 'Thomas Kean Jr', party: 'R', chamber: 'house', state: 'NJ', ticker: 'JNJ', assetName: 'Johnson & Johnson', type: 'Sale', amount: '$1K–15K', transactionDate: '2026-03-26', disclosureDate: '2026-04-14' },
  { politician: 'Thomas Kean Jr', party: 'R', chamber: 'house', state: 'NJ', ticker: 'LIN', assetName: 'Linde PLC', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-26', disclosureDate: '2026-04-14' },
  { politician: 'Thomas Kean Jr', party: 'R', chamber: 'house', state: 'NJ', ticker: 'PEP', assetName: 'PepsiCo Inc', type: 'Sale', amount: '$15K–50K', transactionDate: '2026-03-26', disclosureDate: '2026-04-14' },
  { politician: 'Thomas Kean Jr', party: 'R', chamber: 'house', state: 'NJ', ticker: 'SPGI', assetName: 'S&P Global Inc', type: 'Sale', amount: '$15K–50K', transactionDate: '2026-03-26', disclosureDate: '2026-04-14' },
  { politician: 'Thomas Kean Jr', party: 'R', chamber: 'house', state: 'NJ', ticker: 'AMCR', assetName: 'Amcor PLC', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-31', disclosureDate: '2026-04-14' },

  // Shelley Moore Capito (Senate)
  { politician: 'Shelley Moore Capito', party: 'R', chamber: 'senate', state: 'WV', ticker: 'MA', assetName: 'Mastercard Inc', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-03-28', disclosureDate: '2026-04-12' },

  // Michael McCaul
  { politician: 'Michael McCaul', party: 'R', chamber: 'house', state: 'TX', ticker: 'N/A', assetName: 'City of Jacksonville Florida Municipal Bond', type: 'Purchase', amount: '$100K–250K', transactionDate: '2026-03-16', disclosureDate: '2026-04-10' },

  // Tim Moore
  { politician: 'Tim Moore', party: 'R', chamber: 'house', state: 'NC', ticker: 'CBRL', assetName: 'Cracker Barrel Old Country Store', type: 'Sale', amount: '$15K–50K', transactionDate: '2026-03-15', disclosureDate: '2026-04-01' },
  { politician: 'Tim Moore', party: 'R', chamber: 'house', state: 'NC', ticker: 'HOG', assetName: 'Harley-Davidson Inc', type: 'Sale', amount: '$50K–100K', transactionDate: '2026-03-20', disclosureDate: '2026-04-07' },
  { politician: 'Tim Moore', party: 'R', chamber: 'house', state: 'NC', ticker: 'LGIH', assetName: 'LGI Homes Inc', type: 'Sale', amount: '$100K–250K', transactionDate: '2026-03-10', disclosureDate: '2026-03-26' },
  { politician: 'Tim Moore', party: 'R', chamber: 'house', state: 'NC', ticker: 'NVDA', assetName: 'NVIDIA Corp', type: 'Sale', amount: '$15K–50K', transactionDate: '2026-03-08', disclosureDate: '2026-03-24' },

  // Debbie Dingell
  { politician: 'Debbie Dingell', party: 'D', chamber: 'house', state: 'MI', ticker: 'N/A', assetName: 'Cohen & Steers Tax-Advantage', type: 'Purchase', amount: '$1K–15K', transactionDate: '2026-04-10', disclosureDate: '2026-04-21' },

  // Steve Cohen
  { politician: 'Steve Cohen', party: 'D', chamber: 'house', state: 'TN', ticker: 'N/A', assetName: 'Undisclosed Asset', type: 'Sale', amount: '$1K–15K', transactionDate: '2026-03-16', disclosureDate: '2026-04-27' },

  // Laura Friedman
  { politician: 'Laura Friedman', party: 'D', chamber: 'house', state: 'CA', ticker: 'ABT', assetName: 'Abbott Laboratories', type: 'Exchange', amount: '$1K–15K', transactionDate: '2026-03-24', disclosureDate: '2026-04-20' },

  // Bill Keating
  { politician: 'Bill Keating', party: 'D', chamber: 'house', state: 'MA', ticker: 'N/A', assetName: 'US Treasury Bills', type: 'Purchase', amount: '$50K–100K', transactionDate: '2026-03-26', disclosureDate: '2026-04-14' },
]

export async function seedDatabase(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0
  let skipped = 0

  const now = Date.now()

  // Collect unique politicians
  const politicianMap = new Map<string, typeof SEED_TRADES[0]>()
  for (const t of SEED_TRADES) {
    if (!politicianMap.has(t.politician)) politicianMap.set(t.politician, t)
  }

  // Upsert politicians
  for (const [name, t] of politicianMap) {
    const id = slugify(name)
    await db.insert(politicians).values({
      id,
      name,
      chamber: t.chamber,
      state: t.state,
      party: t.party,
      createdAt: now,
    }).onConflictDoNothing()
  }

  // Upsert trades
  for (const t of SEED_TRADES) {
    const politicianId = slugify(t.politician)
    const ticker = t.ticker === 'N/A' ? t.assetName.slice(0, 8).toUpperCase() : t.ticker
    const id = hash(`${t.chamber}|${politicianId}|${ticker}|${t.transactionDate}|${t.type}|${t.amount}`)
    const [low, high] = amountToRange(t.amount)

    const result = await db.insert(trades).values({
      id,
      politicianId,
      ticker: ticker.toUpperCase(),
      assetName: t.assetName,
      assetType: 'Stock',
      transactionType: t.type,
      transactionDate: t.transactionDate,
      disclosureDate: t.disclosureDate,
      amountRangeLow: low,
      amountRangeHigh: high,
      chamber: t.chamber,
      rawJson: JSON.stringify(t),
      createdAt: now,
    }).onConflictDoNothing()

    const affected = (result as unknown as { rowsAffected?: number })?.rowsAffected
    if (affected === 0) {
      skipped++
    } else {
      inserted++
    }
  }

  return { inserted, skipped }
}
