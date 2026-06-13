# Folio — Abhishek Chaurasiya

A dark, immersive single‑page developer portfolio. Built with React 19, Vite and
Tailwind v4, with a living WebGL background, a 3D "gate" you scroll through into the
projects, and a self‑hosted, GitHub‑backed content **Studio** for editing it without a
redeploy.

> Full‑stack engineer self‑hosting an entire production stack — object storage, a
> deployment PaaS and real‑time backends — from a home server behind a Cloudflare Tunnel.

## Highlights

- **Living background** — a tenbinlabs‑style dot‑wave plane (Three.js / R3F) that
  undulates like water, reacts to scroll, and settles to a calm pond with a single big
  ripple when you reach the end of the page.
- **Projects portal** — a 3D gate of swinging doors opens into a different, light "inner
  world" with horizontal scrolling; each project's backgrounds dissolve once you pause on
  it, leaving the content floating.
- **Deep‑dive case studies** — a per‑project modal with the architecture/components‑flow
  diagram, key engineering decisions, metrics, stack and links.
- **Admin Studio** — edit content in the browser and publish it to GitHub; the live site
  picks it up on load with no redeploy (see below).
- Accessible by default — respects `prefers-reduced-motion`, SVG icons, keyboard‑safe.

## Tech stack

React 19 · Vite · Tailwind CSS v4 · framer‑motion · Three.js + @react‑three/fiber + drei ·
Canvas 2D.

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Content & the Studio

Content lives in `src/content.js` (the bundled default). At runtime the site tries to
fetch a published `content.json` from GitHub raw and uses it if present, otherwise it falls
back to the bundle — so the deployed site always renders.

The **Studio** is an admin‑only editor at the `#studio` hash route:

- A passphrase gate (configured in `src/studio.config.js`) keeps casual visitors out; the
  real lock on publishing is your GitHub token, which never leaves your browser and is only
  sent to `api.github.com`.
- Hybrid editor — forms for profile / stats / skills, a validated JSON block for projects,
  and a live preview.
- **Publish** commits `content.json` to this repo via the GitHub Contents API; the live
  site reads it from raw on next load (cache ~5 min). No redeploy needed for content.

All fetched/edited content is sanitised and shape‑coerced at the boundary
(`src/content-context.jsx`) so a malformed field can't break the live render and unsafe URL
schemes are stripped.

## Project structure

```
src/
  App.jsx              # sections, projects portal, gate, deep-dive modals
  content.js           # bundled content (default / fallback)
  content-context.jsx  # runtime content provider (fetch published, sanitise, fallback)
  Studio.jsx           # #studio admin editor + GitHub publish
  studio.config.js     # GitHub target repo + passphrase hash
  TenbinBackground.jsx # WebGL dot-wave background
  LightParticles.jsx   # inner-world particle field
  IsoDiagram.jsx       # isometric architecture / components-flow diagram
  AvatarMark.jsx       # animated "AC" monogram (About)
  GateIcons.jsx        # floating tech-icon tiles on the gate
  index.css            # design tokens + keyframes
```

## Deploy

Static build — `npm run build` produces `dist/`, served by any static host (here: a
self‑hosted nginx via a gitDeploy PaaS). To wire up the résumé buttons, add your
`public/resume.pdf`. Code changes redeploy via your normal git push; content changes go
live through the Studio without a redeploy.
