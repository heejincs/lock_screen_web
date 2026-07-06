import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { StudyWord } from '../types/study'
import { listWords, reviewWord } from '../lib/studyStore'
import { UnauthenticatedError } from '../lib/api'
import { signInUrl } from '../lib/auth'

/**
 * Flashcard 모드.  간단한 랜덤 셔플 (spaced repetition 은 나중).
 * 카드: word 를 크게 → 탭하면 뜻/예문 리빌 → "알아 / 모름" 버튼 →
 * reviewWord POST → 다음 카드.
 */
export default function StudyFlash() {
  const [words, setWords] = useState<StudyWord[] | null>(null)
  const [unauthed, setUnauthed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    listWords()
      .then((r) => setWords(shuffle(r.words)))
      .catch((e) => {
        if (e instanceof UnauthenticatedError) setUnauthed(true)
        else setError(e.message)
      })
  }, [])

  const current = useMemo(() => words?.[idx] ?? null, [words, idx])

  async function mark(correct: boolean) {
    if (!current) return
    setRevealed(false)
    void reviewWord(current.id, correct)
    setIdx((i) => i + 1)
  }

  if (unauthed)
    return (
      <main className="page">
        <a href={signInUrl()}>Sign in</a>
      </main>
    )
  if (error) return <main className="page">Error: {error}</main>
  if (words === null) return <main className="page">Loading…</main>

  if (words.length === 0)
    return (
      <main className="page">
        <p>단어가 없어요.</p>
        <Link to="/study/add" className="btn">첫 단어 추가</Link>
      </main>
    )

  if (!current)
    return (
      <main className="page">
        <p>이번 라운드 끝!</p>
        <button
          className="btn btn-tonal"
          onClick={() => {
            setWords(shuffle(words))
            setIdx(0)
          }}
        >
          한 번 더
        </button>{' '}
        <Link to="/study" className="btn btn-text">목록으로</Link>
      </main>
    )

  return (
    <main className="page">
      <p className="muted" style={{ marginTop: 0 }}>
        {idx + 1} / {words.length}
      </p>
      <div
        className="card"
        onClick={() => setRevealed(true)}
        style={{
          minHeight: 220,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: revealed ? 'default' : 'pointer',
          textAlign: 'center',
          padding: 24,
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 700 }}>{current.word}</div>
        {current.ipa && (
          <div className="muted" style={{ marginTop: 4 }}>/{current.ipa}/</div>
        )}
        {revealed && (
          <div style={{ marginTop: 16, width: '100%' }}>
            {current.meaningKo && (
              <p style={{ fontSize: 18, margin: '8px 0' }}>{current.meaningKo}</p>
            )}
            {current.meaningEn && (
              <p className="muted" style={{ margin: '4px 0' }}>{current.meaningEn}</p>
            )}
            {current.examples && current.examples.length > 0 && (
              <ul style={{ textAlign: 'left', margin: '12px 0 0', paddingLeft: 20 }}>
                {current.examples.map((ex, i) => (
                  <li key={i} className="muted">{ex}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {!revealed && (
          <p className="muted" style={{ marginTop: 12 }}>탭해서 뜻 보기</p>
        )}
      </div>
      {revealed && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            className="btn"
            style={{ flex: 1, background: 'var(--md-sys-color-error)' }}
            onClick={() => mark(false)}
          >
            모름
          </button>
          <button
            className="btn"
            style={{ flex: 1, background: 'var(--md-sys-color-ok)' }}
            onClick={() => mark(true)}
          >
            알아
          </button>
        </div>
      )}
    </main>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
