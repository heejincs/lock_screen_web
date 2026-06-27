/**
 * Mirrors `agent-screen-widget/.../data/EffectiveStatus.kt`.
 * wip + (now - timestamp) > 15min ⇒ "stale" — guards against stuck wip
 * when a cc session was killed before the Stop hook fired.
 *
 * Pure: no IO, no Date.now() inside (caller passes `now` so tests can
 * pin time).  See `EffectiveStatusTest.kt` for the case matrix.
 */
import type { AgentStatus } from '../types/agent-list'

export const STALE_WIP_THRESHOLD_MIN = 15

/**
 * Resolve the on-screen status from raw status + last-update timestamp.
 *
 * @param raw status as the server reports it
 * @param timestampIso ISO 8601 from the same record (may be blank/bad)
 * @param now milliseconds since epoch — defaults to Date.now()
 * @returns same as raw, or 'stale' when wip is older than the threshold
 * @example
 *   resolve('wip', '2026-06-27T08:00:00+09:00', Date.parse('2026-06-27T09:00:00+09:00'))
 *   // => 'stale'
 */
export function resolveEffectiveStatus(
  raw: AgentStatus | string,
  timestampIso: string,
  now: number = Date.now(),
): AgentStatus {
  const lower = (raw ?? '').toLowerCase() as AgentStatus
  if (lower !== 'wip') return lower as AgentStatus
  if (!timestampIso) return lower
  const parsed = Date.parse(timestampIso)
  if (Number.isNaN(parsed)) return lower
  const ageMin = Math.floor((now - parsed) / 60_000)
  return ageMin > STALE_WIP_THRESHOLD_MIN ? 'stale' : lower
}
