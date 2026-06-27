# lock_screen_web

Web mirror of the [lock_screen](https://github.com/heejincs/lock_screen)
Android widget — same view model, same data source (wiki nmcp HTTP API),
delivered as a PWA at `agent.ncreate.ai` (deployment pending).

## Relationship to lock_screen

- **Schema source of truth:** `lock_screen/schema/*.cue` (the Android
  repo owns the contract).
- **TS types here:** hand-written under `src/types/` from those `.cue`
  specs. Codegen will replace them later (`D:\ncr\app\protocols\codegen\`).
- **Backend:** wiki (same endpoints the Android app uses, via Bearer/
  cookie depending on platform).

## Stack

Vite + React 18 + TypeScript + React Router. ncauth cookie auth
(`credentials: 'include'`).

## Local dev

```powershell
pnpm install
pnpm dev    # Vite picks port, proxies /api → wiki
```

Override the wiki upstream:
```powershell
$env:VITE_WIKI_ORIGIN = "http://localhost:8090"
pnpm dev
```

## Build

```powershell
pnpm build  # tsc -b && vite build → dist/
```

## Routes

| Route | Mirrors Android |
|---|---|
| `/` | MainActivity > Agents tab |
| `/agent/:serverId/:name` | AgentDetailActivity |
| `/bulletin/:id` | BulletinDetailActivity (PIN gate `0303`) |
| `/settings/lock-msg/add` | AddLockMsgDialog |

Full Android↔Web mapping: see lock_screen `docs/view_separation.md` §6.

## Status

Scaffold only. Wiki endpoints (`/api/agent-list`, `/api/agent-detail`,
`/api/whoami`) and the `detail` field on `/api/bulletin/lock-msg/append`
are pending wiki cc. Hosting (cloudflared vs static mount) undecided.
