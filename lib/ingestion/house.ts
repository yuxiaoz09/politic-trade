import { XMLParser } from 'fast-xml-parser'
import { getCurrentYear, hashRecord } from '../utils'
import { normalizeHouseTrade, NormalizedTrade, NormalizedPolitician } from './normalize'

const HOUSE_BASE = 'https://disclosures.house.gov/public_disc/ptr-pdfs'

interface HouseResult {
  trades: NormalizedTrade[]
  politicians: NormalizedPolitician[]
  hash: string
}

export async function fetchHousePTR(): Promise<HouseResult> {
  const year = getCurrentYear()
  const url = `${HOUSE_BASE}/${year}FDptr.zip`

  console.log(`[house] Fetching ${url}`)
  const res = await fetch(url, {
    headers: { 'User-Agent': 'politic-trade/1.0 (public data aggregator)' },
    signal: AbortSignal.timeout(30_000),
  })

  if (!res.ok) {
    // Try previous year as fallback
    const prevUrl = `${HOUSE_BASE}/${year - 1}FDptr.zip`
    console.warn(`[house] ${year} not found, trying ${year - 1}`)
    const prevRes = await fetch(prevUrl, { headers: { 'User-Agent': 'politic-trade/1.0' }, signal: AbortSignal.timeout(30_000) })
    if (!prevRes.ok) throw new Error(`House PTR fetch failed: ${res.status}`)
    return parseHouseZip(await prevRes.arrayBuffer())
  }

  return parseHouseZip(await res.arrayBuffer())
}

async function parseHouseZip(buffer: ArrayBuffer): Promise<HouseResult> {
  // Dynamically import unzipper only on server
  const { default: unzipper } = await import('unzipper')
  const { Readable } = await import('stream')

  const nodeBuffer = Buffer.from(buffer)
  const hash = hashRecord(nodeBuffer.toString('base64').slice(0, 10000))

  const trades: NormalizedTrade[] = []
  const politicians: NormalizedPolitician[] = []
  const seenPoliticians = new Set<string>()

  return new Promise((resolve, reject) => {
    Readable.from(nodeBuffer)
      .pipe(unzipper.Parse())
      .on('entry', (entry: import('unzipper').Entry) => {
        const fileName = entry.path
        if (!fileName.endsWith('.xml')) {
          entry.autodrain()
          return
        }

        const chunks: Buffer[] = []
        entry.on('data', (chunk: Buffer) => chunks.push(chunk))
        entry.on('end', () => {
          try {
            const xml = Buffer.concat(chunks).toString('utf-8')
            const parsed = parseHouseXML(xml)
            for (const result of parsed) {
              if (result) {
                trades.push(result.trade)
                if (!seenPoliticians.has(result.politician.id)) {
                  politicians.push(result.politician)
                  seenPoliticians.add(result.politician.id)
                }
              }
            }
          } catch (e) {
            console.error(`[house] Error parsing ${fileName}:`, e)
          }
        })
      })
      .on('finish', () => resolve({ trades, politicians, hash }))
      .on('error', reject)
  })
}

function parseHouseXML(xml: string) {
  const parser = new XMLParser({ ignoreAttributes: false, parseAttributeValue: true })
  const doc = parser.parse(xml)

  // Different XML schemas exist; try common structures
  const disclosures = doc?.FinancialDisclosure?.Transactions?.Transaction
    ?? doc?.NewDataSet?.Financial_Disclosure
    ?? doc?.Transactions?.Transaction
    ?? []

  const arr = Array.isArray(disclosures) ? disclosures : [disclosures]
  return arr.map((item: Record<string, unknown>) => {
    const raw: Record<string, string> = {}
    for (const [k, v] of Object.entries(item)) {
      raw[k] = String(v ?? '')
    }
    return normalizeHouseTrade(raw)
  })
}
