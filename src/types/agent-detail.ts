/**
 * Mirrors `D:\ncr\app\protocols\lock-screen\agent-detail.cue` #AgentDetail.
 * Hand-translated; codegen target later.
 */
import type { AgentStatus } from './agent-list'

export type NmsgState =
  | 'received'
  | 'in_processing'
  | 'requires_human'
  | 'human_approved'
  | 'human_rejected'
  | 'processed'

/** Mirrors `protocols/wiki/nmsg-status.cue` #Item shape. */
export interface NmsgItem {
  agent: string
  file: string
  state: NmsgState
  note?: string
  set_by?: string
  title?: string
  ts?: string
  age_sec: number
}

export interface AgentDetail {
  name: string
  status: AgentStatus
  summary: string
  /** markdown body (status.json `details`). */
  content: string
  updatedAt: string
  serverId: string
  truncated?: boolean
  /** pending nmsg in this agent's inbox (received / in_processing / requires_human). */
  nmsgPending?: NmsgItem[]
  /** recently-processed nmsg history. */
  nmsgRecent?: NmsgItem[]
}
