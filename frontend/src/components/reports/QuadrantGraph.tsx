"use client";

import { getQuadrantLabel, QUADRANT_LABELS } from "@/lib/reports/reportConstants";

interface QuadrantGraphProps {
  knowledgePct: number;
  regulationPct: number;
  accentColor?: string;
}

export default function QuadrantGraph({ knowledgePct, regulationPct, accentColor = "#1d4ed8" }: QuadrantGraphProps) {
  const PAD_L = 72, PAD_B = 64, PAD_R = 24, PAD_T = 24;
  const W = 480, H = 480;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const toSvgX = (pct: number) => PAD_L + (pct / 100) * plotW;
  const toSvgY = (pct: number) => PAD_T + plotH - (pct / 100) * plotH;

  const midX = toSvgX(50);
  const midY = toSvgY(50);
  const px = toSvgX(knowledgePct);
  const py = toSvgY(regulationPct);

  const kp = knowledgePct;
  const rp = regulationPct;

  const quadrantLabel = getQuadrantLabel(kp, rp);

  let hlColor: string;
  if (kp >= 50 && rp >= 50) hlColor = "rgba(34,197,94,0.25)";
  else if (kp < 50 && rp >= 50) hlColor = "rgba(59,130,246,0.25)";
  else if (kp < 50 && rp < 50) hlColor = "rgba(239,68,68,0.25)";
  else hlColor = "rgba(234,179,8,0.25)";

  let hlX: number, hlY: number, hlW: number, hlH: number;
  if (kp >= 50 && rp >= 50) {
    hlX = midX; hlY = py; hlW = px - midX; hlH = midY - py;
  } else if (kp < 50 && rp >= 50) {
    hlX = PAD_L; hlY = py; hlW = px - PAD_L; hlH = midY - py;
  } else if (kp < 50 && rp < 50) {
    hlX = PAD_L; hlY = py; hlW = px - PAD_L; hlH = (PAD_T + plotH) - py;
  } else {
    hlX = midX; hlY = py; hlW = px - midX; hlH = (PAD_T + plotH) - py;
  }

  const hlBorder = hlColor.replace("0.25", "0.6");

  const qLabels = [
    { x: PAD_L + plotW * 0.75, y: PAD_T + plotH * 0.12, lines: ["Self-Regulated", "Learner"], color: "#16a34a" },
    { x: PAD_L + plotW * 0.25, y: PAD_T + plotH * 0.12, lines: ["Reflective", "Learner"], color: "#2563eb" },
    { x: PAD_L + plotW * 0.25, y: PAD_T + plotH * 0.85, lines: ["Passive", "Learner"], color: "#dc2626" },
    { x: PAD_L + plotW * 0.75, y: PAD_T + plotH * 0.85, lines: ["Strategic", "Learner"], color: "#ca8a04" },
  ];

  const gridPcts = [25, 50, 75];

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md" aria-label="Metacognition Quadrant Graph">
        <rect x={PAD_L} y={PAD_T} width={plotW} height={plotH} fill="#f9fafb" rx={4} />

        {gridPcts.map((pct) => (
          <g key={pct}>
            <line x1={toSvgX(pct)} y1={PAD_T} x2={toSvgX(pct)} y2={PAD_T + plotH} stroke="#e5e7eb" strokeWidth={pct === 50 ? 1.5 : 1} strokeDasharray={pct === 50 ? "0" : "4,3"} />
            <line x1={PAD_L} y1={toSvgY(pct)} x2={PAD_L + plotW} y2={toSvgY(pct)} stroke="#e5e7eb" strokeWidth={pct === 50 ? 1.5 : 1} strokeDasharray={pct === 50 ? "0" : "4,3"} />
          </g>
        ))}

        {hlW > 0 && hlH > 0 && (
          <>
            <rect x={hlX} y={hlY} width={hlW} height={hlH} fill={hlColor} rx={2} />
            <rect x={hlX} y={hlY} width={hlW} height={hlH} fill="none" stroke={hlBorder} strokeWidth={1.5} rx={2} />
          </>
        )}

        {qLabels.map((ql, i) => (
          <text key={i} x={ql.x} y={ql.y} fill={ql.color} fontSize={14} fontWeight={800} textAnchor="middle">
            <tspan x={ql.x} dy="0">{ql.lines[0]}</tspan>
            <tspan x={ql.x} dy="18">{ql.lines[1]}</tspan>
          </text>
        ))}

        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + plotH} stroke="#6b7280" strokeWidth={2} />
        <line x1={PAD_L} y1={PAD_T + plotH} x2={PAD_L + plotW} y2={PAD_T + plotH} stroke="#6b7280" strokeWidth={2} />

        {[0, 25, 50, 75, 100].map((pct) => (
          <g key={pct}>
            <text x={toSvgX(pct)} y={PAD_T + plotH + 18} fill="#6b7280" fontSize={11} textAnchor="middle">{pct}</text>
            <text x={PAD_L - 10} y={toSvgY(pct) + 4} fill="#6b7280" fontSize={11} textAnchor="end">{pct}</text>
          </g>
        ))}

        <text x={PAD_L + plotW / 2} y={H - 6} fill="#374151" fontSize={13} fontWeight={700} textAnchor="middle">Knowledge (Awareness) %</text>
        <text x={14} y={PAD_T + plotH / 2} fill="#374151" fontSize={13} fontWeight={700} textAnchor="middle" transform={`rotate(-90, 14, ${PAD_T + plotH / 2})`}>
          Regulation (Planning + Monitoring + Regulation + Reflection) %
        </text>

        <circle cx={px} cy={py} r={8} fill="white" stroke={accentColor} strokeWidth={3} />
        <circle cx={px} cy={py} r={4} fill={accentColor} />

        <rect x={px - 42} y={py - 36} width={84} height={24} fill={accentColor} rx={6} />
        <text x={px} y={py - 20} fill="white" fontSize={11} fontWeight={700} textAnchor="middle">
          ({Math.round(kp)}%, {Math.round(rp)}%)
        </text>
      </svg>

      <p className="mt-2 text-sm font-semibold text-gray-700">
        Quadrant:{" "}
        <span
          className={
            kp >= 50 && rp >= 50
              ? "text-green-700"
              : kp < 50 && rp >= 50
                ? "text-blue-700"
                : kp < 50 && rp < 50
                  ? "text-red-700"
                  : "text-yellow-700"
          }
        >
          {quadrantLabel}
        </span>
      </p>
    </div>
  );
}

export function QuadrantLegend() {
  const items = [
    { label: QUADRANT_LABELS.expertLearner, desc: "High Knowledge + High Regulation", color: "bg-green-100 border-green-300 text-green-800" },
    { label: QUADRANT_LABELS.reflectiveLearner, desc: "Low Knowledge + High Regulation", color: "bg-blue-100 border-blue-300 text-blue-800" },
    { label: QUADRANT_LABELS.strategicLearner, desc: "High Knowledge + Low Regulation", color: "bg-yellow-100 border-yellow-300 text-yellow-800" },
    { label: QUADRANT_LABELS.unawareLearner, desc: "Low Knowledge + Low Regulation", color: "bg-red-100 border-red-300 text-red-800" },
  ];

  return (
    <div className="space-y-3">
      {items.map((q) => (
        <div key={q.label} className={`rounded-xl border px-4 py-3 ${q.color}`}>
          <p className="font-semibold text-sm">{q.label}</p>
          <p className="text-xs opacity-80 mt-0.5">{q.desc}</p>
        </div>
      ))}
    </div>
  );
}
