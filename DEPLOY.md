# Deploy

This is a static single-page app. It needs **no server**: the build is plain HTML/JS/CSS,
and content is fetched at runtime from GitHub (with the bundled content as a fallback). That
makes it a perfect fit for **Cloudflare Pages** — always online, even if your own server is
down.

## Cloudflare Pages (recommended)

1. **Connect the repo** — Cloudflare dashboard → *Workers & Pages* → *Create* → *Pages* →
   *Connect to Git* → pick `abhishekabck/folio`.
2. **Build settings:**

   | Setting | Value |
   | --- | --- |
   | Framework preset | `Vite` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` |

3. **Save and Deploy.** Cloudflare auto-deploys on every push to `main`.

That's it. On the first deploy the site renders the **bundled content** (`src/content.js`),
so it works before you ever open the Studio.

- `public/_headers` — long cache for hashed assets, always-revalidate for the entry doc, a
  short cache for `resume.pdf`, plus baseline security headers.

**SPA fallback is automatic** — Workers Static Assets (`wrangler deploy`) sets
`not_found_handling: "single-page-application"`, and the app uses hash routes (`#studio`,
`#about`) plus `?preview=1` anyway, so there is no `_redirects` file. (A `/* /index.html
200` rule is actually rejected by the Workers `_redirects` validator as an infinite loop —
hence it's omitted.)

## Editing content — the Studio

Go to **`https://<your-site>/#studio`** (unlinked; type the hash):

1. **Passphrase gate** — first visit lets you create one (stored hashed in your browser; it
   prints a hash you can paste into `src/studio.config.js` → `passHash` to lock it on every
   device).
2. **GitHub token** — paste a **fine-grained PAT** scoped to this repo with
   *Contents: Read and write*. It stays in your browser and is only ever sent to
   `api.github.com`.
3. **Publish** — edits commit `content.json` to this repo; the live site reads it from
   GitHub raw on next load (cache ~5 min). **No redeploy needed for content.**
4. **Résumé** — pick a PDF in the *Résumé* card → it commits to `public/resume.pdf`;
   Cloudflare rebuilds on push and serves it at `/resume.pdf` (~1 min). Keep
   *Profile → résumé url* in sync with the path you upload to.

> Content updates are **instant** (runtime fetch). The résumé is a static asset, so it goes
> live on the **next Cloudflare build**. Cloudflare auto-builds on every push, including
> content commits — harmless, since content is already live via the raw fetch.

## Before going public

- Set `passHash` in `src/studio.config.js` (or just use the per-browser setup).
- The content repo (`abhishekabck/folio`) must stay **public** so the live site can read
  `content.json` without a token.

## Any other static host / self-hosted

`npm run build` → ship `dist/` to any static host (Netlify, GitHub Pages, S3, or your own
nginx). The `_headers` / `_redirects` files are Cloudflare-specific; other hosts use their
own equivalents (e.g. an nginx `try_files $uri /index.html;` for the SPA fallback).
