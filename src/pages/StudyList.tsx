import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { StudyWord } from '../types/study'
import { listWords } from '../lib/studyStore'
import { UnauthenticatedError } from '../lib/api'
import { signInUrl } from '../lib/auth'

/**
 * 단어공부 목록 페이지.  최신순.  각 행은 word (bold) + 뜻 (subdued).
 * localStorage fallback 상태면 상단에 안내 배너 표시.
 */
export default function StudyList() {
  const [words, setWords] = useState<StudyWord[] | null>(null)
  const [source, setSource] = useState<'remote' | 'local' | null>(null)
  const [unauthed, setUnauthed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listWords()
      .then((r) => {
        setWords(r.words)
        setSource(r.source)
      })
      .catch((e) => {
        if (e instanceof UnauthenticatedError) setUnauthed(true)
        else setError(e.message)
      })
  }, [])

  if (unauthed) {
    return (
      <main className="page">
        <p>Sign in to view your word list.</p>
        <a href={signInUrl()}>Sign in with Google</a>
      </main>
    )
  }
  if (error) return <main className="page"><p>Error: {error}</p></main>
  if (words === null) return <main className="page"><p>Loading…</p></main>

  return (
    <main className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 18, flex: 1 }}>단어공부</h1>
        <Link to="/study/flash" className="btn btn-tonal" style={{ padding: '6px 14px', fontSize: 13 }}>
          Flash
        </Link>
        <Link to="/study/add" className="btn" style={{ padding: '6px 14px', fontSize: 13 }}>
          + 추가
        </Link>
      </div>
      {source === 'local' && (
        <p className="muted" style={{ marginTop: 0 }}>
          로컬에 임시 저장 중 — wiki 백엔드 준비되면 자동 sync.
        </p>
      )}
      {words.length === 0 ? (
        <p className="muted">아직 단어가 없어요. + 추가 해주세요.</p>
      ) : (
        <div className="list-card">
          {words.map((w) => (
            <Link to={`/study/${encodeURIComponent(w.id)}`} className="list-row" key={w.id}>
              <div className="list-row-head">
                <span className="name">{w.word}</span>
                <span className="timestamp">
                  {w.correctCount > 0 || w.wrongCount > 0
                    ? `✓${w.correctCount}·✗${w.wrongCount}`
                    : ''}
                </span>
              </div>
              <div className="list-row-body">
                {w.meaningKo || w.meaningEn || '(뜻 없음)'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
