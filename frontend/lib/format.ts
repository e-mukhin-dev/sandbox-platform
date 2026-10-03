const absoluteFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

const relativeFormatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

export function formatAbsolute(iso: string): string {
  return absoluteFormatter.format(new Date(iso))
}

export function formatRelative(iso: string, now = Date.now()): string {
  const diffSeconds = Math.round((new Date(iso).getTime() - now) / 1000)
  const abs = Math.abs(diffSeconds)
  if (abs < 45) return 'just now'
  if (abs < 3600) return relativeFormatter.format(Math.round(diffSeconds / 60), 'minute')
  if (abs < 86400) return relativeFormatter.format(Math.round(diffSeconds / 3600), 'hour')
  if (abs < 86400 * 7) return relativeFormatter.format(Math.round(diffSeconds / 86400), 'day')
  return shortDateFormatter.format(new Date(iso))
}

export function formatElapsed(iso: string, now = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000))
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
