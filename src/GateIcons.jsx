import { useEffect, useRef } from "react";

/* floating glassy tech-icon tiles around the PROJECTS gate — gentle 3D float +
   cursor parallax. Decorative; recedes with the gate as it opens. */
const SVG = {
  db: (
    <g>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14a8 3 0 0 0 16 0V5M4 12a8 3 0 0 0 16 0" />
    </g>
  ),
  code: <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
  globe: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18" />
    </g>
  ),
  box: <path d="M12 2 21 7v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10" />,
  net: (
    <g>
      <circle cx="5" cy="18" r="2.4" />
      <circle cx="19" cy="18" r="2.4" />
      <circle cx="12" cy="5" r="2.4" />
      <path d="M7 16.5 10.5 7M13.5 7 17 16.5M7.5 18h9" />
    </g>
  ),
  cpu: (
    <g>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </g>
  ),
  sync: <path d="M21 8a9 9 0 0 0-15-3.5L3 8M3 4v4h4M3 16a9 9 0 0 0 15 3.5L21 16M21 20v-4h-4" />,
};

const TILES = [
  { icon: "db", x: 8, y: 30, d: 34, s: 66, dur: 7, delay: 0 },
  { icon: "code", x: 91, y: 27, d: 24, s: 56, dur: 8.5, delay: 0.8 },
  { icon: "bolt", x: 5, y: 56, d: 40, s: 60, dur: 6.5, delay: 1.6 },
  { icon: "globe", x: 95, y: 54, d: 28, s: 68, dur: 7.8, delay: 0.4 },
  { icon: "box", x: 11, y: 80, d: 22, s: 54, dur: 9, delay: 1.2 },
  { icon: "net", x: 88, y: 80, d: 36, s: 62, dur: 7.2, delay: 2 },
  { icon: "cpu", x: 22, y: 21, d: 16, s: 48, dur: 8, delay: 0.5 },
  { icon: "sync", x: 79, y: 19, d: 18, s: 50, dur: 6.8, delay: 1.4 },
];

export default function GateIcons() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e) => {
      el.style.setProperty("--mx", (((e.clientX / window.innerWidth) * 2 - 1)).toFixed(3));
      el.style.setProperty("--my", (((e.clientY / window.innerHeight) * 2 - 1)).toFixed(3));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return (
    <div ref={ref} className="absolute inset-0" aria-hidden="true" style={{ "--mx": 0, "--my": 0, perspective: 1000 }}>
      {TILES.map((t, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            transform: `translate(-50%,-50%) translate3d(calc(var(--mx) * ${t.d}px), calc(var(--my) * ${t.d}px), 0)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          <div
            className="gate-float grid place-items-center rounded-2xl"
            style={{
              width: t.s,
              height: t.s,
              animationDuration: `${t.dur}s`,
              animationDelay: `${t.delay}s`,
              background: "linear-gradient(135deg, rgba(32,26,50,0.62), rgba(15,12,24,0.5))",
              border: "1px solid rgba(167,139,250,0.28)",
              boxShadow: "0 18px 44px -12px rgba(124,92,255,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
              backdropFilter: "blur(6px)",
              color: "#c8b8ff",
            }}
          >
            <svg viewBox="0 0 24 24" width={t.s * 0.42} height={t.s * 0.42} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {SVG[t.icon]}
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
