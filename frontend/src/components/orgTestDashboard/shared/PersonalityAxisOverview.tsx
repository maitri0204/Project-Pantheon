"use client";

import type { CareerCompassPairAverage } from "@/lib/dashboard/assessmentAdminDashboard";

function splitStyleName(name: string): string[] {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [name];
  if (words.length === 2) return words;
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function StyleNameLines({
  name,
  className = "",
  align = "center",
}: {
  name: string;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  const lines = splitStyleName(name);
  const alignClass =
    align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";

  return (
    <div className={`${alignClass} ${className}`}>
      {lines.map((line) => (
        <span key={`${name}-${line}`} className="block leading-snug">
          {line}
        </span>
      ))}
    </div>
  );
}

const PAIR_COLORS: Record<string, { a: string; b: string }> = {
  "E/I": { a: "#6c5ce7", b: "#00b894" },
  "S/N": { a: "#e17055", b: "#0984e3" },
  "T/F": { a: "#fdcb6e", b: "#e84393" },
  "J/P": { a: "#00cec9", b: "#d63031" },
};

type PersonalityAxisOverviewProps = {
  pairs: CareerCompassPairAverage[];
};

export function PersonalityAxisOverview({ pairs }: PersonalityAxisOverviewProps) {
  if (!pairs.length) {
    return (
      <p className="text-sm text-black text-center py-8">
        Dimension data will appear once students complete Career Compass.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {pairs.map((pair) => {
        const colors = PAIR_COLORS[pair.pair] ?? { a: "#10b981", b: "#0ea5e9" };
        const aWins = pair.percentA >= pair.percentB;
        const winnerName = aWins ? pair.nameA : pair.nameB;
        const winnerPct = aWins ? pair.percentA : pair.percentB;
        const otherName = aWins ? pair.nameB : pair.nameA;
        const otherPct = aWins ? pair.percentB : pair.percentA;
        const winnerColor = aWins ? colors.a : colors.b;

        return (
          <div
            key={pair.pair}
            className="flex flex-col rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/80 p-4"
          >
            <p className="text-sm font-bold uppercase tracking-wide text-black text-center mb-3">
              {pair.styleLabel}
            </p>
            <div
              className="mx-auto flex h-28 w-28 items-center justify-center rounded-full text-center px-2"
              style={{
                backgroundColor: `${winnerColor}20`,
                border: `3px solid ${winnerColor}`,
                boxShadow: `0 8px 24px ${winnerColor}30`,
              }}
            >
              <div>
                <StyleNameLines
                  name={winnerName}
                  className="text-sm font-semibold text-black"
                />
                <p className="text-xl font-black mt-1" style={{ color: winnerColor }}>
                  {winnerPct}%
                </p>
              </div>
            </div>
            <div className="mt-3 text-center text-sm font-medium text-black leading-snug">
              <StyleNameLines name={otherName} />
              <p className="mt-1">{otherPct}%</p>
            </div>
            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div style={{ width: `${pair.percentA}%`, backgroundColor: colors.a }} />
              <div style={{ width: `${pair.percentB}%`, backgroundColor: colors.b }} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <StyleNameLines
                name={pair.nameA}
                align="left"
                className="text-sm font-semibold text-black"
              />
              <StyleNameLines
                name={pair.nameB}
                align="right"
                className="text-sm font-semibold text-black"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
