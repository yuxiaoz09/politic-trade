import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

const url = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.startsWith('file:')
    ? process.env.DATABASE_URL
    : `file:${process.env.DATABASE_URL}`
  : 'file:politic-trade.db'

const client = createClient({ url })

export const db = drizzle(client, { schema })
export { client as sqlite }
