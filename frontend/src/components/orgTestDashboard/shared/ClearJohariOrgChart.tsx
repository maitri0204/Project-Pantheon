"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type ClearJohariOrgChartProps = {
  avgSolicitsFeedback: number;
  avgSelfDisclosure: number;
  open: number;
  blind: number;
  hidden: number;
  unknown: number;
};

const G_SIZE = 400;
const G_LEFT = 72;
const G_TOP = 48;
const G_RIGHT = G_LEFT + G_SIZE;
const G_BOTTOM = G_TOP + G_SIZE;
const TICKS = [0, 10, 20, 30, 40, 50];

function dataX(sf: number) {
  return G_LEFT + (Math.min(50, Math.max(0, sf)) / 50) * G_SIZE;
}

function dataY(sd: number) {
  return G_BOTTOM - (Math.min(50, Math.max(0, sd)) / 50) * G_SIZE;
}

const QUADRANT_PIE = [
  { key: "open", name: "Open Area", fill: "#10b981" },
  { key: "blind", name: "Blind Spot", fill: "#f59e0b" },
  { key: "hidden", name: "Hidden Area", fill: "#0ea5e9" },
  { key: "unknown", name: "Unknown", fill: "#8b5cf6" },
] as const;

export function ClearJohariOrgChart({
  avgSolicitsFeedback,
  avgSelfDisclosure,
  open,
  blind,
  hidden,
  unknown,
}: ClearJohariOrgChartProps) {
  const px = dataX(avgSolicitsFeedback);
  const py = dataY(avgSelfDisclosure);
  const values: Record<string, number> = { open, blind, hidden, unknown };
  const pieData = QUADRANT_PIE.map((q) => ({
    name: q.name,
    value: values[q.key] || 0,
    fill: q.fill,
  })).filter((d) => d.value > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-4">
        <p className="text-sm font-semibold text-black mb-1">Org-average CLEAR map</p>
        <p className="text-xs text-black/60 mb-4">
          Cohort position on Solicits Feedback (horizontal) and Self-Disclosure (vertical).
        </p>
        <div className="flex justify-center overflow-x-auto">
          <svg
            viewBox={`0 0 ${G_RIGHT + 28} ${G_BOTTOM + 24}`}
            className="w-full max-w-[560px]"
            role="img"
            aria-label="CLEAR Johari window org average"
          >
            <defs>
              <pattern id="clear-unknown-hatch" patternUnits="userSpaceOnUse" width="10" height="10">
                <path d="M0,0 l10,10" stroke="rgba(139,92,246,0.35)" strokeWidth="1" />
                <path d="M10,0 l-10,10" stroke="rgba(139,92,246,0.35)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x={G_LEFT} y={G_TOP} width={Math.max(1, px - G_LEFT)} height={Math.max(1, py - G_TOP)} fill="rgba(16,185,129,0.14)" />
            <rect x={px} y={G_TOP} width={Math.max(1, G_RIGHT - px)} height={Math.max(1, py - G_TOP)} fill="rgba(245,158,11,0.14)" />
            <rect x={G_LEFT} y={py} width={Math.max(1, px - G_LEFT)} height={Math.max(1, G_BOTTOM - py)} fill="rgba(59,130,246,0.14)" />
            <rect x={px} y={py} width={Math.max(1, G_RIGHT - px)} height={Math.max(1, G_BOTTOM - py)} fill="url(#clear-unknown-hatch)" />
            <rect x={G_LEFT} y={G_TOP} width={G_SIZE} height={G_SIZE} fill="none" stroke="#1e293b" strokeWidth={2} />
            {TICKS.map((t) => {
              const x = dataX(t);
              return (
                <g key={`xt-${t}`}>
                  <line x1={x} y1={G_TOP} x2={x} y2={G_TOP - 6} stroke="#334155" strokeWidth={1.2} />
                  {t > 0 && t < 50 ? (
                    <line x1={x} y1={G_TOP} x2={x} y2={G_BOTTOM} stroke="#e2e8f0" strokeWidth={0.6} />
                  ) : null}
                  <text x={x} y={G_TOP - 10} textAnchor="middle" fontSize={11} fill="#64748b">
                    {t}
                  </text>
                </g>
              );
            })}
            <text x={(G_LEFT + G_RIGHT) / 2} y={G_TOP - 28} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1e293b">
              Solicits Feedback
            </text>
            {TICKS.map((t) => {
              const y = dataY(t);
              return (
                <g key={`yt-${t}`}>
                  <line x1={G_LEFT - 5} y1={y} x2={G_LEFT} y2={y} stroke="#334155" strokeWidth={1.2} />
                  {t > 0 && t < 50 ? (
                    <line x1={G_LEFT} y1={y} x2={G_RIGHT} y2={y} stroke="#e2e8f0" strokeWidth={0.6} />
                  ) : null}
                  <text x={G_LEFT - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#64748b">
                    {t}
                  </text>
                </g>
              );
            })}
            <line x1={px} y1={G_TOP} x2={px} y2={G_BOTTOM} stroke="#475569" strokeWidth={1.5} strokeDasharray="5 4" />
            <line x1={G_LEFT} y1={py} x2={G_RIGHT} y2={py} stroke="#475569" strokeWidth={1.5} strokeDasharray="5 4" />
            <text x={(G_LEFT + px) / 2} y={(G_TOP + py) / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="#059669">
              OPEN
            </text>
            <text x={(px + G_RIGHT) / 2} y={(G_TOP + py) / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="#d97706">
              BLIND
            </text>
            <text x={(G_LEFT + px) / 2} y={(py + G_BOTTOM) / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="#2563eb">
              HIDDEN
            </text>
            <text x={(px + G_RIGHT) / 2} y={(py + G_BOTTOM) / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="#7c3aed">
              UNKNOWN
            </text>
            <circle cx={px} cy={py} r={8} fill="#4f46e5" stroke="#fff" strokeWidth={2.5} />
            <text x={px + 14} y={py - 8} fontSize={11} fontWeight={600} fill="#4f46e5">
              Org avg ({avgSolicitsFeedback.toFixed(0)}, {avgSelfDisclosure.toFixed(0)})
            </text>
            <text
              x={16}
              y={(G_TOP + G_BOTTOM) / 2}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill="#334155"
              transform={`rotate(-90, 16, ${(G_TOP + G_BOTTOM) / 2})`}
            >
              Willingness to Self-Disclose
            </text>
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-black">Quadrant area share</p>
          <p className="text-xs text-black/60 mb-3">Average proportion of each Johari region.</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  formatter={(value) => [`${Number(value ?? 0)}%`, ""]}
                />
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {QUADRANT_PIE.map((q) => (
              <div key={q.key} className="flex items-center gap-2 text-xs text-black">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: q.fill }} />
                <span className="flex-1 truncate">{q.name}</span>
                <span className="font-semibold">{values[q.key]?.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-black mb-3">Quadrant balance</p>
          <div className="flex h-8 w-full overflow-hidden rounded-full">
            {pieData.map((seg) => (
              <div
                key={seg.name}
                style={{ width: `${seg.value}%`, backgroundColor: seg.fill }}
                title={`${seg.name}: ${seg.value}%`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
