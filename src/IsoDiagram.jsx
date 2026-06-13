/* Dark, minimal isometric architecture diagram (Spline-style): dark iso cubes on
   faint tiles, thin connections, small monochrome icons, and ONE soft gradient
   glow that travels softly through the flow. Blends into the panel. */
const UX = 48, UY = 24, A = 23, B = 11.5, H = 17;
const STEP = 0.6; // seconds between each component lighting up

const TOP = "#1e1932", RIGHT = "#15111f", LEFT = "#100c18", TILE = "#0c0a13";

const ICONS = {
  db: <g><ellipse cx="0" cy="-5" rx="6" ry="2.3" /><path d="M-6 -5 V4 a6 2.3 0 0 0 12 0 V-5 M-6 -0.5 a6 2.3 0 0 0 12 0" /></g>,
  bolt: <path d="M1.5 -7 L-4 1 H0 L-1.5 7 L5 -1 H1 Z" />,
  cpu: <g><rect x="-5" y="-5" width="10" height="10" rx="1.4" /><rect x="-2" y="-2" width="4" height="4" /><path d="M-2 -5 V-8 M2 -5 V-8 M-2 5 V8 M2 5 V8 M-5 -2 H-8 M-5 2 H-8 M5 -2 H8 M5 2 H8" /></g>,
  globe: <g><circle cx="0" cy="0" r="6.3" /><ellipse cx="0" cy="0" rx="3" ry="6.3" /><path d="M-6.3 0 H6.3" /></g>,
  user: <g><circle cx="0" cy="-3.5" r="3" /><path d="M-5.5 6 a5.5 5 0 0 1 11 0" /></g>,
  code: <path d="M-3 -5 L-8 0 L-3 5 M3 -5 L8 0 L3 5" />,
  box: <path d="M0 -7 L7 -3 V4 L0 8 L-7 4 V-3 Z M-7 -3 L0 1 L7 -3 M0 1 V8" />,
  net: <g><circle cx="-6" cy="4" r="1.7" /><circle cx="6" cy="4" r="1.7" /><circle cx="0" cy="-6" r="1.7" /><path d="M-4.6 2.9 L-1.2 -4.4 M1.2 -4.4 L4.6 2.9 M-4.2 4 H4.2" /></g>,
  sync: <path d="M6 -1.5 a6 6 0 1 0 -1.6 5.2 M6 -6 V-1.5 H1.5" />,
  cart: <g><path d="M-7 -5 H-4 L-2 4 H5 L7 -1.5 H-3" /><circle cx="-1" cy="7" r="1.2" /><circle cx="4" cy="7" r="1.2" /></g>,
  coin: <g><circle cx="0" cy="0" r="6.3" /><path d="M0 -4 V4 M-2 -1.6 h3 a1.6 1.6 0 0 1 0 3.2 h-3" /></g>,
  push: <path d="M0 7 V-6 M-4 -2 L0 -7 L4 -2" />,
};
function pickIcon(n) {
  const s = (n.label + " " + (n.sub || "") + " " + n.id).toLowerCase();
  if (/redis|valkey|cache/.test(s)) return "bolt";
  if (/postgres|\bpg\b|sql|object store|merkle|database/.test(s)) return "db";
  if (/ffmpeg|worker|encode/.test(s)) return "cpu";
  if (/delivery|live app|cdn|tunnel|hls/.test(s)) return "globe";
  if (/client|visitor/.test(s)) return "user";
  if (/sidecar|sync/.test(s)) return "sync";
  if (/ports|nginx/.test(s)) return "net";
  if (/session|cart/.test(s)) return "cart";
  if (/payment|price|pay/.test(s)) return "coin";
  if (/push|git/.test(s)) return "push";
  if (/build|docker/.test(s)) return "box";
  if (/api|sigv4|fastapi|fn/.test(s)) return "code";
  return "box";
}

export default function IsoDiagram({ arch, accent }) {
  const total = arch.nodes.length;
  const nodes = arch.nodes.map((n, i) => {
    const gx = n.x / 175, gy = n.y / 88;
    return { ...n, order: i, sx: (gx - gy) * UX, sy: (gx + gy) * UY };
  });
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const gid = arch.focal || "x";
  const xs = nodes.flatMap((n) => [n.sx - A - 40, n.sx + A + 40]);
  const ys = nodes.flatMap((n) => [n.sy - H - B - 42, n.sy + B + 36]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const vb = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  const cycle = total * STEP;

  const Cube = ({ n }) => {
    const { sx, sy } = n;
    const top = `${sx},${sy - H - B} ${sx + A},${sy - H} ${sx},${sy - H + B} ${sx - A},${sy - H}`;
    const right = `${sx},${sy - H + B} ${sx + A},${sy - H} ${sx + A},${sy} ${sx},${sy + B}`;
    const left = `${sx - A},${sy - H} ${sx},${sy - H + B} ${sx},${sy + B} ${sx - A},${sy}`;
    const tile = `${sx},${sy - B * 1.5} ${sx + A * 1.35},${sy} ${sx},${sy + B * 1.5} ${sx - A * 1.35},${sy}`;
    const focal = n.id === arch.focal;
    const seq = { animationDuration: `${cycle}s`, animationDelay: `${n.order * STEP}s` };
    return (
      <g>
        {/* faint floor tile */}
        <polygon points={tile} fill={TILE} stroke="rgba(167,139,250,0.10)" strokeWidth="0.5" />
        {/* soft traveling glow */}
        <circle className="node-seq" cx={sx} cy={sy - H} r="40" fill={`url(#sg-${gid})`} style={seq} />
        {/* dark cube */}
        <polygon points={left} fill={LEFT} />
        <polygon points={right} fill={RIGHT} />
        <polygon points={top} fill={TOP} stroke={focal ? accent : "rgba(255,255,255,0.07)"} strokeWidth={focal ? 0.8 : 0.5} strokeOpacity={focal ? 0.55 : 1} />
        {/* small monochrome icon */}
        <g transform={`translate(${sx},${sy - H - 0.5}) scale(0.8)`} stroke="#c9c2da" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6">
          {ICONS[pickIcon(n)]}
        </g>
        <text x={sx} y={sy + B + 18} textAnchor="middle" fontSize="9.5" fill="#cfcad9" style={{ fontWeight: 600 }}>{n.label}</text>
        <text x={sx} y={sy + B + 28} textAnchor="middle" fontSize="7" fill="#857e95">{n.sub}</text>
      </g>
    );
  };

  const focalNode = arch.focal && byId[arch.focal];
  return (
    <svg viewBox={vb} className="iso-float" style={{ width: "100%", height: "100%" }} role="img" aria-label="architecture diagram">
      <defs>
        <radialGradient id={`sg-${gid}`}>
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="42%" stopColor={accent} stopOpacity="0.14" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* thin connections */}
      {arch.edges.map(([a, b], i) => {
        const A2 = byId[a], B2 = byId[b];
        if (!A2 || !B2) return null;
        return <line key={i} className="iso-edge" x1={A2.sx} y1={A2.sy} x2={B2.sx} y2={B2.sy} stroke={accent} strokeWidth="1" strokeOpacity="0.28" strokeLinecap="round" style={{ animationDelay: `${i * 0.2}s` }} />;
      })}
      {/* persistent soft focal glow */}
      {focalNode && <circle className="iso-glow" cx={focalNode.sx} cy={focalNode.sy - H} r="52" fill={`url(#sg-${gid})`} />}
      {nodes.slice().sort((p, q) => p.sy - q.sy).map((n) => <Cube key={n.id} n={n} />)}
    </svg>
  );
}
