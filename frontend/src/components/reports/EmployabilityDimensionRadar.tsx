"use client";

import {
  EMPLOYABILITY_QUOTIENT_DIMENSIONS,
  shortDimensionLabel,
  type EmployabilityDimension,
} from "@/lib/employabilityQuotient/assessmentData";

const RADAR_LABEL_FONT_SIZE = 12;
const RADAR_LABEL_FILL = "#000000";

export function EmployabilityDimensionRadar({
  scores,
  className = "mx-auto w-full max-w-[380px]",
}: {
  scores: Record<EmployabilityDimension, number>;
  className?: string;
}) {
  const topics = EMPLOYABILITY_QUOTIENT_DIMENSIONS;
  const n = topics.length;
  const size = 300;
  const pad = 56;
  const vb = size + pad * 2;
  const cx = vb / 2;
  const cy = vb / 2;
  const R = 100;
  const labelRadius = R + 38;
  const rings = [20, 40, 60, 80, 100];

  const toXY = (pct: number, i: number) => {
    const angle = (i * (2 * Math.PI)) / n - Math.PI / 2;
    const r = (pct / 100) * R;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const labelXY = (radius: number, i: number) => {
    const angle = (i * (2 * Math.PI)) / n - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const ringPoly = (pct: number) =>
    topics.map((_, i) => `${toXY(pct, i).x},${toXY(pct, i).y}`).join(" ");

  const scorePoly = topics
    .map((topic, i) => {
      const pct = Math.round(((scores[topic] ?? 0) / 5) * 100);
      const pos = toXY(pct, i);
      return `${pos.x},${pos.y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} className={className} role="img" aria-label="Employability dimension radar">
      {rings.map((p) => (
        <polygon
          key={p}
          points={ringPoly(p)}
          fill={p === 100 ? "rgba(248,250,252,0.6)" : "none"}
          stroke={p % 40 === 0 ? "#cbd5e1" : "#e2e8f0"}
          strokeWidth="1"
        />
      ))}
      {topics.map((_, i) => {
        const end = toXY(100, i);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polygon points={scorePoly} fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />
      {topics.map((topic, i) => {
        const pos = labelXY(labelRadius, i);
        return (
          <text
            key={topic}
            x={pos.x}
            y={pos.y}
            fontSize={RADAR_LABEL_FONT_SIZE}
            fill={RADAR_LABEL_FILL}
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {shortDimensionLabel(topic)}
          </text>
        );
      })}
    </svg>
  );
}
