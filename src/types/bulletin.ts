/**
 * Mirrors `D:\ncr\app\protocols\lock-screen\bulletin.cue` #BulletinItem
 * + #AppendRequest / #AppendResponse.
 */

export type BulletinCategory =
  | 'info'
  | 'warn'
  | 'feature'
  | 'alert'
  | 'kinfo'

export interface BulletinImage {
  url: string
  alt?: string
}

/** Existing wiki yaml stores detail as {text, images}; append accepts a plain string. */
export interface BulletinDetail {
  text: string
  images?: BulletinImage[]
}

export interface BulletinItem {
  id: string
  /** public banner body. */
  text: string
  image?: BulletinImage
  /** PIN-gated body. Shown only after passing the BulletinDetail page's PIN. */
  detail?: BulletinDetail
  category: BulletinCategory
  /** ISO 8601, used as sort key. */
  timestamp: string
  /** When false, banner skips this item. */
  visible: boolean
}

/** POST /api/bulletin/lock-msg/append request body. */
export interface AppendRequest {
  text: string
  /** plain string; server wraps as `detail: {text: <string>}`. */
  detail?: string
  category?: BulletinCategory
  timestamp?: string
  id?: string
}

export interface AppendResponse {
  id: string
  items_count: number
  overwrote: boolean
}
