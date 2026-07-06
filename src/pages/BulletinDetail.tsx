import { useState } from 'react'
import { useParams } from 'react-router-dom'

/**
 * PIN-gated bulletin detail — mirrors Android `BulletinDetailActivity`.
 * PIN `0303` blocks shoulder-surfing only; real secrets belong behind a
 * stronger gate (see docs/view_separation.md §4.4).
 *
 * Phase 1 stub: content payload will land once wiki exposes a per-id
 * bulletin GET.  Router state carries text/detail from the banner today.
 */
const UNLOCK_PIN = '0303'

export default function BulletinDetail() {
  const { id = '' } = useParams()
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [showHint, setShowHint] = useState(false)

  if (!unlocked) {
    return (
      <main className="page">
        <h1 style={{ marginTop: 0, fontSize: 18 }}>잠금 해제</h1>
        <p className="muted">4자리 PIN 을 입력하세요.</p>
        <input
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (pin === UNLOCK_PIN) setUnlocked(true)
              else setShowHint(true)
            }
          }}
          placeholder="****"
          style={{
            fontSize: 24,
            letterSpacing: 8,
            width: 140,
            padding: '10px 12px',
            border: '1px solid var(--md-sys-color-outline)',
            borderRadius: 8,
            background: 'var(--md-sys-color-surface)',
            color: 'var(--md-sys-color-on-surface)',
          }}
        />
        {showHint && pin !== UNLOCK_PIN && (
          <p style={{ color: 'var(--md-sys-color-error)', fontSize: 13 }}>
            PIN이 맞지 않습니다.
          </p>
        )}
      </main>
    )
  }

  return (
    <main className="page">
      <h1 style={{ marginTop: 0, fontSize: 18 }}>Bulletin {id}</h1>
      <p className="muted">
        detail body 렌더링은 wiki bulletin item GET 이 도착하면 붙습니다.
      </p>
    </main>
  )
}
