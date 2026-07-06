import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AgentList } from '../types/agent-list'
import { getJson, UnauthenticatedError, NotImplementedError } from '../lib/api'
import { resolveEffectiveStatus } from '../lib/effectiveStatus'
import { signInUrl } from '../lib/auth'
import { formatRelativeShort } from '../lib/timeAgo'

/**
 * Flat list of every agent, newest-first by updatedAt.  Mirrors the
 * Android `MainActivity > Agents tab` (docs/view_separation.md §6.2).
 * GPU strip renders when the server reports `gpuAvg20m` — silent
 * otherwise.
 */
export default function AgentsList() {
  const [list, setList] = useState<AgentList | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unauthed, setUnauthed] = useState(false)
  const [pendingBackend, setPendingBackend] = useState(false)

  useEffect(() => {
    getJson<AgentList>('/api/agent-list')
      .then(setList)
      .catch((e) => {
        if (e instanceof UnauthenticatedError) setUnauthed(true)
        else if (e instanceof NotImplementedError) setPendingBackend(true)
        else setError(e.message)
      })
  }, [])

  if (unauthed) {
    return (
      <main className="page">
        <p>Sign in to view your agents.</p>
        <a href={signInUrl()} className="btn">Sign in with Google</a>
      </main>
    )
  }
  if (pendingBackend) {
    return (
      <main className="page">
        <GpuBar list={list} />
        <p className="muted">
          Wiki 백엔드 <code>/api/agent-list</code> 미구현 — wiki cc 대기 중.
        </p>
      </main>
    )
  }
  if (error) return <main className="page"><GpuBar list={list} />Error: {error}</main>
  if (!list) return <main className="page">Loading…</main>
  if (list.agents.length === 0)
    return (
      <main className="page">
        <GpuBar list={list} />
        <p className="muted">No agents yet.</p>
      </main>
    )

  return (
    <main className="page">
      <GpuBar list={list} />
      <div className="list-card">
        {list.agents.map((a) => {
          const status = resolveEffectiveStatus(a.status, a.updatedAt)
          return (
            <Link
              className="list-row"
              key={`${a.serverId}|${a.name}`}
              to={`/agent/${encodeURIComponent(a.serverId)}/${encodeURIComponent(a.name)}`}
            >
              <div className="list-row-head">
                <span className={`status-glyph st-${status}`}>{statusGlyph(status)}</span>
                <span className="name">{a.name}</span>
                <span className="timestamp">{formatRelativeShort(a.updatedAt)}</span>
              </div>
              <div className="list-row-body">
                {a.summary || '(no status)'}
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}

function GpuBar({ list }: { list: AgentList | null }) {
  if (!list || list.gpuAvg20m == null) return null
  const pct = list.gpuAvg20m
  const tone = pct >= 80 ? 'gpu-pct-hot' : pct >= 40 ? 'gpu-pct-warm' : 'gpu-pct-ok'
  return (
    <div className="gpu-strip">
      <span className="gpu-label">GPU</span>
      <span className="gpu-chip">
        <span>main</span>
        <span className={`gpu-pct ${tone}`}>{Math.round(pct)}%</span>
      </span>
      <span>20m avg</span>
    </div>
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
