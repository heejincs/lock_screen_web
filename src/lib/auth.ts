/**
 * Wiki sign-in helper.  The web app reuses wiki's existing ncauth cookie
 * flow — the same path browsers take to sign into wiki.ncreate.ai
 * (Google → wiki ncauth session cookie).  We do NOT bundle Google
 * Identity Services here; the user is redirected to wiki's sign-in page
 * which already wires the GIS flow.
 *
 * Direction D (cookie) is used in the browser; Bearer id_token is the
 * Android path (`access/WikiAuth.kt`).  See
 * `D:\ncr\app\protocols\wiki\save.cue` for the dual auth contract.
 */

/**
 * URL the user is redirected to when api calls return 401.  Wiki's
 * sign-in page accepts `?next=` to bounce back here after success.
 *
 * @param returnTo absolute or path-only URL to return to after sign-in
 * @returns absolute URL to send the user to
 */
export function signInUrl(returnTo: string = window.location.href): string {
  const next = encodeURIComponent(returnTo)
  return `/auth/signin?next=${next}`
}

/**
 * Quick liveness probe — calls wiki's whoami endpoint and returns the
 * email of the signed-in user, or null when the cookie is absent /
 * expired.  Use to decide whether to render the app vs. show a sign-in
 * gate at startup.
 *
 * @returns the signed-in user's email, or null
 */
export async function whoami(): Promise<string | null> {
  try {
    const resp = await fetch('/api/whoami', { credentials: 'include' })
    if (!resp.ok) return null
    const body = (await resp.json()) as { email?: string }
    return body.email ?? null
  } catch {
    return null
  }
}
