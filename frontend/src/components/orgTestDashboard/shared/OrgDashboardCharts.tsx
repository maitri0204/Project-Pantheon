"use client";

type DonutProps = {
  percentage: number;
  label?: string;
  size?: number;
  stroke?: string;
  track?: string;
  centerLabel?: string;
};

export function DonutChart({
  percentage,
  label,
  size = 160,
  stroke = "#2563eb",
  track = "#e2e8f0",
  centerLabel,
}: DonutProps) {
  const R = 52;
  const circ = 2 * Math.PI * R;
  const pct = Math.min(Math.max(percentage, 0) / 100, 1);
  const dash = pct * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" stroke={track} strokeWidth="12" />
          <circle
            cx="64"
            cy="64"
            r={R}
            fill="none"
            stroke={stroke}
            strokeWidth="12"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-black leading-none">{Math.round(percentage)}%</p>
          {(centerLabel || label) && (
            <p className="text-xs text-black font-medium mt-1 text-center px-2">{centerLabel || label}</p>
          )}
        </div>
      </div>
    </div>
  );
}

type BarItem = { label: string; value: number; max?: number; color?: string; suffix?: string };

export function HorizontalBarChart({
  items,
  title,
  barClass = "bg-blue-500",
}: {
  items: BarItem[];
  title?: string;
  barClass?: string;
}) {
  return (
    <div>
      {title && <h3 className="text-base font-semibold text-black mb-4">{title}</h3>}
      <div className="space-y-3">
        {items.map((item) => {
          const max = item.max ?? 100;
          const width = max > 0 ? Math.min(100, (item.value / max) * 100) : 0;
          return (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-black truncate pr-2">{item.label}</span>
                <span className="text-black shrink-0">
                  {item.value}
                  {item.suffix ?? (max !== 100 ? `/${max}` : "")}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color || barClass}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VerticalBarChart({
  items,
  title,
  barClass = "bg-violet-500",
  maxHeight = 140,
}: {
  items: BarItem[];
  title?: string;
  barClass?: string;
  maxHeight?: number;
}) {
  const useAbsoluteScale = items.every((i) => i.max != null);
  const maxVal = useAbsoluteScale
    ? Math.max(...items.map((i) => i.max ?? 100), 1)
    : Math.max(...items.map((i) => i.value), 1);
  return (
    <div>
      {title && <h3 className="text-base font-semibold text-black mb-4">{title}</h3>}
      <div className="flex items-end justify-around gap-2" style={{ height: maxHeight + 40 }}>
        {items.map((item) => {
          const scaleMax = useAbsoluteScale ? (item.max ?? 100) : maxVal;
          const h = Math.max(8, (item.value / scaleMax) * maxHeight);
          return (
            <div key={item.label} className="flex flex-col items-center flex-1 min-w-0">
              <span className="text-xs font-bold text-black mb-1">
                {item.value}
                {item.suffix ?? ""}
              </span>
              <div
                className={`w-full max-w-[48px] rounded-t-lg ${item.color || barClass}`}
                style={{ height: h }}
              />
              <span className="text-[10px] text-black mt-2 text-center leading-tight truncate w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PIE_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#059669",
  "#0891b2", "#4f46e5", "#ca8a04", "#dc2626", "#64748b",
];

export function PieChartVisual({
  slices,
  title,
  size = 200,
}: {
  slices: { label: string; value: number }[];
  title?: string;
  size?: number;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let angle = -90;
  const cx = 100;
  const cy = 100;
  const r = 80;

  const paths = slices.map((slice, i) => {
    const sliceAngle = (slice.value / total) * 360;
    const start = (angle * Math.PI) / 180;
    angle += sliceAngle;
    const end = (angle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = sliceAngle > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { d, color: PIE_COLORS[i % PIE_COLORS.length], ...slice };
  });

  return (
    <div>
      {title && <h3 className="text-base font-semibold text-black mb-4">{title}</h3>}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <svg viewBox="0 0 200 200" style={{ width: size, height: size }} className="shrink-0">
          {paths.map((p) => (
            <path key={p.label} d={p.d} fill={p.color} stroke="#fff" strokeWidth="1.5" />
          ))}
        </svg>
        <div className="flex-1 space-y-2 w-full">
          {paths.map((p) => (
            <div key={p.label} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-black flex-1 truncate">{p.label}</span>
              <span className="text-black">{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RadarChart({
  items,
  title,
  stroke = "#2563eb",
  fill = "rgba(37, 99, 235, 0.2)",
  size = 260,
}: {
  items: { label: string; value: number; max?: number }[];
  title?: string;
  stroke?: string;
  fill?: string;
  size?: number;
}) {
  const cx = 120;
  const cy = 120;
  const maxR = 90;
  const n = items.length;
  if (n < 3) return null;

  const pointAt = (index: number, value: number, max: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / max) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = items.map((item, i) => pointAt(i, item.value, item.max ?? 100));
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div>
      {title && <h3 className="text-base font-semibold text-black mb-4">{title}</h3>}
      <svg viewBox="0 0 240 240" style={{ width: size, height: size }} className="mx-auto">
        {gridLevels.map((level) => {
          const pts = items.map((item, i) => {
            const max = item.max ?? 100;
            const p = pointAt(i, max * level, max);
            return `${p.x},${p.y}`;
          });
          return (
            <polygon
              key={level}
              points={pts.join(" ")}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}
        {items.map((item, i) => {
          const outer = pointAt(i, item.max ?? 100, item.max ?? 100);
          const label = pointAt(i, (item.max ?? 100) * 1.18, item.max ?? 100);
          return (
            <g key={item.label}>
              <line x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e2e8f0" strokeWidth="1" />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-black text-[9px]"
              >
                {item.label.length > 12 ? `${item.label.slice(0, 10)}…` : item.label}
              </text>
            </g>
          );
        })}
        <polygon points={polygon} fill={fill} stroke={stroke} strokeWidth="2" />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={stroke} />
        ))}
      </svg>
    </div>
  );
}

export function JohariQuadrantGrid({
  open,
  blind,
  hidden,
  unknown,
}: {
  open: number;
  blind: number;
  hidden: number;
  unknown: number;
}) {
  const quads = [
    { label: "Open Area", value: open, bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800" },
    { label: "Blind Spot", value: blind, bg: "bg-amber-50 border-amber-200", text: "text-amber-800" },
    { label: "Hidden Area", value: hidden, bg: "bg-sky-50 border-sky-200", text: "text-sky-800" },
    { label: "Unknown", value: unknown, bg: "bg-violet-50 border-violet-200", text: "text-violet-800" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {quads.map((q) => (
        <div
          key={q.label}
          className={`rounded-2xl border p-5 flex flex-col justify-between min-h-[120px] ${q.bg}`}
        >
          <p className={`text-sm font-semibold ${q.text}`}>{q.label}</p>
          <p className={`text-3xl font-bold ${q.text}`}>{q.value.toFixed(1)}%</p>
          <p className="text-xs text-black">Org average</p>
        </div>
      ))}
    </div>
  );
}

export function TypeFrequencyGrid({
  items,
  title,
}: {
  items: { label: string; count: number }[];
  title?: string;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div>
      {title && <h3 className="text-base font-semibold text-black mb-4">{title}</h3>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {items.slice(0, 16).map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-100 p-3 bg-gray-50"
            style={{ opacity: 0.5 + (item.count / max) * 0.5 }}
          >
            <p className="text-sm font-bold text-black leading-snug line-clamp-3">{item.label}</p>
            <p className="text-xs text-black mt-1">{item.count} student{item.count !== 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionScoreCards({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 to-white p-5">
          <p className="text-sm font-medium text-black">{item.label}</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-3xl font-bold text-fuchsia-700">{item.value}%</p>
            <p className="text-xs text-black mb-1">avg completion</p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-fuchsia-100 overflow-hidden">
            <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: `${Math.min(100, item.value)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
