import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const politicians = sqliteTable('politicians', {
  id: text('id').primaryKey(), // slug: "nancy-pelosi"
  name: text('name').notNull(),
  chamber: text('chamber').notNull(), // 'house' | 'senate'
  state: text('state').notNull(),
  party: text('party').notNull(), // 'D' | 'R' | 'I'
  district: text('district'),
  imageUrl: text('image_url'),
  createdAt: integer('created_at').notNull(),
})

export const trades = sqliteTable('trades', {
  id: text('id').primaryKey(), // SHA-256 deterministic hash
  politicianId: text('politician_id').notNull().references(() => politicians.id),
  ticker: text('ticker').notNull(),
  assetName: text('asset_name').notNull(),
  assetType: text('asset_type').notNull(),
  transactionType: text('transaction_type').notNull(), // 'Purchase' | 'Sale' | 'Sale (Partial)'
  transactionDate: text('transaction_date').notNull(), // ISO date YYYY-MM-DD
  disclosureDate: text('disclosure_date').notNull(),
  amountRangeLow: integer('amount_range_low').notNull(),
  amountRangeHigh: integer('amount_range_high').notNull(),
  chamber: text('chamber').notNull(), // 'house' | 'senate'
  filingUrl: text('filing_url'),
  rawJson: text('raw_json'),
  createdAt: integer('created_at').notNull(),
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  emailVerified: integer('email_verified').notNull().default(0),
  createdAt: integer('created_at').notNull(),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at').notNull(),
})

export const alertSubscriptions = sqliteTable('alert_subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'all' | 'politician' | 'ticker' | 'chamber'
  filterValue: text('filter_value'), // null for 'all'
  channel: text('channel').notNull().default('email'),
  active: integer('active').notNull().default(1),
  createdAt: integer('created_at').notNull(),
}, (t) => ({
  uniq: uniqueIndex('alert_subscriptions_uniq').on(t.userId, t.type, t.filterValue),
}))

export const alertDeliveries = sqliteTable('alert_deliveries', {
  id: text('id').primaryKey(),
  subscriptionId: text('subscription_id').notNull().references(() => alertSubscriptions.id),
  tradeId: text('trade_id').notNull().references(() => trades.id),
  sentAt: integer('sent_at').notNull(),
  status: text('status').notNull(), // 'sent' | 'failed'
}, (t) => ({
  uniq: uniqueIndex('alert_deliveries_uniq').on(t.subscriptionId, t.tradeId),
}))

export const ingestionState = sqliteTable('ingestion_state', {
  source: text('source').primaryKey(), // 'house' | 'senate'
  lastRunAt: integer('last_run_at'),
  lastHash: text('last_hash'),
  lastSeenDate: text('last_seen_date'),
})

export type Politician = typeof politicians.$inferSelect
export type Trade = typeof trades.$inferSelect
export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
export type AlertSubscription = typeof alertSubscriptions.$inferSelect
export type AlertDelivery = typeof alertDeliveries.$inferSelect
export type IngestionState = typeof ingestionState.$inferSelect
