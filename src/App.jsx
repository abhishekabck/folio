import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, MotionConfig, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useContent, ContentProvider } from "./content-context";
import Studio from "./Studio";
import TenbinBackground from "./TenbinBackground";
import AvatarMark from "./AvatarMark";
import IsoDiagram from "./IsoDiagram";
import LightParticles from "./LightParticles";
import GateIcons from "./GateIcons";

/* ---------------- icons (SVG, no emoji) ---------------- */
const Icon = {
  github: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true" {...p}>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7 0-.7 0-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.3.8 1 .8 2.1v3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  ),
  linkedin: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true" {...p}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33 0-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
  link: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true" {...p}>
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  ),
  arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true" {...p}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  mail: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true" {...p}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true" {...p}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
};
const iconFor = (name) => Icon[name] || Icon.link;

/* ---------------- motion helper ---------------- */
const ease = [0.22, 1, 0.36, 1];
function Reveal({ children, delay = 0, y = 22, className, style }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

const NAV = [
  ["Work", "#work"],
  ["About", "#about"],
  ["Skills", "#skills"],
  ["Contact", "#contact"],
];

/* ---------------- background ---------------- */
function Background() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-20 overflow-hidden" style={{ background: "var(--bg)" }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(167,139,250,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.04,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

/* ---------------- header ---------------- */
function Header() {
  const { profile } = useContent();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className="mx-auto flex max-w-6xl items-center justify-between px-5 transition-all duration-300"
        style={{
          marginTop: scrolled ? 10 : 18,
          padding: scrolled ? "10px 18px" : "14px 18px",
          borderRadius: 16,
          border: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          background: scrolled ? "rgba(13,11,20,0.72)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          maxWidth: "72rem",
          width: "calc(100% - 24px)",
        }}
      >
        <a href="#home" className="flex items-center gap-2.5" style={{ textDecoration: "none", color: "var(--text)" }}>
          <span
            className="font-display grid h-9 w-9 place-items-center rounded-xl text-sm font-bold"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-deep))", color: "#fff" }}
          >
            AC
          </span>
          <span className="hidden font-display text-sm font-medium tracking-tight sm:block">{profile.name}</span>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-lg px-3.5 py-2 text-sm transition-colors duration-200"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="font-display rounded-full px-4 py-2 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5"
          style={{ background: "var(--text)", color: "#0a0810", textDecoration: "none" }}
        >
          Get in touch
        </a>
      </div>
    </motion.header>
  );
}

/* ---------------- hero ---------------- */
function Hero() {
  const { profile } = useContent();
  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden">
      {/* the dark monolith lives in the full-page TenbinBackground behind everything */}
      {/* no scrim overlays here — they used to darken the hero for the old gem,
          but they live inside the (scrolling) section and would slide against
          the fixed dot-wave background. The dots are dim under the text already. */}

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-center px-6 pt-28 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="mb-7 inline-flex w-fit items-center gap-2.5 rounded-full px-3.5 py-1.5 text-xs"
        style={{ border: "1px solid var(--border)", background: "rgba(20,17,30,0.6)", color: "var(--muted)" }}
      >
        <span className="pulse-dot inline-block h-2 w-2 rounded-full" style={{ background: "var(--live)" }} />
        {profile.availability}
      </motion.div>

      <h1 className="font-display max-w-4xl text-[clamp(2.6rem,7vw,5.4rem)] font-bold leading-[1.02] tracking-[-0.02em]">
        <motion.span
          className="block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.08 }}
        >
          {profile.heroLead}
        </motion.span>
        <motion.span
          className="grad-text block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
        >
          {profile.heroEm}
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.34 }}
        className="mt-7 max-w-xl text-base leading-relaxed sm:text-lg"
        style={{ color: "var(--muted)" }}
      >
        {profile.blurb}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.46 }}
        className="mt-9 flex flex-wrap items-center gap-3"
      >
        <a
          href="#work"
          className="font-display inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-deep))", color: "#fff", textDecoration: "none", boxShadow: "0 12px 34px -10px var(--glow)" }}
        >
          View work <Icon.arrow />
        </a>
        <a
          href={profile.resumeUrl}
          className="font-display inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm transition-colors duration-200"
          style={{ border: "1px solid var(--border-2)", color: "var(--text)", textDecoration: "none", background: "rgba(20,17,30,0.4)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
        >
          Résumé
        </a>
        <div className="ml-1 flex items-center gap-1">
          {profile.links.slice(0, 2).map((l) => {
            const I = iconFor(l.icon);
            return (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                aria-label={l.label}
                className="grid h-10 w-10 place-items-center rounded-full transition-colors duration-200"
                style={{ border: "1px solid var(--border-2)", color: "var(--muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border-2)"; }}
              >
                <I />
              </a>
            );
          })}
        </div>
      </motion.div>
      </div>
    </section>
  );
}

