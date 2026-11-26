# Tarek Alam Bhuiyan: Portfolio

My personal portfolio: a single-page site for my work, experience and education, with a few extra pages about the things I enjoy
(travelling, music, movies and series, games, and what I am learning). Everything on the site can be edited from a
password-protected admin page, without touching the code.

Built with **Vite + React 19**, the **[Astryx](https://astryx.atmeta.com/docs/getting-started)** design system (components and theme),
**GSAP** and **Lenis** for motion and smooth scrolling.

## Features

- **Home page**: hero, about me, experience (work and research), education, projects, skills and achievements.
- **Projects slideshow** that drifts right to left, pauses when the mouse is over it, and moves one card per arrow key or button. Every project has its own page, with a slider of live screenshots where the project is online.
- **Interest pages**: *Travelling* (a map of all 64 districts of Bangladesh with the visited ones coloured in, and zoom-in to numbered spots), *Music*, *Watching* (movie and series poster grid), *Video Games* and *Learning*.
- **Section timeline** on the right edge that follows where you are on the page.
- **Light and dark mode** with a droplet theme-change animation. Light mode is a soft sand colour, not white, with text that stays above WCAG AA contrast.
- **Admin at `/admin`**: add, edit, delete and reorder everything (profile, about, experience, education, projects, skills, achievements, places, movies and series, playlists, games, learning topics). Movie and series search appears as you type, and a Letterboxd diary can be imported.
- Respects `prefers-reduced-motion`; keyboard accessible.

## Getting started

Requires Node 20.19 or newer.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-checks, then builds to dist/
npm run preview      # serve the production build
npm start            # production server: the built site + the API in one Node process
```

## Editing content and the admin

The built-in content lives in `src/content.ts`. Anything you change in `/admin` is stored on the server and loaded on top of it
("Reset to default" in the admin removes an edit). The admin needs a password, which is **never stored or committed**: only a salted
hash and a session-signing secret are kept, in `.env` (git-ignored) or your host's environment variables.

```bash
ADMIN_PASSWORD='choose a password' npm run admin:setup   # writes ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET to .env
npm run dev                                              # then open http://localhost:5173/admin
```

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET` | Required for the admin (created by `npm run admin:setup`). |
| `TMDB_API_KEY` | Optional. Better movie and series search with posters (free key from themoviedb.org). Without it, series use TVmaze and movies use Wikipedia. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Optional. Where edits are saved on a host without a disk (these are filled in for you by Vercel's Upstash/KV integration). Without them, edits go to `data/content.json`. |

See `.env.example`. The API is small and has no database dependency: `server/core.mjs` (routes, login, validation, search),
`server/store.mjs` (file or Redis storage), and `shared/schema.json`, the single description of the editable content that both the
admin forms and the server-side validation use. Visitors can only read; every write needs a signed session token.

## Deploying

The admin needs a server, so the site can't be hosted purely as static files.

- **Vercel**: import the repo, set `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`, and add an Upstash Redis (or Vercel KV) store so edits persist. `api/[...path].js` serves the API and `vercel.json` rewrites everything else to the app.
- **Any Node host with a persistent disk**: `npm run build && npm start` (set `PORT` if needed).

## Project structure

```
src/
  App.tsx, main.tsx      routes, theme, layout
  pages/                 Home, ProjectPage, Interests (travel, music, watching, games, learning)
  admin/                 the /admin screen (generic form editor, movie search)
  content.ts             built-in content   remote.ts  loads edits on top
  palette.ts, theme.ts   page colours and the Astryx theme
  Footer.tsx, SectionRail.tsx, ProjectSlider.tsx, ThemeToggle.tsx
  motion.ts              GSAP + Lenis setup and scroll reveals
  bd-map.ts              the 64 district shapes (generated)
server/                  API core, storage, adapters, production server
api/                     Vercel function
shared/schema.json       editable-content schema
public/                  images, logos, screenshots
```

`CLAUDE.md`, `DESIGN.md` and `AGENTS.md` describe the design rules and how AI agents should work in this repo.

## Credits and notes

- UI components and theme: [Astryx](https://github.com/meta/astryx) (Meta), with brand icons from [Simple Icons](https://simpleicons.org/) and icons from Heroicons.
- The theme-change animation is adapted from the Theme Switch component by [Pin UI](https://www.pinui.xyz/components/theme-switch) (see the header of `src/theme-rain/engine.ts`).
- The district map was inspired by [Unseen Bangladesh](https://unseenbd.com/). Its outlines are simplified from administrative boundary data used in the AVN project; check the data provider's licence (GADM is free for non-commercial use) before reusing them.
- Movie and series data comes from TVmaze, Wikipedia, TMDB (optional) and Letterboxd's public feed.
- Company, school and product logos and screenshots belong to their owners and are shown to describe my work and education.

## Licence

This is a personal site. The code and content are not licensed for reuse (all rights reserved), except for the third-party parts credited above, which keep their own licences.
