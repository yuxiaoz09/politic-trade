import { db } from './db/index'
import { users, sessions } from './db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'
import { nanoid } from './utils'

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  const attempt = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(attempt, 'hex'))
}

export async function createUser(email: string, password: string) {
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) throw new Error('Email already registered')
  const id = nanoid()
  await db.insert(users).values({ id, email, passwordHash: hashPassword(password), emailVerified: 0, createdAt: Date.now() })
  return id
}

export async function loginUser(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user) throw new Error('Invalid credentials')
  if (!verifyPassword(password, user.passwordHash)) throw new Error('Invalid credentials')
  return user
}

export async function createSession(userId: string): Promise<string> {
  const id = nanoid()
  await db.insert(sessions).values({ id, userId, expiresAt: Date.now() + SESSION_TTL_MS })
  return id
}

export async function getSessionUser(sessionId: string) {
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1)
  if (!session || session.expiresAt < Date.now()) return null
  const [user] = await db.select({ id: users.id, email: users.email, createdAt: users.createdAt }).from(users).where(eq(users.id, session.userId)).limit(1)
  return user ?? null
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

export async function getUserFromRequest(req: Request): Promise<{ id: string; email: string; createdAt: number } | null> {
  const cookie = req.headers.get('cookie') ?? ''
  const match = cookie.match(/session=([^;]+)/)
  if (!match) return null
  return getSessionUser(match[1])
}
