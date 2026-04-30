import { db } from '../index'
import { politicians, trades } from '../schema'
import { eq, like, desc, sql } from 'drizzle-orm'

export async function getPoliticians(search?: string) {
  const rows = await db
    .select({
      politician: politicians,
      tradeCount: sql<number>`count(${trades.id}) as trade_count`,
    })
    .from(politicians)
    .leftJoin(trades, eq(politicians.id, trades.politicianId))
    .where(search ? like(politicians.name, `%${search}%`) : undefined)
    .groupBy(politicians.id)
    .orderBy(desc(sql`trade_count`))

  return rows
}

export async function getPoliticianById(id: string) {
  const rows = await db
    .select()
    .from(politicians)
    .where(eq(politicians.id, id))
    .limit(1)
  return rows[0] ?? null
}

export async function upsertPolitician(p: typeof politicians.$inferInsert) {
  const existing = await db.select({ id: politicians.id }).from(politicians).where(eq(politicians.id, p.id)).limit(1)
  if (existing.length === 0) {
    await db.insert(politicians).values(p)
  } else {
    await db.update(politicians).set({ name: p.name, chamber: p.chamber, state: p.state, party: p.party }).where(eq(politicians.id, p.id))
  }
}
