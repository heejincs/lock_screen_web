import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { StudyWord } from '../types/study'
import { listWords } from '../lib/studyStore'
import { UnauthenticatedError } from '../lib/api'
import { signInUrl } from '../lib/auth'

/**
 * Single-word detail — meaning + examples + review stats.  Read-only
 * for now; edit endpoint TBD.  Wraps `listWords()` and picks by id
 * rather than fetching one-by-one (there's no wiki endpoint for a
 * single word in the current design).
 */
export default function StudyDetail() {
  const { id = '' } = useParams()
  const [word, setWord] = useState<StudyWord | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [unauthed, setUnauthed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listWords()
      .then((r) => {
        const w = r.words.find((x) => x.id === id)
        if (w) setWord(w)
        else setNotFound(true)
      })
      .catch((e) => {
        if (e instanceof UnauthenticatedError) setUnauthed(true)
        else setError(e.message)
      })
  }, [id])

  if (unauthed)
    return <main className="page"><a href={signInUrl()}>Sign in</a></main>
  if (error) return <main className="page">Error: {error}</main>
  if (notFound)
    return (
      <main className="page">
        <p><Link to="/study">← 목록</Link></p>
        <p>해당 단어를 찾을 수 없습니다.</p>
      </main>
    )
  if (!word) return <main className="page">Loading…</main>

  return (
    <main className="page">
      <p style={{ marginTop: 0 }}><Link to="/study">← 목록</Link></p>
      <h1 style={{ marginBottom: 4 }}>{word.word}</h1>
      {word.ipa && <p className="muted" style={{ marginTop: 0 }}>/{word.ipa}/</p>}
      {word.meaningKo && <p style={{ fontSize: 16 }}>{word.meaningKo}</p>}
      {word.meaningEn && <p className="muted">{word.meaningEn}</p>}
      {word.examples && word.examples.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, marginBottom: 4 }}>예문</h2>
          <ul style={{ margin: 0 }}>
            {word.examples.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>
        </>
      )}
      {word.notes && (
        <>
          <h2 style={{ fontSize: 14, marginBottom: 4 }}>메모</h2>
          <p>{word.notes}</p>
        </>
      )}
      <p className="muted" style={{ marginTop: 24, fontSize: 12 }}>
        추가: {word.addedAt}
        {' · '}
        ✓{word.correctCount} · ✗{word.wrongCount}
        {word.lastReviewedAt && ` · 마지막 리뷰: ${word.lastReviewedAt}`}
      </p>
    </main>
  )
}
