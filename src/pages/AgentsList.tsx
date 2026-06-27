import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AgentList } from '../types/agent-list'
import { getJson, UnauthenticatedError } from '../lib/api'
import { resolveEffectiveStatus } from '../lib/effectiveStatus'
import { signInUrl } from '../lib/auth'

/**
 * Flat list of every agent across every server the user has access to,
 * newest-first by updatedAt.  Mirrors `MainActivity > Agents tab`
 * (`view_separation.md` §6.2 row 1).
 *
 * Server endpoint NOT yet implemented (wiki cc work).  Currently calls
 * `/api/agent-list` which 404s — the page renders the empty state and
 * a link to the wiki sign-in if the call is 401.
 */
export default function AgentsList() {
  const [list, setList] = useState<AgentList | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unauthed, setUnauthed] = useState(false)

  useEffect(() => {
    getJson<AgentList>('/api/agent-list')
      .then(setList)
      .catch((e) => {
        if (e instanceof UnauthenticatedError) setUnauthed(true)
        else setError(e.message)
      })
  }, [])

  if (unauthed) {
    return (
      <main style={{ padding: 16 }}>
        <p>Sign in to view your agents.</p>
        <a href={signInUrl()}>Sign in with Google</a>
      </main>
    )
  }
  if (error) return <main style={{ padding: 16 }}>Error: {error}</main>
  if (!list) return <main style={{ padding: 16 }}>Loading…</main>
  if (list.agents.length === 0)
    return <main style={{ padding: 16 }}>No agents yet.</main>

  return (
    <main style={{ padding: 16 }}>
      <h1>Agents</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {list.agents.map((a) => {
          const status = resolveEffectiveStatus(a.status, a.updatedAt)
          return (
            <li key={`${a.serverId}|${a.name}`} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <Link to={`/agent/${encodeURIComponent(a.serverId)}/${encodeURIComponent(a.name)}`}>
                <span>{statusGlyph(status)}</span> <strong>{a.name}</strong>
              </Link>
              <div style={{ color: '#666', fontSize: 13 }}>{a.summary || '(no status)'}</div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}

/** Matches the Android `statusGlyph` in MainActivity.kt — keep in sync. */
function statusGlyph(status: string): string {
  switch (status.toLowerCase()) {
    case 'stale': return '○'
    case 'done': return '✓'
    case 'fail': return '✗'
    default: return '●'
  }
}
