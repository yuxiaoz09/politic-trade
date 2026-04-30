import { db } from '../index'
import { alertSubscriptions } from '../schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from '../../../lib/utils'

export async function getUserSubscriptions(userId: string) {
  return db.select().from(alertSubscriptions).where(eq(alertSubscriptions.userId, userId))
}

export async function createSubscription(data: {
  userId: string
  type: string
  filterValue?: string
  channel?: string
}) {
  const id = nanoid()
  await db.insert(alertSubscriptions).values({
    id,
    userId: data.userId,
    type: data.type,
    filterValue: data.filterValue ?? null,
    channel: data.channel ?? 'email',
    active: 1,
    createdAt: Date.now(),
  })
  return id
}

export async function deleteSubscription(id: string, userId: string) {
  await db.delete(alertSubscriptions).where(and(eq(alertSubscriptions.id, id), eq(alertSubscriptions.userId, userId)))
}

export async function toggleSubscription(id: string, userId: string, active: boolean) {
  await db
    .update(alertSubscriptions)
    .set({ active: active ? 1 : 0 })
    .where(and(eq(alertSubscriptions.id, id), eq(alertSubscriptions.userId, userId)))
}

export async function getAllActiveSubscriptions() {
  return db.select().from(alertSubscriptions).where(eq(alertSubscriptions.active, 1))
}
