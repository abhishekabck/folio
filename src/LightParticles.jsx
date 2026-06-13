import { useEffect, useRef } from "react";

/* "magic" particle field for the light inside-world: glowing pastel motes that
   twinkle, gently swirl and float upward, link with faint threads, and brighten
   + gather toward the cursor. Canvas 2D, hot path in rAF, calm for reduced-motion. */
const PAL = [
  [124, 58, 237], // violet
  [37, 110, 235], // blue
  [220, 60, 150], // pink
  [14, 165, 140], // teal
  [232, 140, 28], // amber
];

export default function LightParticles({ className, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };

    // pre-render a soft glow sprite per colour
    const sprites = PAL.map((c) => {
      const s = document.createElement("canvas");
      s.width = s.height = 36;
      const sc = s.getContext("2d");
      const g = sc.createRadialGradient(18, 18, 0, 18, 18, 18);
      g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},1)`);
      g.addColorStop(0.28, `rgba(${c[0]},${c[1]},${c[2]},0.6)`);
      g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      sc.fillStyle = g;
      sc.fillRect(0, 0, 36, 36);
      return s;
    });

    let raf = 0, w = 0, h = 0, parts = [], t = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.floor((w * h) / 17000));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        size: Math.random() * 4.5 + 3,
        phase: Math.random() * 6.283,
        tw: 0.6 + Math.random() * 1.6,
        ci: (Math.random() * PAL.length) | 0,
        a: 0.6 + Math.random() * 0.4,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const LINK = 116;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      // faint magic threads
      ctx.lineWidth = 1;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(150,120,210,${(1 - d / LINK) * 0.1})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (!reduce) {
          // gentle swirl + upward float
          p.vx += Math.sin(p.y * 0.012 + t * 0.6) * 0.006;
          p.vy += Math.cos(p.x * 0.012 + t * 0.5) * 0.006 - 0.004;
          // cursor magic: gather + sparkle
          const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
          const md = Math.hypot(mdx, mdy);
          let spark = 0;
          if (md < 150) {
            const f = 1 - md / 150;
            p.vx += (mdx / (md + 1)) * f * 0.18;
            p.vy += (mdy / (md + 1)) * f * 0.18;
            spark = f;
          }
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;
          p._spark = spark;
        }
        // twinkle (sharp peaks like distant stars)
        const tw = 0.5 + 0.5 * Math.sin(t * p.tw + p.phase);
        const alpha = Math.min(1, p.a * (0.45 + 0.55 * tw * tw) + (p._spark || 0) * 0.9);
        const sz = p.size * (1 + (p._spark || 0) * 1.5);
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprites[p.ci], p.x - sz, p.y - sz, sz * 2, sz * 2);
        // crisp colour core for a defined twinkle
        const c = PAL[p.ci];
        ctx.globalAlpha = Math.min(1, alpha + 0.15);
        ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.7, sz * 0.32), 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    if (reduce) draw();
    else raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className={className} style={{ pointerEvents: "none", ...style }} />;
}
