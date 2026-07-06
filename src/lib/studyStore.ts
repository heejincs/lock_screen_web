/**
 * Study-word store — remote (wiki `/api/study/*`) with graceful
 * localStorage fallback so the feature is usable before wiki cc ships
 * the endpoints.  When the remote calls come back healthy, records get
 * transparently mirrored back (see `hydrate`) — first successful list
 * call flushes any pending local adds.
 */
import { getJson, postJson, NotImplementedError, UnauthenticatedError } from './api'
import type { StudyWord, StudyWordAddRequest, StudyWordList } from '../types/study'

const LOCAL_KEY = 'study.words.v1'
const PENDING_KEY = 'study.pending.v1'

interface LocalState {
  words: StudyWord[]
}

function readLocal(): LocalState {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return { words: [] }
    return JSON.parse(raw) as LocalState
  } catch {
    return { words: [] }
  }
}

function writeLocal(s: LocalState) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(s))
}

function readPending(): StudyWordAddRequest[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StudyWordAddRequest[]
  } catch {
    return []
  }
}

function writePending(items: StudyWordAddRequest[]) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(items))
}

function localId(): string {
  return 'local-' + Math.random().toString(36).slice(2, 10)
}

function nowIso(): string {
  return new Date().toISOString()
}

function ephemeralWord(req: StudyWordAddRequest): StudyWord {
  return {
    ...req,
    word: req.word.trim(),
    id: localId(),
    addedAt: nowIso(),
    lastReviewedAt: null,
    correctCount: 0,
    wrongCount: 0,
  }
}

/**
 * Return the current word list.  If remote works, we use it (and flush
 * any pending local adds).  If remote is 404 (endpoint not implemented
 * yet), we return the localStorage copy.  If 401, we bubble that up so
 * callers can redirect to sign-in.
 */
export async function listWords(): Promise<{
  words: StudyWord[]
  source: 'remote' | 'local'
}> {
  try {
    const remote = await getJson<StudyWordList>('/api/study/words')
    await flushPending()
    return { words: remote.words, source: 'remote' }
  } catch (e) {
    if (e instanceof UnauthenticatedError) throw e
    if (e instanceof NotImplementedError) {
      return { words: readLocal().words, source: 'local' }
    }
    throw e
  }
}

/**
 * Add a word.  Tries remote first.  If remote is unimplemented, we
 * queue it in `pending` AND materialize an ephemeral entry into the
 * local list so the UI reflects it immediately.  Once wiki ships the
 * endpoint, the next `listWords()` call flushes.
 */
export async function addWord(req: StudyWordAddRequest): Promise<StudyWord> {
  const trimmed: StudyWordAddRequest = { ...req, word: req.word.trim() }
  if (!trimmed.word) throw new Error('빈 단어')
  try {
    const remote = await postJson<StudyWord>('/api/study/word', trimmed)
    return remote
  } catch (e) {
    if (e instanceof UnauthenticatedError) throw e
    if (e instanceof NotImplementedError) {
      const local = ephemeralWord(trimmed)
      const state = readLocal()
      state.words = [local, ...state.words]
      writeLocal(state)
      const pending = readPending()
      pending.push(trimmed)
      writePending(pending)
      return local
    }
    throw e
  }
}

/**
 * Record a flashcard review.  Remote-only for now (the local mirror is
 * "recently-added" scratch — spaced-repetition state is server-owned).
 * On 404 fallback we update the local counters so the UX still feels
 * responsive.
 */
export async function reviewWord(
  id: string,
  correct: boolean,
): Promise<StudyWord | null> {
  try {
    return await postJson<StudyWord>(
      `/api/study/word/${encodeURIComponent(id)}/review`,
      { correct },
    )
  } catch (e) {
    if (e instanceof UnauthenticatedError) throw e
    if (e instanceof NotImplementedError) {
      const state = readLocal()
      const w = state.words.find((x) => x.id === id)
      if (w) {
        if (correct) w.correctCount += 1
        else w.wrongCount += 1
        w.lastReviewedAt = nowIso()
        writeLocal(state)
      }
      return w ?? null
    }
    throw e
  }
}

async function flushPending() {
  const pending = readPending()
  if (!pending.length) return
  const remaining: StudyWordAddRequest[] = []
  for (const p of pending) {
    try {
      await postJson<StudyWord>('/api/study/word', p)
    } catch {
      remaining.push(p)
    }
  }
  writePending(remaining)
  if (!remaining.length) {
    writeLocal({ words: [] })
  }
}
