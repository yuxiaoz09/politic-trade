import { XMLParser } from 'fast-xml-parser'
import { getCurrentYear, hashRecord } from '../utils'
import { normalizeHouseTrade, NormalizedTrade, NormalizedPolitician } from './normalize'

const HOUSE_BASE = 'https://disclosures.house.gov/public_disc/ptr-pdfs'

// Browser-like headers that the House Clerk allows
const HOUSE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://disclosures.house.gov/FinancialDisclosure',
}

interface HouseResult {
  trades: NormalizedTrade[]
  politicians: NormalizedPolitician[]
  hash: string
}

export async function fetchHousePTR(): Promise<HouseResult> {
  const year = getCurrentYear()

  for (const y of [year, year - 1]) {
    const url = `${HOUSE_BASE}/${y}FDptr.zip`
    console.log(`[house] Trying ${url}`)
    try {
      const res = await fetch(url, {
        headers: HOUSE_HEADERS,
        signal: AbortSignal.timeout(45_000),
      })
      if (res.ok) {
        console.log(`[house] Got ${y} PTR zip (${res.headers.get('content-length')} bytes)`)
        return parseHouseZip(await res.arrayBuffer())
      }
      console.warn(`[house] ${y} returned ${res.status}`)
    } catch (e) {
      console.error(`[house] Fetch error for ${y}:`, e)
    }
  }

  throw new Error('[house] All PTR zip URLs failed')
}

async function parseHouseZip(buffer: ArrayBuffer): Promise<HouseResult> {
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
        if (!fileName.endsWith('.xml')) { entry.autodrain(); return }

        const chunks: Buffer[] = []
        entry.on('data', (chunk: Buffer) => chunks.push(chunk))
        entry.on('end', () => {
          try {
            const parsed = parseHouseXML(Buffer.concat(chunks).toString('utf-8'))
            for (const result of parsed) {
              if (!result) continue
              trades.push(result.trade)
              if (!seenPoliticians.has(result.politician.id)) {
                politicians.push(result.politician)
                seenPoliticians.add(result.politician.id)
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

  const disclosures =
    doc?.FinancialDisclosure?.Transactions?.Transaction ??
    doc?.NewDataSet?.Financial_Disclosure ??
    doc?.Transactions?.Transaction ??
    []

  const arr = Array.isArray(disclosures) ? disclosures : [disclosures]
  return arr.map((item: Record<string, unknown>) => {
    const raw: Record<string, string> = {}
    for (const [k, v] of Object.entries(item)) raw[k] = String(v ?? '')
    return normalizeHouseTrade(raw)
  })
}
