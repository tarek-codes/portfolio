## Design System
Always read DESIGN.md before making any visual or UI decisions.
All component, theme, spacing and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
Also read AGENTS.md (Astryx cheat sheet) before using Astryx components.

## This repo
Tarek's minimal black-and-white portfolio. `npm run dev` to develop, `npm run build` to build (runs `tsc` first).
Content is in `src/content.ts`. Facts come from the CV (2026) and GitHub; the older
tarek-dev.vercel.app was partly outdated (e.g. Betopia ended Aug 2026). Latest CV: Drive > Tarek_CV.pdf (Nov 2026).

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.

Key routing rules:
- Bugs, errors, "why is this broken" → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## Admin and editable content
- `/admin` is a password-protected editor for all content (profile, about, experience, education, projects, skills, achievements, travel, movies & series, playlists, games). Visitors can only read; every write needs a signed session token from `/api/login`.
- **The password is never stored or committed.** Only an scrypt hash + a session-signing secret live in `.env` / the host's environment (`npm run admin:setup`). Do not put the password in code, docs, commits or logs.
- `shared/schema.json` is the single description of editable content (used by both the admin forms and server-side validation). To make a new field editable, add it there AND use it in the site.
- Built-in defaults stay in `src/content.ts`; edits are loaded on top at startup (`src/remote.ts`). "Reset to default" in the admin removes the edit.
- Server: `server/core.mjs` (API), `server/store.mjs` (file or Upstash/Vercel KV), `api/[...path].js` (Vercel), `server/start.mjs` (`npm start`: site + API). Dev/preview mount the same API via a Vite plugin.
- Movie/series search: TMDB if `TMDB_API_KEY` is set, otherwise TVmaze (series) and Wikipedia (movies). Letterboxd diary import uses the public RSS feed.
