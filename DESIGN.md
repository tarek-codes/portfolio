# Design System — Tarek's Portfolio

## Product Context
- **What this is:** Personal portfolio of Tarek Alam Bhuiyan, Software Engineer.
- **Who it's for:** Recruiters, hiring managers, collaborators.
- **Project type:** Single-page static site (Vite + React 19).

## Aesthetic Direction
- **Direction:** Minimal, black and white, editorial. Content first.
- **Decoration level:** None. No gradients, no accent colors, no imagery.
- **Mode:** Light and dark, both strictly monochrome; toggle in the header.

## System
- **Components, templates, themes:** Astryx (https://astryx.atmeta.com/docs/getting-started). Use `@astryxdesign/core/*` components only; look them up with `npx astryx component <Name>` and `npx astryx template --list`.
- **Theme:** `@astryxdesign/theme-neutral` (wired in `astryx-themes.js`, generated: do not edit).
- **Layout:** one column, max width 880px, sections separated by `Divider`.
- **Typography:** theme defaults via `Heading` / `Text` types. No custom fonts.
- **Color:** theme tokens only (`color="secondary"` for supporting text). Do not add hex colors.
- **Spacing:** Astryx spacing scale (`gap`, `padding` props), not pixel values.

## Content
All copy lives in `src/content.ts`. Update it there, never inline in components.

## Motion
Lenis smooth scroll driven by GSAP's ticker; ScrollTrigger fade-up reveals via `data-hero`, `data-reveal`, `data-stagger` + `data-item` attributes (see `src/motion.ts`). Disabled under `prefers-reduced-motion`. Subtle only: no parallax, no pinning.

## Pages
Home (`/`) shows summary cards (hero image + short summary) only. Each project has its own page at `/projects/<slug>` with overview, highlights, stack, and a live-page slider when it has screenshots. Project data lives in `src/content.ts`; projects without a live site get a typographic hero (`ProjectHero` in `src/ui.tsx`). `vercel.json` rewrites all paths to index.html for the SPA routes.

## Footer
Shown on the home page only (not on project or interests pages). Centered CTA (headline, line, two buttons) and a giant fading TAREK wordmark cropped at the bottom, styled after beto.sh's footer but on the page's own background: no panel, no grid. Colours use the system `Canvas`/`CanvasText` pair, so it follows light/dark. Plain HTML/CSS in `src/Footer.tsx` and `src/footer.css`. GSAP (`src/motion.ts`): the CTA rises in and the wordmark letters slide up from behind masks and lift on hover. Disabled under `prefers-reduced-motion`.

## Theme switch
The light/dark toggle is an icon button (moon/sun) at the right of the nav; the nav links are centered. Pressing it runs Pin UI's "rain" effect over the whole viewport (`src/ThemeToggle.tsx`, `src/theme-rain/`, adapted from https://www.pinui.xyz/components/theme-switch): puddles of the next theme spread and merge, and the theme flips once they cover the page. Puddle colours are the real page backgrounds (#ffffff / #121212), set in `src/theme-rain/engine.ts` and on `<html>` in `App.tsx`; change them together. Reduced motion switches at once.

## Interests pages
The pills under About > Outside of Work link to `/interests/travelling` (zoomable map of Bangladesh: pick a place and it zooms to numbered pins for each specific spot), `/interests/music` (playlists) and `/interests/watching` (series and movies); `src/pages/Interests.tsx`. Data lives in `src/content.ts` (`travel`, `playlists`, `watched`); each `travel` place has its spots with latitude/longitude (looked up from OpenStreetMap). The map outline in `src/bd-map.ts` is generated from the AVN project's `bangladesh.geojson` (merged and simplified); add a place by giving its latitude/longitude.

## Section titles
Every section title has a Heroicons (outline) icon before it, set through the `icon` prop of `Section` in `src/ui.tsx`. There is no Contact section: the footer's email button and the social buttons in the hero cover it.

## Map, timeline, theme switch
- `/interests/travelling` colours the 64 districts of Bangladesh (`src/bd-map.ts`, generated from the AVN project's geojson): a district is green when a place or spot in it has that district set (`district` on each place and spot; a dropdown in the admin). Count and progress bar sit above the map.
- `src/SectionRail.tsx`: a timeline on the right edge (hidden under 1180px wide) with a dot per `<section id>`, the current one in its section colour. Works on any page with sections.
- The theme switch uses the **droplet** effect (`src/ThemeToggle.tsx`): a drop falls on the icon and floods the page. (The engine also has `rain` and `diwali`.)
- Learning is its own page (`/interests/learning`, linked from the "Learning New Technologies" pill), data-driven from `learning` in `src/content.ts`, editable in /admin. It is not a section on the home page.

## Colours
- All page colours live in **one file: `src/palette.ts`**. Light mode is plain white: page `#ffffff`, cards `#f5f5f5`, chips `#ebebeb`, ink pure black `#000000` (21:1 on the page), secondary text `#3d3d3d` (11.2:1). Dark mode is `#121212`. Change a colour there and the Astryx theme (`src/theme.ts`), the `<html>` background / `--bg` / `--fg` (set in `App.tsx`) and the theme-change flood (`src/theme-rain/engine.ts`, which must match the page exactly or it would flash) all follow.
- In custom CSS use `var(--bg)` / `var(--fg)` (not `Canvas`/`CanvasText`, which are pure white/black). Avoid hard-coded backgrounds; use the palette.
- Skills are pills in their own colour (`SkillPill` in `src/ui.tsx`, colours in `src/icons.tsx`): the brand colour when known, otherwise a steady colour derived from the skill's name.
