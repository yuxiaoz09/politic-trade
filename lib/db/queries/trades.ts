import { db } from '../index'
import { trades, politicians } from '../schema'
import { eq, desc, and, gte, lte, like, sql } from 'drizzle-orm'

export interface TradeFilters {
  chamber?: string
  politician?: string
  ticker?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

export async function getTrades(filters: TradeFilters = {}) {
  const { chamber, politician, ticker, from, to, page = 1, limit = 50 } = filters
  const offset = (page - 1) * limit

  const conditions = []
  if (chamber) conditions.push(eq(trades.chamber, chamber))
  if (politician) conditions.push(eq(trades.politicianId, politician))
  if (ticker) conditions.push(like(trades.ticker, `%${ticker.toUpperCase()}%`))
  if (from) conditions.push(gte(trades.transactionDate, from))
  if (to) conditions.push(lte(trades.transactionDate, to))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const rows = await db
    .select({
      trade: trades,
      politician: politicians,
    })
    .from(trades)
    .leftJoin(politicians, eq(trades.politicianId, politicians.id))
    .where(where)
    .orderBy(desc(trades.disclosureDate), desc(trades.createdAt))
    .limit(limit)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(trades)
    .where(where)

  return { rows, total: Number(count), page, limit }
}

export async function getTradeById(id: string) {
  const rows = await db
    .select({ trade: trades, politician: politicians })
    .from(trades)
    .leftJoin(politicians, eq(trades.politicianId, politicians.id))
    .where(eq(trades.id, id))
    .limit(1)
  return rows[0] ?? null
}

export async function upsertTrades(newTrades: (typeof trades.$inferInsert)[]) {
  if (newTrades.length === 0) return []
  const inserted: string[] = []
  for (const trade of newTrades) {
    const existing = await db.select({ id: trades.id }).from(trades).where(eq(trades.id, trade.id)).limit(1)
    if (existing.length === 0) {
      await db.insert(trades).values(trade)
      inserted.push(trade.id)
    }
  }
  return inserted
}

export async function getRecentTrades(limit = 10) {
  return db
    .select({ trade: trades, politician: politicians })
    .from(trades)
    .leftJoin(politicians, eq(trades.politicianId, politicians.id))
    .orderBy(desc(trades.createdAt))
    .limit(limit)
}

export async function getTradeStats() {
  const [weekCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(trades)
    .where(gte(trades.createdAt, Date.now() - 7 * 24 * 60 * 60 * 1000))

  const [totalCount] = await db.select({ count: sql<number>`count(*)` }).from(trades)

  const topTicker = await db
    .select({ ticker: trades.ticker, count: sql<number>`count(*) as cnt` })
    .from(trades)
    .groupBy(trades.ticker)
    .orderBy(sql`cnt desc`)
    .limit(1)

  return {
    thisWeek: Number(weekCount.count),
    total: Number(totalCount.count),
    topTicker: topTicker[0]?.ticker ?? null,
  }
}
