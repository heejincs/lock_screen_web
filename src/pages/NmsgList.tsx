import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AgentList } from '../types/agent-list'
import type { AgentDetail, NmsgItem } from '../types/agent-detail'
import { getJson, UnauthenticatedError, NotImplementedError } from '../lib/api'
import { signInUrl } from '../lib/auth'

/**
 * nmsg 탭 — Android `MainActivity NmsgTab` 을 이식.  wiki 는 아직
 * 통합 `/api/nmsg-status` 를 노출하지 않으므로, `/api/agent-list` 로
 * 에이전트 이름을 받아 각 `/api/agent-detail?name=<name>` 을 병렬로
 * 호출해 `nmsgPending` 을 취합한다.  N+1 요청이지만 wiki 에이전트가
 * 십여 개 정도라 무리 없다 — 백엔드가 나중에 aggregate endpoint 를
 * 붙이면 이 파일만 스위치.
 */
export default function NmsgList() {
  const [items, setItems] = useState<NmsgRow[] | null>(null)
  const [unauthed, setUnauthed] = useState(false)
  const [pendingBackend, setPendingBackend] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const list = await getJson<AgentList>('/api/agent-list')
        const details = await Promise.all(
          list.agents.map((a) =>
            getJson<AgentDetail>(
              `/api/agent-detail?server=${encodeURIComponent(a.serverId)}&name=${encodeURIComponent(a.name)}`,
            ).catch(() => null),
          ),
        )
        const rows: NmsgRow[] = []
        for (const d of details) {
          if (!d) continue
          for (const n of d.nmsgPending ?? []) {
            rows.push({ agent: d.name, serverId: d.serverId, item: n })
          }
        }
        rows.sort((a, b) => (b.item.age_sec ?? 0) - (a.item.age_sec ?? 0))
        setItems(rows)
      } catch (e) {
        if (e instanceof UnauthenticatedError) setUnauthed(true)
        else if (e instanceof NotImplementedError) setPendingBackend(true)
        else setError((e as Error).message)
      }
    })()
  }, [])

  if (unauthed)
    return (
      <main className="page">
        <p>Sign in to see pending nmsgs.</p>
        <a href={signInUrl()} className="btn">Sign in</a>
      </main>
    )
  if (pendingBackend)
    return (
      <main className="page">
        <p className="muted">Wiki agent endpoints 대기 중.</p>
      </main>
    )
  if (error) return <main className="page">Error: {error}</main>
  if (items === null) return <main className="page">Loading…</main>

  const humanCount = items.filter((r) => r.item.state === 'requires_human').length

  if (items.length === 0)
    return (
      <main className="page">
        <p className="muted">No pending nmsgs.</p>
      </main>
    )

  return (
    <main className="page">
      <p style={{ marginTop: 0 }}>
        Pending: <strong>{items.length}</strong>
        {humanCount > 0 && (
          <>
            {' '}· human: <strong style={{ color: 'var(--md-sys-color-error)' }}>{humanCount}</strong>
          </>
        )}
      </p>
      <div className="list-card">
        {items.map((r) => (
          <Link
            className="list-row"
            key={`${r.agent}|${r.item.file}`}
            to={`/agent/${encodeURIComponent(r.serverId)}/${encodeURIComponent(r.agent)}`}
          >
            <div className="list-row-head">
              <span className={`chip ${chipToneFor(r.item.state)}`}>{r.item.state}</span>
              <span className="name">{r.agent}</span>
              <span className="timestamp">
                {r.item.age_sec != null ? formatAgeShort(r.item.age_sec) : ''}
              </span>
            </div>
            <div className="list-row-body">
              {r.item.title || r.item.note || r.item.file}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

interface NmsgRow {
  agent: string
  serverId: string
  item: NmsgItem
}

/** `age_sec` → compact "Xs/Xm/Xh/Xd" ; matches formatRelativeShort. */
function formatAgeShort(sec: number): string {
  if (sec < 0) return ''
  if (sec < 60) return `${Math.floor(sec)}s`
  if (sec < 3600) return `${Math.floor(sec / 60)}m`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`
  return `${Math.floor(sec / 86400)}d`
}

function chipToneFor(state: string): string {
  switch (state) {
    case 'requires_human':
      return 'chip-primary'
    case 'human_rejected':
    case 'processed':
      return ''
    default:
      return ''
  }
}
