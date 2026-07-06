import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { StudyWordAddRequest } from '../types/study'
import { addWord } from '../lib/studyStore'
import { UnauthenticatedError } from '../lib/api'
import { signInUrl } from '../lib/auth'

/**
 * 단어 추가.  URL 쿼리 `?text=<word>` 로 seed 됨 (PWA share_target 이
 * Android 시스템 share 를 받아 여기로 라우팅).  seed 가 여러 단어이면
 * 첫 단어만 word 로 넣고 나머지는 examples 첫 원소로 넣음.
 */
export default function StudyAdd() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [word, setWord] = useState('')
  const [meaningKo, setMeaningKo] = useState('')
  const [meaningEn, setMeaningEn] = useState('')
  const [examples, setExamples] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    const seed = (params.get('text') ?? params.get('title') ?? '').trim()
    if (!seed) return
    // Common case: user shared a single selected word.  For longer
    // strings assume the first token is the target and stuff the rest
    // into examples.
    const parts = seed.split(/\s+/)
    if (parts.length === 1) {
      setWord(seed)
    } else {
      setWord(parts[0])
      setExamples(seed)
    }
  }, [params])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    const req: StudyWordAddRequest = {
      word: word.trim(),
      ...(meaningKo.trim() ? { meaningKo: meaningKo.trim() } : {}),
      ...(meaningEn.trim() ? { meaningEn: meaningEn.trim() } : {}),
      ...(examples.trim()
        ? { examples: examples.split(/\n+/).map((s) => s.trim()).filter(Boolean) }
        : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    }
    try {
      const saved = await addWord(req)
      setResult(`추가됨: ${saved.word}`)
      setTimeout(() => nav('/study'), 500)
    } catch (e) {
      if (e instanceof UnauthenticatedError) {
        window.location.href = signInUrl()
        return
      }
      setResult(`실패: ${(e as Error).message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page">
      <h1 style={{ marginTop: 0, fontSize: 18 }}>단어 추가</h1>
      <form onSubmit={submit} className="stack">
        <div className="field">
          <label htmlFor="word">단어</label>
          <input
            id="word"
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="ko">뜻 (한국어)</label>
          <input
            id="ko"
            type="text"
            value={meaningKo}
            onChange={(e) => setMeaningKo(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="en">Definition (English, optional)</label>
          <input
            id="en"
            type="text"
            value={meaningEn}
            onChange={(e) => setMeaningEn(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ex">예문 (줄바꿈으로 구분)</label>
          <textarea
            id="ex"
            rows={3}
            value={examples}
            onChange={(e) => setExamples(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="notes">메모</label>
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div>
          <button
            type="submit"
            className="btn"
            disabled={submitting || !word.trim()}
          >
            {submitting ? '저장 중…' : '저장'}
          </button>
        </div>
        {result && <p className="muted">{result}</p>}
      </form>
    </main>
  )
}
