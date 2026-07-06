/**
 * Mirrors `D:\ncr\app\protocols\lock-screen\study-word.cue`.  Hand-
 * translated for now — codegen target later.
 */

/** Body of POST /api/study/word — what the user provides. */
export interface StudyWordAddRequest {
  word: string
  meaningKo?: string
  meaningEn?: string
  examples?: string[]
  notes?: string
  ipa?: string
}

/** Element returned by GET /api/study/words — server-populated. */
export interface StudyWord extends StudyWordAddRequest {
  id: string
  addedAt: string
  lastReviewedAt?: string | null
  correctCount: number
  wrongCount: number
}

export interface StudyWordList {
  words: StudyWord[]
}

/** Body of POST /api/study/word/{id}/review. */
export interface StudyReviewRequest {
  correct: boolean
}
