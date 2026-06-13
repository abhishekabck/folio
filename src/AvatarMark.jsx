import { useEffect, useRef } from "react";

/* Designed avatar mark — an "AC" monogram at the centre of slowly counter-rotating
   orbital rings with glowing satellite nodes, on a themed backdrop. A nod to the
   self-hosted "system" he runs. Cursor-parallax tilt; calm for reduced-motion. */
const SAT = [0, 70, 138, 210, 286];

export default function AvatarMark() {
  const ref = useRef(null);
  const tilt = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current, t = tilt.current;
    if (!el || !t) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const mx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      const my = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      t.style.transform = `rotateX(${(-my * 9).toFixed(2)}deg) rotateY(${(mx * 11).toFixed(2)}deg)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={ref} className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* faint grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(124,92,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.07) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(ellipse 75% 70% at 50% 42%, #000 35%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 70% at 50% 42%, #000 35%, transparent 85%)",
        }}
      />
      {/* core glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[44%] h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5), transparent 66%)", filter: "blur(16px)" }}
      />

      {/* the mark — floats; inner group tilts with the cursor */}
      <div className="mark-float relative flex w-full flex-1 items-center justify-center" style={{ perspective: 750 }}>
        <div ref={tilt} className="relative" style={{ width: "min(76%, 230px)", aspectRatio: "1 / 1", transformStyle: "preserve-3d", transition: "transform 0.25s ease-out" }}>
          {/* outer gradient ring */}
          <svg viewBox="-100 -100 200 200" className="spin-slow absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id="amRing" x1="-100" y1="-100" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="0.5" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="1" stopColor="#d478c4" />
              </linearGradient>
            </defs>
            <circle cx="0" cy="0" r="94" fill="none" stroke="url(#amRing)" strokeWidth="1.5" />
          </svg>
          {/* middle dashed ring, counter-rotating */}
          <svg viewBox="-100 -100 200 200" className="spin-rev absolute inset-0 h-full w-full" aria-hidden="true">
            <circle cx="0" cy="0" r="72" fill="none" stroke="#a78bfa" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="1.5 9" strokeLinecap="round" />
          </svg>
          {/* orbiting satellite nodes */}
          <svg viewBox="-100 -100 200 200" className="spin-mid absolute inset-0 h-full w-full" aria-hidden="true">
            {SAT.map((a, i) => (
              <circle
                key={i}
                r={i % 2 ? 2.6 : 3.4}
                cx="0"
                cy="-83"
                transform={`rotate(${a})`}
                fill={i % 2 ? "#d478c4" : "#a78bfa"}
                style={{ filter: `drop-shadow(0 0 5px ${i % 2 ? "rgba(212,120,196,0.9)" : "rgba(167,139,250,0.9)"})` }}
              />
            ))}
          </svg>
          {/* centre disc + monogram (pops forward in 3D) */}
          <div
            className="absolute left-1/2 top-1/2 grid place-items-center rounded-full"
            style={{
              width: "56%",
              height: "56%",
              transform: "translate(-50%,-50%) translateZ(34px)",
              background: "radial-gradient(circle at 50% 32%, rgba(44,35,70,0.95), rgba(11,9,18,0.97))",
              border: "1px solid rgba(167,139,250,0.32)",
              boxShadow: "0 22px 54px -14px rgba(124,92,255,0.7), inset 0 1px 0 rgba(255,255,255,0.09)",
            }}
          >
            <span className="font-display grad-text font-bold leading-none" style={{ fontSize: "clamp(2rem, 6.5vw, 3rem)", letterSpacing: "0.02em" }}>AC</span>
          </div>
        </div>
      </div>

      {/* caption */}
      <div className="relative pb-5 text-center">
        <div className="font-display text-sm font-semibold" style={{ color: "var(--text)" }}>Abhishek Chaurasiya</div>
        <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Full-stack Engineer</div>
      </div>
    </div>
  );
}
