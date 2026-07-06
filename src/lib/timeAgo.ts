/**
 * Compact "Xs / Xm / Xh / Xd" relative timestamp — mirrors Android's
 * `formatRelativeShort` in MainActivity.kt so widget rows read the same
 * on web and phone.  Returns "" for unparseable input.
 */
export function formatRelativeShort(iso: string, now: number = Date.now()): string {
  if (!iso) return ''
  const parsed = Date.parse(iso)
  if (Number.isNaN(parsed)) return ''
  const secs = Math.floor((now - parsed) / 1000)
  if (secs < 0) return ''
  if (secs < 60) return `${secs}s`
  if (secs < 3600) return `${Math.floor(secs / 60)}m`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`
  return `${Math.floor(secs / 86400)}d`
}
