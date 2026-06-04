import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

const rawUrl = process.env.DATABASE_URL ?? 'file:politic-trade.db'

// For Turso cloud URLs (libsql:// or https://), pass the auth token
// For local file URLs, no token needed
const url = rawUrl.startsWith('file:') || rawUrl.startsWith('./') || rawUrl.startsWith('/')
  ? rawUrl.startsWith('file:') ? rawUrl : `file:${rawUrl}`
  : rawUrl

const authToken = process.env.DATABASE_AUTH_TOKEN

const client = createClient(authToken ? { url, authToken } : { url })

export const db = drizzle(client, { schema })
export { client as sqlite }
