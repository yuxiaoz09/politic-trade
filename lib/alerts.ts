import { getAllActiveSubscriptions } from './db/queries/subscriptions'
import { checkDelivered, recordDelivery } from './db/queries/alerts'
import { getTradeById } from './db/queries/trades'
import { db } from './db/index'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'
import { formatAmountRange, formatDate } from './utils'

function getResend() {
  const { Resend } = require('resend')
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = process.env.RESEND_FROM ?? 'alerts@politic-trade.com'

export async function deliverAlerts(tradeIds: string[]) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[alerts] RESEND_API_KEY not set — skipping email delivery')
    return
  }

  const subscriptions = await getAllActiveSubscriptions()
  if (subscriptions.length === 0) return

  for (const tradeId of tradeIds) {
    const row = await getTradeById(tradeId)
    if (!row) continue
    const { trade, politician } = row

    for (const sub of subscriptions) {
      // Check filter match
      if (!matchesSubscription(sub, trade, politician?.name ?? '')) continue

      // Idempotency check
      const alreadySent = await checkDelivered(sub.id, tradeId)
      if (alreadySent) continue

      // Get user email
      const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, sub.userId)).limit(1)
      if (!user) continue

      const side = trade.transactionType.toLowerCase().includes('sale') ? 'SOLD' : 'BOUGHT'
      const amount = formatAmountRange(trade.amountRangeLow, trade.amountRangeHigh)
      const subject = `[politic-trade] ${politician?.name ?? 'A politician'} ${side} ${trade.ticker} (${amount})`

      try {
        const resend = getResend()
        await resend.emails.send({
          from: FROM,
          to: user.email,
          subject,
          html: buildEmailHtml({ trade, politician: politician ?? null, side, amount }),
        })
        await recordDelivery(sub.id, tradeId, 'sent')
        console.log(`[alerts] Sent to ${user.email}: ${subject}`)
      } catch (e) {
        console.error(`[alerts] Failed to send to ${user.email}:`, e)
        await recordDelivery(sub.id, tradeId, 'failed')
      }
    }
  }
}

function matchesSubscription(sub: { type: string; filterValue: string | null }, trade: { ticker: string; chamber: string; politicianId: string }, politicianName: string): boolean {
  switch (sub.type) {
    case 'all': return true
    case 'chamber': return trade.chamber === sub.filterValue
    case 'ticker': return trade.ticker.toUpperCase() === sub.filterValue?.toUpperCase()
    case 'politician': return trade.politicianId === sub.filterValue || politicianName.toLowerCase().includes((sub.filterValue ?? '').toLowerCase())
    default: return false
  }
}

function buildEmailHtml({ trade, politician, side, amount }: {
  trade: { ticker: string; assetName: string; transactionDate: string; disclosureDate: string; chamber: string }
  politician: { name: string } | null
  side: string
  amount: string
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const sideColor = side === 'SOLD' ? '#f43f5e' : '#10b981'

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Geist Mono',monospace;color:#fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <tr><td>
      <p style="font-size:11px;letter-spacing:0.1em;color:#71717a;margin:0 0 24px;">POLITIC-TRADE ALERT</p>
      <h1 style="font-size:22px;font-weight:700;margin:0 0 24px;color:#fafafa;">New Trade Disclosure</h1>
      <table width="100%" style="border-collapse:collapse;border:1px solid #27272a;border-radius:8px;overflow:hidden;">
        <tr style="background:#18181b;">
          <td style="padding:12px 16px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Politician</td>
          <td style="padding:12px 16px;font-size:14px;font-weight:600;">${politician?.name ?? 'Unknown'}</td>
        </tr>
        <tr style="border-top:1px solid #27272a;">
          <td style="padding:12px 16px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Action</td>
          <td style="padding:12px 16px;"><span style="color:${sideColor};font-weight:700;font-size:13px;">${side}</span></td>
        </tr>
        <tr style="border-top:1px solid #27272a;">
          <td style="padding:12px 16px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Ticker</td>
          <td style="padding:12px 16px;font-size:16px;font-weight:700;letter-spacing:0.05em;">${trade.ticker}</td>
        </tr>
        <tr style="border-top:1px solid #27272a;">
          <td style="padding:12px 16px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Asset</td>
          <td style="padding:12px 16px;font-size:13px;">${trade.assetName}</td>
        </tr>
        <tr style="border-top:1px solid #27272a;">
          <td style="padding:12px 16px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Amount</td>
          <td style="padding:12px 16px;font-size:14px;font-weight:600;">${amount}</td>
        </tr>
        <tr style="border-top:1px solid #27272a;">
          <td style="padding:12px 16px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Trade Date</td>
          <td style="padding:12px 16px;font-size:13px;">${formatDate(trade.transactionDate)}</td>
        </tr>
        <tr style="border-top:1px solid #27272a;">
          <td style="padding:12px 16px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Disclosed</td>
          <td style="padding:12px 16px;font-size:13px;">${formatDate(trade.disclosureDate)}</td>
        </tr>
        <tr style="border-top:1px solid #27272a;">
          <td style="padding:12px 16px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Chamber</td>
          <td style="padding:12px 16px;font-size:13px;text-transform:capitalize;">${trade.chamber}</td>
        </tr>
      </table>
      <div style="text-align:center;margin:32px 0;">
        <a href="${appUrl}/feed" style="display:inline-block;background:#fafafa;color:#09090b;text-decoration:none;padding:12px 32px;font-size:13px;font-weight:700;border-radius:6px;letter-spacing:0.02em;">VIEW TRADE →</a>
      </div>
      <p style="font-size:11px;color:#52525b;text-align:center;margin-top:32px;">
        You're receiving this because you subscribed to politic-trade alerts.<br>
        <a href="${appUrl}/alerts" style="color:#71717a;">Manage subscriptions</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`
}
