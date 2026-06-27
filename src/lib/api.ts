/**
 * Thin wrapper around fetch() that always sends the ncauth cookie
 * (same auth path as wikmd / wiki.ncreate.ai in a browser).  All paths
 * are prefixed with `/api/` so the Vite dev proxy + production rewrites
 * land them on the wiki backend.
 *
 * On 401 the helper rejects with a tagged error so the router can show
 * the sign-in screen instead of rendering empty data.
 */

export class UnauthenticatedError extends Error {
  constructor() {
    super('Not signed in')
    this.name = 'UnauthenticatedError'
  }
}

/**
 * Fetch JSON from a wiki API path. Throws UnauthenticatedError on 401
 * and a plain Error with the response status text on other failures.
 *
 * @param path `/api/...` path (NOT a full URL — proxy decides origin)
 * @param init standard RequestInit, merged on top of credentials:'include'
 * @returns parsed JSON cast to T (no validation — caller's responsibility)
 * @example
 *   const list = await getJson<AgentList>('/api/agent-list?server=main')
 */
export async function getJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const resp = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: { Accept: 'application/json', ...(init.headers ?? {}) },
  })
  if (resp.status === 401) throw new UnauthenticatedError()
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`)
  return resp.json() as Promise<T>
}

/**
 * POST JSON to a wiki API path.  Same auth + error semantics as getJson.
 *
 * @param path `/api/...` path
 * @param body any JSON-serializable payload
 * @example
 *   await postJson('/api/bulletin/lock-msg/append', {text, detail})
 */
export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const resp = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  if (resp.status === 401) throw new UnauthenticatedError()
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`)
  return resp.json() as Promise<T>
}
