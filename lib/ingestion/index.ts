import { db } from '../db/index'
import { ingestionState } from '../db/schema'
import { upsertPolitician } from '../db/queries/politicians'
import { upsertTrades } from '../db/queries/trades'
import { eq } from 'drizzle-orm'
import { fetchHousePTR } from './house'
import { fetchSenatePTR } from './senate'

let isRunning = false

export async function runIngestion(): Promise<{ newTrades: string[] }> {
  if (isRunning) {
    console.log('[ingestion] Already running, skipping')
    return { newTrades: [] }
  }
  isRunning = true

  const allNewTrades: string[] = []

  try {
    // --- House ---
    await runHouseIngestion(allNewTrades)
  } catch (e) {
    console.error('[ingestion] House error:', e)
  }

  try {
    // --- Senate ---
    await runSenateIngestion(allNewTrades)
  } catch (e) {
    console.error('[ingestion] Senate error:', e)
  }

  console.log(`[ingestion] Done. New trades: ${allNewTrades.length}`)
  return { newTrades: allNewTrades }
}

async function runHouseIngestion(allNewTrades: string[]) {
  const [state] = await db.select().from(ingestionState).where(eq(ingestionState.source, 'house')).limit(1)
  const { trades, politicians, hash } = await fetchHousePTR()

  if (state?.lastHash === hash) {
    console.log('[house] No changes detected')
    await db.update(ingestionState).set({ lastRunAt: Date.now() }).where(eq(ingestionState.source, 'house'))
    return
  }

  // Upsert politicians first
  for (const politician of politicians) {
    await upsertPolitician({ ...politician, createdAt: Date.now() })
  }

  const newIds = await upsertTrades(trades)
  allNewTrades.push(...newIds)
  console.log(`[house] Inserted ${newIds.length} new trades`)

  // Update ingestion state
  if (state) {
    await db.update(ingestionState).set({ lastRunAt: Date.now(), lastHash: hash }).where(eq(ingestionState.source, 'house'))
  } else {
    await db.insert(ingestionState).values({ source: 'house', lastRunAt: Date.now(), lastHash: hash })
  }
}

async function runSenateIngestion(allNewTrades: string[]) {
  const { trades, politicians, lastSeenDate } = await fetchSenatePTR(7)

  for (const politician of politicians) {
    await upsertPolitician({ ...politician, createdAt: Date.now() })
  }

  const newIds = await upsertTrades(trades)
  allNewTrades.push(...newIds)
  console.log(`[senate] Inserted ${newIds.length} new trades`)

  const [state] = await db.select().from(ingestionState).where(eq(ingestionState.source, 'senate')).limit(1)
  if (state) {
    await db.update(ingestionState).set({ lastRunAt: Date.now(), lastSeenDate }).where(eq(ingestionState.source, 'senate'))
  } else {
    await db.insert(ingestionState).values({ source: 'senate', lastRunAt: Date.now(), lastSeenDate })
  }
}
