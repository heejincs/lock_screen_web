# lock_screen_web

`agent.ncreate.ai` — web mirror of the lock_screen Android widget.

Separate git repo (this folder = repo root). See README.md for stack +
local dev. See `D:\Users\heejin\Desktop\lock_screen\docs\
view_separation.md` §6 for the Android↔Web view mapping.

## Coupling to lock_screen

- Schema source-of-truth: `D:\Users\heejin\Desktop\lock_screen\schema\*.cue`
- TS types: hand-written copies in `src/types/` (codegen target later)
- Backend: wiki (Bearer for app, ncauth cookie for web)
