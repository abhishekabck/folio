import { createContext, useContext, useEffect, useState } from "react";
import * as bundled from "./content";
import { studioConfig } from "./studio.config";

/* The bundled content.js is the default / fallback. The live site tries to fetch a
   published content.json from GitHub raw and uses it if valid; otherwise it falls back
   to the bundle. The Studio (#studio) edits and publishes that content.json. */
export const defaultContent = {
  profile: bundled.profile,
  stats: bundled.stats,
  projects: bundled.projects,
  craftGroups: bundled.craftGroups,
  quote: bundled.quote,
  achievements: bundled.achievements,
};

const KEYS = Object.keys(defaultContent);
const DRAFT_KEY = "folio:draft";

const HREF_OK = ["http:", "https:", "mailto:", "tel:"];
// only allow safe URL schemes (relative / and # stay valid) — blocks javascript:/data: hrefs
export function safeHref(u) {
  if (typeof u !== "string" || u === "") return u;
  try {
    return HREF_OK.includes(new URL(u, "https://x.invalid").protocol) ? u : "#";
  } catch {
    return "#";
  }
}
const safeLinks = (arr) =>
  Array.isArray(arr) ? arr.filter((l) => l && typeof l === "object").map((l) => ({ ...l, href: safeHref(l.href) })) : [];

// Merge an override (published content.json or a draft) over the defaults, AND defensively
// coerce it: this is the only gate between arbitrary JSON and the live render (no error
// boundary), so a missing/mistyped field must not crash the page and no unsafe href scheme
// may reach the DOM. A wrong top-level shape returns null → fall back to the bundle.
export function normalize(obj) {
  if (!obj || typeof obj !== "object") return null;
  const out = { ...defaultContent };
  for (const k of KEYS) if (obj[k] != null) out[k] = obj[k];
  if (!Array.isArray(out.projects) || !Array.isArray(out.stats) || typeof out.profile !== "object" || !out.profile) return null;

  // profile: always carry the fields the UI dereferences (role.toLowerCase(), links.map/slice)
  out.profile = { ...defaultContent.profile, ...out.profile };
  if (typeof out.profile.role !== "string") out.profile.role = defaultContent.profile.role;
  out.profile.resumeUrl = safeHref(typeof out.profile.resumeUrl === "string" ? out.profile.resumeUrl : defaultContent.profile.resumeUrl);
  out.profile.links = safeLinks(out.profile.links);

  // projects: coerce the arrays the render path maps over; sanitize every href
  out.projects = out.projects
    .filter((p) => p && typeof p === "object")
    .map((p) => ({
      ...p,
      title: typeof p.title === "string" ? p.title : "",
      stack: Array.isArray(p.stack) ? p.stack : [],
      links: safeLinks(p.links),
      live: safeHref(typeof p.live === "string" ? p.live : ""),
      repo: safeHref(typeof p.repo === "string" ? p.repo : ""),
    }));

  out.stats = out.stats.filter((s) => s && typeof s === "object");
  out.craftGroups = Array.isArray(out.craftGroups) ? out.craftGroups.filter((g) => g && typeof g === "object") : defaultContent.craftGroups;
  out.achievements = Array.isArray(out.achievements) ? out.achievements.filter((a) => typeof a === "string") : defaultContent.achievements;
  return out;
}

export function loadDraft() {
  try { return normalize(JSON.parse(localStorage.getItem(DRAFT_KEY) || "null")); } catch { return null; }
}
export function saveDraft(content) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(content)); return true; } catch { return false; }
}
export function isPreview() {
  try { return new URLSearchParams(window.location.search).get("preview") === "1"; } catch { return false; }
}

export function rawUrl(g = studioConfig.github) {
  return `https://raw.githubusercontent.com/${g.owner}/${g.repo}/${g.branch}/${g.path}`;
}
export async function fetchPublished(g) {
  try {
    const res = await fetch(`${rawUrl(g)}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return normalize(await res.json());
  } catch {
    return null;
  }
}

const ContentContext = createContext(defaultContent);
export const useContent = () => useContext(ContentContext);

export function ContentProvider({ children }) {
  // preview tabs (?preview=1, opened by the Studio) show the local draft; everyone else
  // gets the published file (with the bundle as fallback).
  const [content, setContent] = useState(() => (isPreview() && loadDraft()) || defaultContent);
  useEffect(() => {
    if (isPreview()) return;
    let alive = true;
    fetchPublished().then((c) => { if (alive && c) setContent(c); });
    return () => { alive = false; };
  }, []);
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
