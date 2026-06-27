import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { AgentDetail } from '../types/agent-detail'
import { getJson, UnauthenticatedError } from '../lib/api'
import { signInUrl } from '../lib/auth'

/**
 * Detail page for one agent — mirrors `AgentDetailActivity` on Android.
 * Shows status, updatedAt, body (markdown), and pending nmsg list
 * (D3: per-agent nmsg integration).
 *
 * Endpoint TBD: `/api/agent-detail?server=<id>&name=<name>`.
 * Until wiki cc ships it, the page surfaces the HTTP error inline.
 */
export default function AgentDetail() {
  const { serverId = '', name = '' } = useParams()
  const [detail, setDetail] = useState<AgentDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unauthed, setUnauthed] = useState(false)

  useEffect(() => {
    const path = `/api/agent-detail?server=${encodeURIComponent(serverId)}&name=${encodeURIComponent(name)}`
    getJson<AgentDetail>(path)
      .then(setDetail)
      .catch((e) => {
        if (e instanceof UnauthenticatedError) setUnauthed(true)
        else setError(e.message)
      })
  }, [serverId, name])

  if (unauthed) return <main style={{ padding: 16 }}><a href={signInUrl()}>Sign in</a></main>
  if (error) return <main style={{ padding: 16 }}>Error: {error}</main>
  if (!detail) return <main style={{ padding: 16 }}>Loading {name}…</main>

  return (
    <main style={{ padding: 16 }}>
      <p><Link to="/">← Agents</Link></p>
      <h1>{detail.name}</h1>
      <p style={{ color: '#666' }}>{detail.status} · {detail.updatedAt}</p>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f6f6', padding: 12 }}>
        {detail.content || '(no body)'}
      </pre>
      {(detail.nmsgPending?.length ?? 0) > 0 && (
        <section>
          <h2>Pending nmsg</h2>
          <ul>
            {detail.nmsgPending!.map((m) => (
              <li key={m.file}>[{m.state}] {m.title ?? m.file}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
