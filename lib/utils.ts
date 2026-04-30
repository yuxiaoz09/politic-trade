import crypto from 'crypto'

export function nanoid(): string {
  return crypto.randomBytes(16).toString('hex')
}

export function hashRecord(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** Parse House amount ranges like "$1,001 - $15,000" → [1001, 15000] */
export function parseAmountRange(raw: string): [number, number] {
  const clean = raw.replace(/[$,\s]/g, '')
  const parts = clean.split('-')
  if (parts.length >= 2) {
    return [parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0]
  }
  const val = parseInt(clean, 10) || 0
  return [val, val]
}

/** Format amount range for display */
export function formatAmountRange(low: number, high: number): string {
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${n}`
  }
  if (low === high) return fmt(low)
  return `${fmt(low)}–${fmt(high)}`
}

/** Format ISO date string nicely */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Get two-digit year range for House PTR fetching */
export function getCurrentYear(): number {
  return new Date().getFullYear()
}

/** ISO date string N days ago */
export function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}
