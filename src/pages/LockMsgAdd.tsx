import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AppendRequest, AppendResponse, BulletinCategory } from '../types/bulletin'
import { postJson, UnauthenticatedError, NotImplementedError } from '../lib/api'
import { signInUrl } from '../lib/auth'

/**
 * Add a Kakao profile lock-msg item — mirrors Android `AddLockMsgDialog`.
 * Two text fields (public `text` + PIN-gated `detail`) + category chips.
 */
const CATEGORIES: BulletinCategory[] = ['kinfo', 'info', 'warn', 'feature']

export default function LockMsgAdd() {
  const nav = useNavigate()
  const [text, setText] = useState('')
  const [detail, setDetail] = useState('')
  const [category, setCategory] = useState<BulletinCategory>('kinfo')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    const body: AppendRequest = {
      text: text.trim(),
      category,
      ...(detail.trim() ? { detail: detail.trim() } : {}),
    }
    try {
      const r = await postJson<AppendResponse>('/api/bulletin/lock-msg/append', body)
      setResult(`추가됨 (${r.id})`)
      setTimeout(() => nav('/'), 800)
    } catch (e) {
      if (e instanceof UnauthenticatedError) {
        window.location.href = signInUrl()
        return
      }
      if (e instanceof NotImplementedError) {
        setResult('백엔드 미구현 (wiki cc 대기 중)')
        return
      }
      setResult(`실패: ${(e as Error).message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page">
      <h1 style={{ marginTop: 0, fontSize: 18 }}>카톡 프로필 추가</h1>
      <form onSubmit={submit} className="stack">
        <div className="field">
          <label htmlFor="text">내용 (공개)</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="detail">상세 (PIN으로 보호됨)</label>
          <textarea
            id="detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={4}
          />
        </div>
        <div className="field">
          <span className="field-label">카테고리</span>
          <div className="chip-group">
            {CATEGORIES.map((c) => (
              <label key={c}>
                <input
                  type="radio"
                  name="category"
                  value={c}
                  checked={category === c}
                  onChange={() => setCategory(c)}
                />
                {c}
              </label>
            ))}
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="btn"
            disabled={submitting || !text.trim()}
          >
            {submitting ? '전송 중…' : '추가'}
          </button>
        </div>
        {result && <p className="muted">{result}</p>}
      </form>
    </main>
  )
}
