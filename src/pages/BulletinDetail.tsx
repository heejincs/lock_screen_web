import { useState } from 'react'
import { useParams } from 'react-router-dom'

/**
 * PIN-gated detail page — mirrors Android `BulletinDetailActivity`.
 * Shares the same shoulder-surfing PIN (`0303`) as the widget;
 * see `docs/view_separation.md` §4.4 for PIN policy (real secrets
 * should use a stronger gate — separate track).
 *
 * Phase 1 stub: the bulletin payload (text + detail) is passed via
 * router state from the banner; later this page will fetch from the
 * same /api/bulletin endpoint and look the id up directly.
 */
const UNLOCK_PIN = '0303'

export default function BulletinDetail() {
  const { id = '' } = useParams()
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [showHint, setShowHint] = useState(false)

  if (!unlocked) {
    return (
      <main style={{ padding: 16 }}>
        <h1>잠금 해제</h1>
        <p style={{ color: '#888', fontSize: 13 }}>
          PIN으로 보호된 상세 내용을 보려면 4자리 PIN을 입력하세요.
        </p>
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
          style={{ fontSize: 24, letterSpacing: 8, width: 120, padding: 8 }}
        />
        {showHint && pin !== UNLOCK_PIN && (
          <p style={{ color: 'crimson', fontSize: 13 }}>PIN이 맞지 않습니다.</p>
        )}
      </main>
    )
  }

  return (
    <main style={{ padding: 16 }}>
      <h1>Bulletin {id}</h1>
      <p style={{ color: '#888', fontSize: 12 }}>
        detail body 렌더링은 다음 단계 (wiki bulletin item GET endpoint 필요).
      </p>
    </main>
  )
}
