import { useEffect, useMemo, useRef, useState } from "react";
import { studioConfig } from "./studio.config";
import { defaultContent, fetchPublished, saveDraft } from "./content-context";

/* ------------------------------------------------------------------ helpers */
async function sha256Hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function toBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const clone = (o) => JSON.parse(JSON.stringify(o));
const goSite = () => { window.location.hash = "home"; };

const inputBare = { background: "#0d0b14", border: "1px solid var(--border-2)", color: "var(--text)", outline: "none" };

/* ------------------------------------------------------------------ inputs */
function Text({ label, value, onChange, area, mono, rows = 3, ...rest }) {
  const cls = `w-full rounded-lg px-3 py-2 text-sm ${mono ? "font-mono" : ""}`;
  return (
    <label className="block">
      {label && <span className="mb-1 block text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>{label}</span>}
      {area ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={rows} className={cls} style={inputBare} {...rest} />
      ) : (
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={cls} style={inputBare} {...rest} />
      )}
    </label>
  );
}

/* generic list editor: arrays of strings (fields=null) or arrays of objects */
function ListEditor({ label, items = [], fields, onChange, newItem }) {
  const isStr = fields == null;
  const setField = (i, k, v) => onChange(items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const setStr = (i, v) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...(items || []), isStr ? "" : clone(newItem)]);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>{label}</span>
        <button type="button" onClick={add} className="cursor-pointer rounded-md px-2 py-0.5 text-xs" style={{ border: "1px solid var(--border-2)", color: "var(--accent-soft)" }}>+ add</button>
      </div>
      <div className="space-y-2">
        {(items || []).map((it, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg p-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-2)" }}>
            <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: isStr ? "1fr" : `repeat(${fields.length}, minmax(0,1fr))` }}>
              {isStr ? (
                <input value={it} onChange={(e) => setStr(i, e.target.value)} className="rounded px-2 py-1 text-sm" style={inputBare} />
              ) : (
                fields.map((f) => (
                  <input key={f.k} placeholder={f.label} value={it?.[f.k] ?? ""} onChange={(e) => setField(i, f.k, e.target.value)} className="rounded px-2 py-1 text-sm" style={inputBare} />
                ))
              )}
            </div>
            <button type="button" onClick={() => remove(i)} aria-label="remove" className="shrink-0 cursor-pointer rounded px-2 py-1 text-sm" style={{ color: "#e2806b" }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border-2)" }}>
      <h3 className="font-display mb-4 text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent-soft)" }}>{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ gate */
function Gate({ onUnlock }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [createdHash, setCreatedHash] = useState("");
  const expected = studioConfig.passHash || (typeof localStorage !== "undefined" ? localStorage.getItem("folio:passHash") : "") || "";
  const setup = !expected;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const h = await sha256Hex(pass);
    if (setup) {
      if (pass.length < 4) return setErr("Use at least 4 characters.");
      localStorage.setItem("folio:passHash", h);
      setCreatedHash(h);
    } else if (h === expected) {
      onUnlock();
    } else {
      setErr("Wrong passphrase.");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-6" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl p-7" style={{ background: "var(--surface)", border: "1px solid var(--border-2)" }}>
        <div className="font-display text-lg font-bold">Studio</div>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{setup ? "First run — create a passphrase to lock the editor." : "Enter the admin passphrase."}</p>
        <input autoFocus type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="passphrase" className="mt-4 w-full rounded-lg px-3 py-2 text-sm" style={inputBare} />
        {err && <p className="mt-2 text-xs" style={{ color: "#e2806b" }}>{err}</p>}
        {createdHash ? (
          <div className="mt-3 rounded-lg p-3 text-[11px] leading-relaxed" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-2)", color: "var(--muted)" }}>
            Saved on this browser. To lock it on every device, paste this into <code>studio.config.js</code> as <code>passHash</code>:
            <div className="mt-1 break-all font-mono" style={{ color: "var(--accent-soft)" }}>{createdHash}</div>
            <button type="button" onClick={onUnlock} className="mt-3 w-full cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: "var(--accent)", color: "#0b0911" }}>Enter studio →</button>
          </div>
        ) : (
          <button type="submit" className="mt-4 w-full cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: "var(--accent)", color: "#0b0911" }}>{setup ? "Create & continue" : "Unlock"}</button>
        )}
        <button type="button" onClick={goSite} className="mt-3 w-full cursor-pointer text-xs" style={{ color: "var(--muted)" }}>← Back to site</button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ editor */
function Editor() {
  const [draft, setDraft] = useState(() => clone(defaultContent));
  const [projectsText, setProjectsText] = useState(() => JSON.stringify(defaultContent.projects, null, 2));
  const [projErr, setProjErr] = useState("");
  const [gh, setGh] = useState(() => lsGet("folio:gh", studioConfig.github));
  const [token, setToken] = useState(() => localStorage.getItem("folio:ghToken") || "");
  const [status, setStatus] = useState(null); // { kind, msg }
  const [busy, setBusy] = useState(false);
  const iframeRef = useRef(null);

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const setProfile = (k, v) => setDraft((d) => ({ ...d, profile: { ...d.profile, [k]: v } }));

  // save a draft + (re)load the preview iframe so it reflects that content
  const refreshPreview = (content) => {
    saveDraft(content);
    const f = iframeRef.current;
    if (f) f.src = `/?preview=1&_=${Date.now()}#home`;
  };
  // load a whole content object into the editor (clears any stale JSON error, syncs preview)
  const applyContent = (c) => {
    setDraft(c);
    setProjectsText(JSON.stringify(c.projects, null, 2));
    setProjErr("");
    refreshPreview(c);
  };
  const updatePreview = () => refreshPreview(draft);

  useEffect(() => { lsSet("folio:gh", gh); }, [gh]);
  useEffect(() => { localStorage.setItem("folio:ghToken", token); }, [token]);

  // seed from the currently published content (so you edit what's live), else the bundle
  useEffect(() => {
    let alive = true;
    fetchPublished(gh).then((c) => {
      if (!alive) return;
      applyContent(c || clone(defaultContent));
      setStatus({ kind: "info", msg: c ? "Loaded the published content." : "No published file yet — starting from the bundled content." });
    });
    return () => { alive = false; };
  }, []); // eslint-disable-line

  const onProjects = (txt) => {
    setProjectsText(txt);
    try {
      const parsed = JSON.parse(txt);
      if (!Array.isArray(parsed)) throw new Error("projects must be an array");
      setProjErr("");
      setDraft((d) => ({ ...d, projects: parsed }));
    } catch (e) {
      setProjErr(String(e.message || e));
    }
  };

  const reloadFromGitHub = async () => {
    setBusy(true);
    setStatus({ kind: "info", msg: "Fetching from GitHub…" });
    const c = await fetchPublished(gh);
    setBusy(false);
    if (!c) return setStatus({ kind: "err", msg: "Couldn't fetch — keeping current content (is the repo public and the path right?)." });
    applyContent(c);
    setStatus({ kind: "ok", msg: "Reloaded from GitHub." });
  };

  const publish = async () => {
    if (projErr) return setStatus({ kind: "err", msg: "Fix the Projects JSON before publishing." });
    if (!token) return setStatus({ kind: "err", msg: "Paste a GitHub token first." });
    setBusy(true);
    setStatus({ kind: "info", msg: "Publishing…" });
    const api = `https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/${gh.path}`;
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" };
    try {
      let sha;
      const getRes = await fetch(`${api}?ref=${encodeURIComponent(gh.branch)}&t=${Date.now()}`, { headers });
      if (getRes.ok) sha = (await getRes.json()).sha;
      else if (getRes.status !== 404) throw new Error(`GET ${getRes.status} — ${(await getRes.json()).message || ""}`);
      const json = JSON.stringify(draft, null, 2);
      const body = { message: `studio: update content (${new Date().toISOString()})`, content: toBase64Utf8(json), branch: gh.branch, ...(sha ? { sha } : {}) };
      const putRes = await fetch(api, { method: "PUT", headers, body: JSON.stringify(body) });
      if (!putRes.ok) throw new Error(`PUT ${putRes.status} — ${(await putRes.json()).message || ""}`);
      saveDraft(draft);
      setStatus({ kind: "ok", msg: "Published ✓ — live within a few minutes (raw cache ~5 min)." });
    } catch (e) {
      setStatus({ kind: "err", msg: String(e.message || e) });
    } finally {
      setBusy(false);
    }
  };

  const statusColor = status?.kind === "err" ? "#e2806b" : status?.kind === "ok" ? "var(--live)" : "var(--muted)";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* top bar */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 px-5 py-3" style={{ background: "rgba(8,7,11,0.85)", borderBottom: "1px solid var(--border-2)", backdropFilter: "blur(8px)" }}>
        <div className="font-display text-sm font-bold">Folio Studio</div>
        <span className="text-xs" style={{ color: "var(--muted)" }}>{gh.owner}/{gh.repo} · {gh.path}</span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={reloadFromGitHub} disabled={busy} className="cursor-pointer rounded-lg px-3 py-1.5 text-xs" style={{ border: "1px solid var(--border-2)", color: "var(--text)" }}>Reload</button>
          <button type="button" onClick={updatePreview} className="cursor-pointer rounded-lg px-3 py-1.5 text-xs" style={{ border: "1px solid var(--border-2)", color: "var(--text)" }}>Update preview</button>
          <button type="button" onClick={publish} disabled={busy || !!projErr} className="cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold" style={{ background: projErr ? "var(--border-2)" : "var(--accent)", color: "#0b0911", opacity: busy ? 0.6 : 1 }}>Publish</button>
          <button type="button" onClick={goSite} className="cursor-pointer text-xs" style={{ color: "var(--muted)" }}>View site ↗</button>
        </div>
        {status && <div className="w-full text-xs" style={{ color: statusColor }}>{status.msg}</div>}
      </header>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ---- left: editor ---- */}
        <div className="space-y-5">
          <Card title="GitHub target & token">
            <div className="grid grid-cols-2 gap-3">
              <Text label="owner" value={gh.owner} onChange={(v) => setGh({ ...gh, owner: v })} />
              <Text label="repo" value={gh.repo} onChange={(v) => setGh({ ...gh, repo: v })} />
              <Text label="path" value={gh.path} onChange={(v) => setGh({ ...gh, path: v })} />
              <Text label="branch" value={gh.branch} onChange={(v) => setGh({ ...gh, branch: v })} />
            </div>
            <Text label="token (fine-grained PAT · Contents: read+write · stays in this browser)" value={token} onChange={setToken} type="password" placeholder="github_pat_…" />
            <p className="text-[11px]" style={{ color: "var(--muted)" }}>The content repo must be <b>public</b> so the live site can read it without a token. The token is only used here to commit.</p>
          </Card>

          <Card title="Profile">
            <div className="grid grid-cols-2 gap-3">
              <Text label="name" value={draft.profile?.name} onChange={(v) => setProfile("name", v)} />
              <Text label="role" value={draft.profile?.role} onChange={(v) => setProfile("role", v)} />
              <Text label="hero line 1" value={draft.profile?.heroLead} onChange={(v) => setProfile("heroLead", v)} />
              <Text label="hero line 2" value={draft.profile?.heroEm} onChange={(v) => setProfile("heroEm", v)} />
              <Text label="email" value={draft.profile?.email} onChange={(v) => setProfile("email", v)} />
              <Text label="résumé url" value={draft.profile?.resumeUrl} onChange={(v) => setProfile("resumeUrl", v)} />
              <Text label="availability" value={draft.profile?.availability} onChange={(v) => setProfile("availability", v)} />
              <Text label="location" value={draft.profile?.location} onChange={(v) => setProfile("location", v)} />
            </div>
            <Text label="blurb (about)" area value={draft.profile?.blurb} onChange={(v) => setProfile("blurb", v)} />
            <ListEditor label="links" items={draft.profile?.links} fields={[{ k: "label" }, { k: "short" }, { k: "href" }, { k: "icon" }]} newItem={{ label: "", short: "", href: "", icon: "link" }} onChange={(v) => setProfile("links", v)} />
          </Card>

          <Card title="Stats">
            <ListEditor label="stat cards" items={draft.stats} fields={[{ k: "value", label: "value" }, { k: "label", label: "label" }]} newItem={{ value: "", label: "" }} onChange={(v) => set("stats", v)} />
          </Card>

          <Card title="Projects (JSON)">
            <p className="text-[11px]" style={{ color: "var(--muted)" }}>The full <code>projects</code> array — title, tagline, summary, stack, features, metrics, links, deepDive, arch nodes/edges. Edit as JSON.</p>
            <textarea value={projectsText} onChange={(e) => onProjects(e.target.value)} spellCheck={false} className="h-[420px] w-full rounded-lg px-3 py-2 font-mono text-xs" style={{ ...inputBare, lineHeight: 1.5 }} />
            {projErr ? <p className="text-xs" style={{ color: "#e2806b" }}>JSON error: {projErr}</p> : <p className="text-xs" style={{ color: "var(--live)" }}>JSON valid · {draft.projects?.length} project(s)</p>}
          </Card>

          <Card title="Skills">
            <ListEditor label="craft groups" items={draft.craftGroups} fields={[{ k: "name", label: "name" }, { k: "items", label: "items (·-separated)" }]} newItem={{ name: "", items: "" }} onChange={(v) => set("craftGroups", v)} />
          </Card>

          <Card title="About extras">
            <Text label="quote" area rows={2} value={draft.quote} onChange={(v) => set("quote", v)} />
            <ListEditor label="achievements" items={draft.achievements} fields={null} onChange={(v) => set("achievements", v)} />
          </Card>
        </div>

        {/* ---- right: live preview ---- */}
        <div className="lg:sticky lg:top-[68px] lg:h-[calc(100vh-92px)]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>Live preview</span>
            <a href="/?preview=1#home" target="_blank" rel="noreferrer" onClick={() => saveDraft(draft)} className="text-xs" style={{ color: "var(--accent-soft)" }}>open in new tab ↗</a>
          </div>
          <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid var(--border-2)", height: "100%", minHeight: 480 }}>
            <iframe ref={iframeRef} title="preview" src="/?preview=1#home" className="h-full w-full" style={{ border: 0, background: "var(--bg)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Studio() {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked ? <Editor /> : <Gate onUnlock={() => setUnlocked(true)} />;
}
