import type { ClearAssessmentData } from "./types";

export function buildJohariSvg(
  data: ClearAssessmentData,
  size: "hero" | "compact" | "std" = "std",
): string {
  const max = data.scores.maxScore;
  const chartSize = size === "hero" ? 220 : size === "compact" ? 160 : 200;
  const marginLeft = size === "hero" ? 48 : size === "compact" ? 36 : 42;
  const marginTop = size === "hero" ? 40 : size === "compact" ? 32 : 36;
  const marginRight = 14;
  const marginBottom = 10;

  const totalW = chartSize + marginLeft + marginRight;
  const totalH = chartSize + marginTop + marginBottom;

  const px = (data.scores.johariPosition.x / max) * chartSize;
  const py = (data.scores.johariPosition.y / max) * chartSize;
  const gridStep = chartSize / 10;

  const pointX = marginLeft + px;
  const pointY = marginTop + py;

  const fs = size === "hero" ? 10 : 8;
  const fsSm = size === "hero" ? 8 : 6;

  let grid = "";
  for (let i = 0; i <= 10; i++) {
    const pos = i * gridStep;
    grid += `<line x1="${marginLeft + pos}" y1="${marginTop}" x2="${marginLeft + pos}" y2="${marginTop + chartSize}" stroke="#D1D5DB" stroke-width="0.6"/>`;
    grid += `<line x1="${marginLeft}" y1="${marginTop + pos}" x2="${marginLeft + chartSize}" y2="${marginTop + pos}" stroke="#D1D5DB" stroke-width="0.6"/>`;
  }

  let xTicks = "";
  let yTicks = "";
  for (let i = 0; i <= 10; i++) {
    const val = i * 5;
    xTicks += `<text x="${marginLeft + (val / max) * chartSize}" y="${marginTop - 6}" text-anchor="middle" fill="#64748B" font-size="${fsSm}" font-weight="600">${val}</text>`;
    yTicks += `<text x="${marginLeft - 6}" y="${marginTop + (val / max) * chartSize + 3}" text-anchor="end" fill="#64748B" font-size="${fsSm}" font-weight="600">${val}</text>`;
  }

  return `<svg viewBox="0 0 ${totalW} ${totalH}" class="johari-svg report-chart-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="unknown-hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#B795C6" stroke-width="1.5" opacity="0.5"/>
      </pattern>
    </defs>
    <rect x="${marginLeft}" y="${marginTop}" width="${chartSize}" height="${chartSize}" fill="#FAFAFA" stroke="#1E293B" stroke-width="1.2"/>
    ${grid}
    <rect x="${marginLeft}" y="${marginTop}" width="${px}" height="${py}" fill="#D4EDDA"/>
    <rect x="${marginLeft + px}" y="${marginTop}" width="${chartSize - px}" height="${py}" fill="#FFE4CC"/>
    <rect x="${marginLeft}" y="${marginTop + py}" width="${px}" height="${chartSize - py}" fill="#D6EAF8"/>
    <rect x="${marginLeft + px}" y="${marginTop + py}" width="${chartSize - px}" height="${chartSize - py}" fill="#E8DAEF"/>
    <rect x="${marginLeft + px}" y="${marginTop + py}" width="${chartSize - px}" height="${chartSize - py}" fill="url(#unknown-hatch)"/>
    <text x="${marginLeft + px / 2}" y="${marginTop + py / 2 + 3}" text-anchor="middle" fill="#1B7A3D" font-size="${fs}" font-weight="800">OPEN</text>
    <text x="${marginLeft + px + (chartSize - px) / 2}" y="${marginTop + py / 2 + 3}" text-anchor="middle" fill="#C45C00" font-size="${fs}" font-weight="800">BLIND</text>
    <text x="${marginLeft + px / 2}" y="${marginTop + py + (chartSize - py) / 2 + 3}" text-anchor="middle" fill="#1A5FA8" font-size="${fs}" font-weight="800">HIDDEN</text>
    <text x="${marginLeft + px + (chartSize - px) / 2}" y="${marginTop + py + (chartSize - py) / 2 + 3}" text-anchor="middle" fill="#6C3483" font-size="${fs}" font-weight="800">UNKNOWN</text>
    <line x1="${pointX}" y1="${marginTop}" x2="${pointX}" y2="${marginTop + chartSize}" stroke="#1E293B" stroke-width="1.5" stroke-dasharray="5 4"/>
    <line x1="${marginLeft}" y1="${pointY}" x2="${marginLeft + chartSize}" y2="${pointY}" stroke="#1E293B" stroke-width="1.5" stroke-dasharray="5 4"/>
    <circle cx="${pointX}" cy="${pointY}" r="5" fill="#DC2626" stroke="#fff" stroke-width="1.5"/>
    <text x="${pointX + 8}" y="${pointY + 4}" fill="#DC2626" font-size="${fs}" font-weight="700">(${data.scores.johariPosition.x}, ${data.scores.johariPosition.y})</text>
    <text x="${marginLeft + chartSize / 2}" y="${marginTop - 20}" text-anchor="middle" fill="#1E293B" font-size="${fs}" font-weight="700">Solicits Feedback</text>
    ${xTicks}
    <text x="12" y="${marginTop + chartSize / 2}" text-anchor="middle" fill="#1E293B" font-size="${fs}" font-weight="700" transform="rotate(-90, 12, ${marginTop + chartSize / 2})">Willingness to Self-Disclose</text>
    ${yTicks}
  </svg>`;
}