/* ---------------- stat band ---------------- */
function Stats() {
  const { stats } = useContent();
  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-4" style={{ border: "1px solid var(--border)", background: "var(--border)" }}>
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="h-full px-6 py-7" style={{ background: "rgba(13,11,20,0.7)" }}>
              <div className="font-display text-3xl font-bold" style={{ color: "var(--text)" }}>{s.value}</div>
              <div className="mt-1.5 text-xs leading-snug" style={{ color: "var(--muted)" }}>{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- section heading ---------------- */
function Heading({ tag, title, sub }) {
  return (
    <div className="mb-12">
      <Reveal>
        <span className="font-display text-xs font-medium uppercase tracking-[0.28em]" style={{ color: "var(--accent-soft)" }}>{tag}</span>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="font-display mt-3 text-[clamp(1.9rem,4vw,3rem)] font-bold leading-tight tracking-[-0.02em]">{title}</h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.12}>
          <p className="mt-3 max-w-xl text-sm sm:text-base" style={{ color: "var(--muted)" }}>{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------------- project card ---------------- */
function ProjectCard({ p, index }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Reveal delay={(index % 2) * 0.08}>
      <article
        onMouseMove={onMove}
        className="group relative overflow-hidden rounded-3xl p-7 transition-all duration-300 sm:p-9"
        style={{ border: "1px solid var(--border-2)", background: "var(--surface)", "--mx": "50%", "--my": "0px" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "color-mix(in oklab, " + p.accent + " 55%, transparent)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {/* pointer-follow glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(420px circle at var(--mx) var(--my), ${p.accent}22, transparent 60%)` }}
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-baseline gap-4">
              <span className="font-display text-sm font-bold" style={{ color: p.accent }}>{String(index + 1).padStart(2, "0")}</span>
              <span className="font-display text-xs uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>{p.kicker}</span>
            </div>
            <div className="flex items-center gap-3 whitespace-nowrap text-xs" style={{ color: "var(--muted)" }}>
              {p.live && (
                <span className="inline-flex items-center gap-1.5" style={{ color: "var(--live)" }}>
                  <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--live)" }} />
                  live
                </span>
              )}
              {p.year}
            </div>
          </div>

          <h3 className="font-display mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{p.title}</h3>
          <p className="mt-2 text-sm font-medium sm:text-base" style={{ color: "var(--accent-soft)" }}>{p.tagline}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{p.summary}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <span key={s} className="rounded-full px-3 py-1 text-xs" style={{ border: "1px solid var(--border-2)", color: "var(--text)", background: "rgba(255,255,255,0.02)" }}>
                {s}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {p.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="font-display inline-flex items-center gap-1.5 text-sm transition-colors duration-200"
                style={{ color: "var(--text)", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = p.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
              >
                {l.label} <Icon.link />
              </a>
            ))}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function useIsDesktop() {
  const [d, setD] = useState(typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setD(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return d;
}

/* the project brief + architecture, shown inside each slide */
function ProjectBody({ p, index, total, onDeepDive, diagramBare }) {
  const link = (href, content, key) => (
    <a
      key={key || href}
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-display inline-flex items-center gap-1.5 text-sm"
      style={{ color: "var(--text)", textDecoration: "none" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = p.accent)}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
    >
      {content}
    </a>
  );
  const extraLinks = p.links.filter((l) => l.href !== p.live && l.href !== p.repo);
  return (
      <div className="mx-auto grid w-full max-w-[1320px] items-center gap-10 lg:gap-14 lg:grid-cols-[1.05fr_0.92fr]">
        {/* ---- left: the brief ---- */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="font-display text-sm font-bold" style={{ color: p.accent }}>{String(index + 1).padStart(2, "0")}</span>
            <span className="font-display text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>{p.kicker}</span>
            {p.live && (
              <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "var(--live)" }}>
                <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--live)" }} /> live
              </span>
            )}
          </div>
          <h3 className="font-display mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">{p.title}</h3>
          <p className="mt-3 text-base sm:text-lg" style={{ color: "var(--accent-soft)" }}>{p.tagline}</p>

          {p.features && (
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 shrink-0" style={{ color: p.accent }}>
                    <Icon.check />
                  </span>
                  <span style={{ color: "var(--muted)" }}>{f}</span>
                </li>
              ))}
            </ul>
          )}

          {p.metrics && (
            <div className="mt-6 flex flex-wrap gap-3">
              {p.metrics.map((m) => (
                <div key={m.l} className="rounded-xl px-4 py-2.5" style={{ border: "1px solid var(--border-2)", background: "rgba(255,255,255,0.02)" }}>
                  <div className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>{m.v}</div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>{m.l}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <span key={s} className="rounded-full px-3 py-1 text-xs" style={{ border: "1px solid var(--border-2)", color: "var(--text)", background: "rgba(255,255,255,0.02)" }}>{s}</span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="button"
              onClick={onDeepDive}
              className="font-display inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform"
              style={{ background: p.accent, color: "#0b0911", boxShadow: `0 14px 34px -12px ${p.accent}` }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
              </svg>
              Deep dive
            </button>
            {p.live && link(p.live, <>Live site <Icon.link /></>, "live")}
            {p.repo && link(p.repo, <><Icon.github /> Source</>, "repo")}
            {extraLinks.map((l) => link(l.href, <>{l.label} <Icon.link /></>))}
            <span className="ml-auto font-display text-xs" style={{ color: "var(--muted)" }}>{index + 1} / {total} · {p.year}</span>
          </div>
        </div>

        {/* ---- right: isometric architecture / components flow ---- */}
        <div
          className="relative hidden aspect-[4/3] w-full overflow-hidden lg:block"
          style={{ background: `radial-gradient(70% 65% at 54% 46%, rgba(18,15,28,${diagramBare ? 0 : 0.5}), transparent 78%)`, transition: "background 1s ease" }}
        >
          <span className="absolute left-2 top-3 z-10 font-display text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--muted)", opacity: 0.7 }}>
            Architecture · components flow
          </span>
          <div className="absolute inset-0 flex items-center justify-center p-5 pt-9">
            {p.arch && <IsoDiagram arch={p.arch} accent={p.accent} />}
          </div>
        </div>
      </div>
  );
}

/* one project as a dark slide floating on the light inner world. Once a project has been
   in view for a moment its backgrounds dissolve ONE AT A TIME — first the architecture
   backdrop (stage 1), then the card panel itself (stage 2, to a faint glass so the text
   stays readable) — leaving the content floating on the light world. Resets on scroll-away;
   off for reduced-motion. */
function ProjectSlide({ p, index, total, active }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState(0); // 0: full · 1: diagram bg gone · 2: card bg gone too
  useEffect(() => {
    if (!active) { setStage(0); return; }
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t1 = setTimeout(() => setStage(1), 1600); // architecture backdrop fades
    const t2 = setTimeout(() => setStage(2), 3400); // then, a beat later, the card panel
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  const bare = stage >= 2;
  return (
    <div className="flex h-full w-screen shrink-0 items-center justify-center px-6 lg:px-16">
      <div
        className="relative flex h-[76vh] w-full max-w-[1240px] items-center overflow-hidden rounded-[2rem] px-8 md:px-12"
        style={{
          background: bare
            ? "linear-gradient(180deg, rgba(15,12,23,0.5), rgba(10,8,17,0.54))"
            : "linear-gradient(180deg, rgba(21,18,31,0.92), rgba(15,12,23,0.94))",
          border: bare ? "1px solid rgba(167,139,250,0.06)" : "1px solid rgba(167,139,250,0.16)",
          boxShadow: bare
            ? "0 40px 120px -64px rgba(80,45,160,0.35)"
            : "0 60px 140px -50px rgba(80,45,160,0.7), 0 0 0 1px rgba(255,255,255,0.03)",
          backdropFilter: bare ? "blur(7px)" : "none",
          WebkitBackdropFilter: bare ? "blur(7px)" : "none",
          transition: "background 1s ease, border-color 1s ease, box-shadow 1s ease",
        }}
      >
        <span aria-hidden="true" className="font-display pointer-events-none absolute -top-7 right-2 select-none font-bold leading-none" style={{ fontSize: "min(34vh, 26vw)", color: p.accent, opacity: 0.06 }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <ProjectBody p={p} index={index} total={total} onDeepDive={() => setOpen(true)} diagramBare={stage >= 1} />
      </div>
      <ProjectModal p={p} index={index} total={total} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/* small section label used inside the deep-dive modal */
function SectionLabel({ children }) {
  return (
    <div className="font-display text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>
      {children}
    </div>
  );
}

/* full deep-dive case study — rendered to <body> so it escapes the portal's 3D /
   overflow-clipped context and covers the whole screen. Esc + scrim close, scroll-locked. */
function ProjectModal({ p, index, total, open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const dd = p.deepDive;
  const extra = p.links.filter((l) => l.href !== p.live && l.href !== p.repo);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex overflow-y-auto p-4 sm:p-8"
          style={{ background: "rgba(5,4,10,0.74)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.26 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${p.title} — deep dive`}
        >
          <motion.div
            className="relative m-auto w-full max-w-3xl overflow-hidden rounded-[1.7rem]"
            style={{ background: "linear-gradient(180deg, #16121f, #0f0b17)", border: "1px solid rgba(167,139,250,0.18)", boxShadow: "0 70px 170px -40px rgba(80,45,160,0.75)" }}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.36, ease }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${p.accent}, transparent 78%)` }} />

            {/* header (sticky within the panel) */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 pb-4 pt-6 sm:px-9" style={{ background: "linear-gradient(180deg, #16121f 72%, transparent)" }}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display text-sm font-bold" style={{ color: p.accent }}>{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-display text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>{p.kicker}</span>
                  {p.live && (
                    <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: "var(--live)" }}>
                      <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--live)" }} /> live
                    </span>
                  )}
                </div>
                <h3 className="font-display mt-1.5 truncate text-3xl font-bold tracking-tight sm:text-4xl">{p.title}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close deep dive"
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full transition-colors"
                style={{ border: "1px solid var(--border-2)", color: "var(--muted)", background: "rgba(255,255,255,0.03)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = p.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border-2)"; }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>

            {/* body */}
            <div className="px-6 pb-9 sm:px-9">
              <p className="text-base" style={{ color: "var(--accent-soft)" }}>{p.tagline}</p>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--text)" }}>{p.summary}</p>

              {p.metrics && (
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {p.metrics.map((m) => (
                    <div key={m.l} className="rounded-xl px-3 py-3 text-center" style={{ border: "1px solid var(--border-2)", background: "rgba(255,255,255,0.02)" }}>
                      <div className="font-display text-2xl font-bold" style={{ color: p.accent }}>{m.v}</div>
                      <div className="mt-0.5 text-[11px]" style={{ color: "var(--muted)" }}>{m.l}</div>
                    </div>
                  ))}
                </div>
              )}

              {dd?.problem && (
                <section className="mt-8">
                  <SectionLabel>The problem</SectionLabel>
                  <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>{dd.problem}</p>
                </section>
              )}

              {dd?.decisions && (
                <section className="mt-8">
                  <SectionLabel>Key engineering decisions</SectionLabel>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {dd.decisions.map((d, i) => (
                      <div key={i} className="rounded-xl p-4" style={{ border: "1px solid var(--border-2)", background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex items-center gap-2.5">
                          <span className="font-display grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-bold" style={{ background: `${p.accent}22`, color: p.accent }}>{i + 1}</span>
                          <h4 className="font-display text-sm font-semibold" style={{ color: "var(--text)" }}>{d.h}</h4>
                        </div>
                        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>{d.b}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {p.arch && (
                <section className="mt-8">
                  <SectionLabel>Architecture · components flow</SectionLabel>
                  <div className="relative mt-3 aspect-[16/10] w-full overflow-hidden rounded-xl" style={{ border: "1px solid var(--border-2)", background: "radial-gradient(70% 65% at 50% 46%, rgba(18,15,28,0.6), #0b0911 88%)" }}>
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <IsoDiagram arch={p.arch} accent={p.accent} />
                    </div>
                  </div>
                </section>
              )}

              {p.features && (
                <section className="mt-8">
                  <SectionLabel>What's inside</SectionLabel>
                  <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px]">
                        <span className="mt-0.5 shrink-0" style={{ color: p.accent }}><Icon.check /></span>
                        <span style={{ color: "var(--muted)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="mt-8">
                <SectionLabel>Stack</SectionLabel>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span key={s} className="rounded-full px-3 py-1 text-xs" style={{ border: "1px solid var(--border-2)", color: "var(--text)", background: "rgba(255,255,255,0.02)" }}>{s}</span>
                  ))}
                </div>
              </section>

              {dd?.outcome && (
                <div className="mt-8 rounded-xl px-5 py-4" style={{ border: `1px solid ${p.accent}33`, background: `linear-gradient(120deg, ${p.accent}14, transparent)` }}>
                  <div className="font-display text-[11px] uppercase tracking-[0.22em]" style={{ color: p.accent }}>Outcome</div>
                  <p className="mt-1.5 text-sm" style={{ color: "var(--text)" }}>{dd.outcome}</p>
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-3">
                {p.live && (
                  <a href={p.live} target="_blank" rel="noreferrer" className="font-display inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold" style={{ background: p.accent, color: "#0b0911" }}>
                    Live site <Icon.link />
                  </a>
                )}
                {p.repo && (
                  <a href={p.repo} target="_blank" rel="noreferrer" className="font-display inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm" style={{ border: "1px solid var(--border-2)", color: "var(--text)" }}>
                    <Icon.github /> Source
                  </a>
                )}
                {extra.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="font-display inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm" style={{ border: "1px solid var(--border-2)", color: "var(--text)" }}>
                    {l.label} <Icon.link />
                  </a>
                ))}
                <span className="ml-auto font-display text-xs" style={{ color: "var(--muted)" }}>{index + 1} / {total} · {p.year}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* gate intro: animated PROJECTS title you zoom through to get inside */
function GateIntro() {
  const letters = "PROJECTS".split("");
  return (
    <div className="px-6 text-center" style={{ perspective: 900 }}>
      <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="font-display text-xs uppercase tracking-[0.45em]" style={{ color: "var(--accent-soft)" }}>
        Selected work
      </motion.p>
      <motion.h2
        className="font-display mt-4 font-bold leading-none tracking-tight"
        style={{ fontSize: "clamp(3.5rem, 15vw, 12rem)", color: "#f4f2fb" }}
        initial="h"
        animate="s"
        transition={{ staggerChildren: 0.07, delayChildren: 0.15 }}
      >
        {letters.map((ch, i) => (
          <motion.span key={i} className="inline-block" style={{ transformStyle: "preserve-3d" }} variants={{ h: { opacity: 0, y: 70, rotateX: -90 }, s: { opacity: 1, y: 0, rotateX: 0 } }} transition={{ duration: 0.7, ease }}>
            {ch}
          </motion.span>
        ))}
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85, duration: 0.6 }} className="mx-auto mt-6 max-w-md text-base" style={{ color: "var(--muted)" }}>
        Four production systems — built, shipped, and self-hosted. Keep scrolling to step inside.
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-9">
        <span className="font-display text-xs uppercase tracking-[0.3em]" style={{ color: "var(--muted)" }}>Enter ↓</span>
      </motion.div>
    </div>
  );
}

/* the light "inside" world — a different world from the dark exterior */
function LightWorld() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true" style={{ background: "linear-gradient(160deg, #eceaf7 0%, #f4f1fb 38%, #f8eef4 68%, #edf1fc 100%)" }}>
      {/* colourful drifting blobs */}
      <div className="blob" style={{ top: "-14%", left: "1%", width: 540, height: 540, background: "rgba(150,120,255,0.32)" }} />
      <div className="blob" style={{ bottom: "-16%", right: "3%", width: 580, height: 580, background: "rgba(100,170,255,0.28)", animationDelay: "3s" }} />
      <div className="blob" style={{ top: "18%", right: "22%", width: 420, height: 420, background: "rgba(255,150,190,0.24)", animationDelay: "6s" }} />
      <div className="blob" style={{ bottom: "8%", left: "24%", width: 440, height: 440, background: "rgba(110,220,190,0.22)", animationDelay: "9s" }} />
      <div className="blob" style={{ top: "38%", left: "42%", width: 360, height: 360, background: "rgba(255,200,140,0.18)", animationDelay: "2s" }} />
      {/* drifting particle field */}
      <LightParticles className="absolute inset-0 h-full w-full" />
      {/* floating soft objects */}
      <div className="absolute" style={{ top: "15%", left: "13%", width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, rgba(139,92,246,0.55), rgba(99,160,255,0.45))", boxShadow: "0 22px 50px -10px rgba(139,92,246,0.45)", transform: "rotate(18deg)" }} />
      <div className="absolute" style={{ bottom: "18%", right: "16%", width: 54, height: 54, borderRadius: 9999, background: "linear-gradient(135deg, rgba(236,130,200,0.6), rgba(255,170,120,0.5))", boxShadow: "0 18px 44px -10px rgba(236,130,200,0.45)" }} />
      <div className="absolute" style={{ top: "60%", left: "8%", width: 42, height: 42, borderRadius: 12, background: "rgba(110,220,190,0.5)", transform: "rotate(-12deg)", boxShadow: "0 14px 34px -8px rgba(110,220,190,0.45)" }} />
      <div className="absolute" style={{ top: "24%", right: "8%", width: 38, height: 38, borderRadius: 9999, background: "rgba(255,180,120,0.5)", boxShadow: "0 14px 34px -8px rgba(255,180,120,0.4)" }} />
      {/* faint grid, masked */}
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(90,70,150,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(90,70,150,0.05) 1px, transparent 1px)", backgroundSize: "52px 52px", maskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, #000 40%, transparent 92%)", WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, #000 40%, transparent 92%)" }} />
    </div>
  );
}

function Work() {
  const { projects } = useContent();
  const isDesktop = useIsDesktop();
  const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ref = useRef(null);
  const N = projects.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // all scroll-driven values up here (before any return) — rules of hooks
  // transforms only (opacity MotionValues don't bind reliably here) — the inner
  // world zooms open over the gate, then the track scrolls horizontally.
  // 3D-immersive portal (transforms only). The inside rises + tilts up into view
  // over the gate, then the track scrolls horizontally, then it all reverses on
  // the way out to About. trackX only moves once fully inside → only the first
  // project is visible as it opens.
  // 3D gate: two doors swing open revealing the world behind, the title recedes
  // into the opening, the first project zooms into place — all reverses on exit.
  const doorL = useTransform(scrollYProgress, [0.05, 0.32, 0.78, 1], [0, -110, -110, 0]);
  const doorR = useTransform(scrollYProgress, [0.05, 0.32, 0.78, 1], [0, 110, 110, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.22, 0.82, 1], [1, 0, 0, 1]);
  const titleZ = useTransform(scrollYProgress, [0, 0.22, 0.82, 1], [0, -360, -360, 0]);
  const innerScale = useTransform(scrollYProgress, [0.05, 0.34, 0.78, 1], [1.2, 1, 1, 1.2]);
  const trackX = useTransform(scrollYProgress, [0.36, 0.74], ["0vw", `-${(N - 1) * 100}vw`]);
  // which project is centred while the portal is open — used to dissolve its backgrounds
  // once you pause on it (the timers in ProjectSlide only complete if it stays active).
  const [activeIdx, setActiveIdx] = useState(-1);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const openNow = v >= 0.355 && v <= 0.78;
    const idx = openNow ? Math.min(N - 1, Math.max(0, Math.round(((v - 0.36) / 0.38) * (N - 1)))) : -1;
    setActiveIdx((prev) => (prev === idx ? prev : idx));
  });

  // mobile / reduced-motion: a plain vertical stack (no scroll-jacking, no portal)
  if (!isDesktop || reduce) {
    return (
      <section id="work" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <Heading tag="Selected work" title="Systems I designed, built, and run." sub="Four production projects — three of them live right now, served from a single self-hosted home server." />
        <div className="grid gap-6">
          {projects.map((p, i) => (
            <ProjectCard key={`p-${i}`} p={p} index={i} />
          ))}
        </div>
      </section>
    );
  }

  // desktop portal: scroll into the gate → zoom inside → horizontal scroll through
  // the projects in a different (light) world → release back to vertical.
  return (
    <section id="work" ref={ref} className="relative" style={{ height: `${(N + 1.9) * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden" style={{ perspective: 1500 }}>
        {/* INSIDE — the light world, revealed as the gate swings open + zoomed in */}
        <motion.div className="absolute inset-0 z-10" style={{ scale: innerScale }}>
          <LightWorld />
          <motion.div className="relative flex h-full" style={{ x: trackX }}>
            {projects.map((p, i) => (
              <ProjectSlide key={`p-${i}`} p={p} index={i} total={N} active={i === activeIdx} />
            ))}
          </motion.div>
        </motion.div>
        {/* GATE DOORS — two dark panels hinged at the outer edges that swing open */}
        <motion.div
          className="pointer-events-none absolute left-0 top-0 z-30 h-full w-1/2"
          style={{
            rotateY: doorL,
            transformOrigin: "left center",
            backfaceVisibility: "hidden",
            backgroundColor: "#08070d",
            backgroundImage: "linear-gradient(90deg, #050409 56%, #120e1e)",
            boxShadow: "inset -2px 0 46px -10px rgba(139,92,246,0.42)",
          }}
        />
        <motion.div
          className="pointer-events-none absolute right-0 top-0 z-30 h-full w-1/2"
          style={{
            rotateY: doorR,
            transformOrigin: "right center",
            backfaceVisibility: "hidden",
            backgroundColor: "#08070d",
            backgroundImage: "linear-gradient(270deg, #050409 56%, #120e1e)",
            boxShadow: "inset 2px 0 46px -10px rgba(139,92,246,0.42)",
          }}
        />
        {/* TITLE + floating tech-icon tiles — recede back into the opening gate */}
        <motion.div className="pointer-events-none absolute inset-0 z-40" style={{ scale: titleScale, z: titleZ }}>
          {/* soft fade so the gate's top edge melts into the section above — recedes with the gate */}
          <div className="absolute inset-x-0 top-0 h-[26vh]" style={{ background: "linear-gradient(to bottom, var(--bg) 0%, rgba(8,7,11,0.55) 42%, transparent 100%)" }} />
          <GateIcons />
          <div className="absolute inset-0 flex items-center justify-center">
            <GateIntro />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- about ---------------- */
function About() {
  const { profile, quote, achievements } = useContent();
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="grid items-center gap-12 md:grid-cols-[0.85fr_1.15fr]">
        <Reveal className="relative mx-auto w-full max-w-[340px]">
          <div className="absolute -inset-3 rounded-[2rem] opacity-70 blur-2xl" style={{ background: "radial-gradient(circle at 50% 35%, var(--glow), transparent 70%)" }} />
          <div className="relative overflow-hidden rounded-[1.6rem]" style={{ border: "1px solid var(--border)", background: "radial-gradient(circle at 50% 38%, rgba(124,92,255,0.07), rgba(8,7,11,0.9))" }}>
            <div style={{ width: "100%", aspectRatio: "5 / 6" }}>
              <AvatarMark />
            </div>
          </div>
        </Reveal>

        <div>
          <Heading tag="About" title="I take systems to their failure mode — then build the one that scales." />
          <Reveal delay={0.1}>
            <p className="max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: "var(--muted)" }}>
              I'm {profile.name}, a {profile.role.toLowerCase()} who self-hosts an entire production stack — object storage, a deployment PaaS, real-time backends — on my own hardware, exposed to the world through a Cloudflare Tunnel at $0/mo. I care most about the boring parts that decide whether a system survives: integrity, concurrency, and the failure path.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <blockquote className="font-display mt-7 border-l-2 pl-5 text-lg italic leading-snug" style={{ borderColor: "var(--accent)", color: "var(--text)" }}>
              “{quote}”
            </blockquote>
          </Reveal>
          <Reveal delay={0.22}>
            <ul className="mt-7 space-y-2.5">
              {achievements.map((a) => (
                <li key={a} className="flex items-start gap-3 text-sm" style={{ color: "var(--muted)" }}>
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--accent)" }} />
                  {a}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.28}>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {profile.links.map((l) => {
                const I = iconFor(l.icon);
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-colors duration-200"
                    style={{ border: "1px solid var(--border-2)", color: "var(--muted)", textDecoration: "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border-2)"; }}
                  >
                    <I /> {l.short}
                  </a>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- skills ---------------- */
function Skills() {
  const { craftGroups } = useContent();
  return (
    <section id="skills" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <Heading tag="Craft" title="The toolkit behind the systems." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {craftGroups.map((g, i) => (
          <Reveal key={g.name} delay={(i % 3) * 0.07}>
            <div
              className="h-full rounded-2xl p-6 transition-colors duration-300"
              style={{ border: "1px solid var(--border-2)", background: "var(--surface)" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
            >
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--accent-soft)" }}>{g.name}</h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{g.items}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- contact ---------------- */
function Contact() {
  const { profile } = useContent();
  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <Reveal>
        <div className="ring-grad relative overflow-hidden rounded-[2rem] px-7 py-16 text-center sm:px-16 sm:py-20">
          <div className="blob" style={{ top: "-40%", left: "50%", transform: "translateX(-50%)", width: 520, height: 520, background: "rgba(139,92,246,0.18)" }} />
          <div className="relative">
            <span className="font-display text-xs font-medium uppercase tracking-[0.28em]" style={{ color: "var(--accent-soft)" }}>Contact</span>
            <h2 className="font-display mx-auto mt-4 max-w-3xl text-[clamp(2rem,5vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.02em]">
              Let's build something <span className="grad-text">that scales.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm sm:text-base" style={{ color: "var(--muted)" }}>
              Open to internships, freelance, and full-time roles from 2027. {profile.location}.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="font-display inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-deep))", color: "#fff", textDecoration: "none", boxShadow: "0 12px 34px -10px var(--glow)" }}
              >
                <Icon.mail /> {profile.email}
              </a>
              <a
                href={profile.resumeUrl}
                className="font-display inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm transition-colors duration-200"
                style={{ border: "1px solid var(--border-2)", color: "var(--text)", textDecoration: "none", background: "rgba(20,17,30,0.4)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
              >
                Résumé
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- footer ---------------- */
function Footer() {
  const { profile } = useContent();
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-12 pt-4">
      <div className="flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row" style={{ borderColor: "var(--border-2)" }}>
        <p className="text-xs" style={{ color: "var(--muted)" }}>© 2026 {profile.name} · self-hosted, $0/mo</p>
        <div className="flex items-center gap-4">
          {profile.links.map((l) => {
            const I = iconFor(l.icon);
            return (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" aria-label={l.label} className="transition-colors duration-200" style={{ color: "var(--muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                <I />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}

function readRoute() {
  if (typeof window === "undefined") return "site";
  return (window.location.hash || "").replace(/[#/]+/g, "") === "studio" ? "studio" : "site";
}

function Portfolio() {
  return (
    <MotionConfig reducedMotion="user">
      <Background />
      <TenbinBackground />
      <Header />
      <main>
        <Hero />
        <Stats />
        <Work />
        <About />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const on = () => setRoute(readRoute());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  if (route === "studio") return <Studio />;
  return (
    <ContentProvider>
      <Portfolio />
    </ContentProvider>
  );
}
