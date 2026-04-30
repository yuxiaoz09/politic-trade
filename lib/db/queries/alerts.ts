import { db } from '../index'
import { alertDeliveries } from '../schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from '../../../lib/utils'

export async function checkDelivered(subscriptionId: string, tradeId: string): Promise<boolean> {
  const rows = await db
    .select({ id: alertDeliveries.id })
    .from(alertDeliveries)
    .where(and(eq(alertDeliveries.subscriptionId, subscriptionId), eq(alertDeliveries.tradeId, tradeId)))
    .limit(1)
  return rows.length > 0
}

export async function recordDelivery(subscriptionId: string, tradeId: string, status: 'sent' | 'failed') {
  await db.insert(alertDeliveries).values({
    id: nanoid(),
    subscriptionId,
    tradeId,
    sentAt: Date.now(),
    status,
  }).onConflictDoNothing()
}
