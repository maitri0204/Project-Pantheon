"use client";

import type { CareerCompassPairAverage } from "@/lib/dashboard/assessmentAdminDashboard";

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
            <p className="text-xs font-bold uppercase tracking-wide text-black text-center mb-3">
              {pair.styleLabel}
            </p>
            <div
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-center px-2"
              style={{
                backgroundColor: `${winnerColor}20`,
                border: `3px solid ${winnerColor}`,
                boxShadow: `0 8px 24px ${winnerColor}30`,
              }}
            >
              <div>
                <p className="text-[11px] font-semibold leading-tight text-black">{winnerName}</p>
                <p className="text-lg font-black mt-1" style={{ color: winnerColor }}>
                  {winnerPct}%
                </p>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-black leading-snug">
              <span className="font-medium">{otherName}</span> · {otherPct}%
            </p>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-100">
              <div style={{ width: `${pair.percentA}%`, backgroundColor: colors.a }} />
              <div style={{ width: `${pair.percentB}%`, backgroundColor: colors.b }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-black">
              <span className="truncate pr-1">{pair.nameA}</span>
              <span className="truncate pl-1 text-right">{pair.nameB}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
