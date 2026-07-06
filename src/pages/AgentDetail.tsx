import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { AgentDetail } from '../types/agent-detail'
import { getJson, UnauthenticatedError, NotImplementedError } from '../lib/api'
import { signInUrl } from '../lib/auth'
import { resolveEffectiveStatus } from '../lib/effectiveStatus'
import { formatRelativeShort } from '../lib/timeAgo'

/**
 * Single-agent detail — mirrors `AgentDetailActivity` on Android.
 * Header: status pill + relative timestamp.  Body: markdown (rendered as
 * a preserving-whitespace block — full markdown renderer is a separate
 * track).  Trailing sections: pending nmsg + recent nmsg.
 */
export default function AgentDetailPage() {
  const { serverId = '', name = '' } = useParams()
  const [detail, setDetail] = useState<AgentDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unauthed, setUnauthed] = useState(false)
  const [pendingBackend, setPendingBackend] = useState(false)

  useEffect(() => {
    const path = `/api/agent-detail?server=${encodeURIComponent(serverId)}&name=${encodeURIComponent(name)}`
    getJson<AgentDetail>(path)
      .then(setDetail)
      .catch((e) => {
        if (e instanceof UnauthenticatedError) setUnauthed(true)
        else if (e instanceof NotImplementedError) setPendingBackend(true)
        else setError(e.message)
      })
  }, [serverId, name])

  if (unauthed)
    return (
      <main className="page">
        <a href={signInUrl()} className="btn">Sign in</a>
      </main>
    )
  if (pendingBackend)
    return (
      <main className="page">
        <p style={{ marginTop: 0 }}><Link to="/">← Agents</Link></p>
        <h1 style={{ marginBottom: 4 }}>{name}</h1>
        <p className="muted">
          Wiki 백엔드 <code>/api/agent-detail</code> 미구현 — wiki cc 대기 중.
        </p>
      </main>
    )
  if (error) return <main className="page">Error: {error}</main>
  if (!detail) return <main className="page">Loading {name}…</main>

  const eff = resolveEffectiveStatus(detail.status, detail.updatedAt)

  return (
    <main className="page">
      <p style={{ marginTop: 0 }}><Link to="/">← Agents</Link></p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <span className={`status-glyph st-${eff}`} style={{ fontSize: 22 }}>
          {statusGlyph(eff)}
        </span>
        <h1 style={{ margin: 0, flex: 1 }}>{detail.name}</h1>
        <span className={`chip ${eff === 'wip' ? 'chip-primary' : ''}`}>{eff}</span>
        <span className="muted" style={{ fontSize: 12 }}>
          {formatRelativeShort(detail.updatedAt)}
        </span>
      </div>
      {detail.summary && <p className="muted" style={{ marginTop: 6 }}>{detail.summary}</p>}
      <pre className="markdown" style={{ marginTop: 12 }}>
        {detail.content || '(no body)'}
      </pre>
      {(detail.nmsgPending?.length ?? 0) > 0 && (
        <>
          <h2 style={{ fontSize: 14, marginTop: 24, marginBottom: 4 }}>Pending nmsg</h2>
          <div className="list-card">
            {detail.nmsgPending!.map((m) => (
              <div className="list-row" key={m.file}>
                <div className="list-row-head">
                  <span className={`chip ${m.state === 'requires_human' ? 'chip-primary' : ''}`}>
                    {m.state}
                  </span>
                  <span className="name" style={{ fontSize: 13, fontWeight: 500 }}>
                    {m.title || m.file}
                  </span>
                </div>
                {m.note && <div className="list-row-body">{m.note}</div>}
              </div>
            ))}
          </div>
        </>
      )}
      {(detail.nmsgRecent?.length ?? 0) > 0 && (
        <>
          <h2 style={{ fontSize: 14, marginTop: 24, marginBottom: 4 }}>Recent nmsg</h2>
          <div className="list-card">
            {detail.nmsgRecent!.map((m) => (
              <div className="list-row" key={m.file}>
                <div className="list-row-head">
                  <span className="chip">{m.state}</span>
                  <span className="name" style={{ fontSize: 13, fontWeight: 500 }}>
                    {m.title || m.file}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}

function statusGlyph(status: string): string {
  switch (status.toLowerCase()) {
    case 'stale': return '○'
    case 'done': return '✓'
    case 'fail': return '✗'
    default: return '●'
  }
}
