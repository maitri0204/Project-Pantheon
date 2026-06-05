import type { reportData as RD } from "./reportData";
import { careerIntelligenceModulePages } from "./careerIntelligencePages";
import { normalizeReportHtml } from "./reportHtmlNormalize";

type ReportData = typeof RD;

// ─── helpers ────────────────────────────────────────────────────────────────

function pctColor(pct: number): string {
  if (pct >= 75) return "#22C55E";
  if (pct >= 50) return "#5B4CF0";
  if (pct >= 30) return "#F59E0B";
  return "#EF4444";
}

function progressBar(pct: number, height = 6): string {
  const color = pctColor(pct);
  return `<div style="background:#E5E7EB;border-radius:999px;height:${height}px;width:100%;overflow:hidden;">
    <div style="background:${color};height:100%;width:${pct}%;border-radius:999px;"></div>
  </div>`;
}

function sectionHeader(num: string, title: string, subtitle: string): string {
  return `
  <div style="margin-bottom:24px;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
      <div style="background:#5B4CF0;color:#fff;font-size:11px;font-weight:700;border-radius:6px;
                  width:28px;height:28px;display:flex;align-items:center;justify-content:center;
                  flex-shrink:0;">${num}</div>
      <h2 style="font-size:22px;font-weight:800;color:#111827;margin:0;">${title}</h2>
    </div>
    <p style="font-size:10px;font-weight:600;letter-spacing:0.12em;color:#6B7280;
              margin:0 0 10px 40px;text-transform:uppercase;">${subtitle}</p>
    <div style="height:2px;background:linear-gradient(90deg,#5B4CF0 0%,#E5E7EB 60%);border-radius:2px;"></div>
  </div>`;
}

function card(content: string, extraStyle = ""): string {
  return `<div style="background:#FAFAFC;border:1px solid #E5E7EB;border-radius:12px;
                      padding:20px 22px;box-shadow:0 1px 4px rgba(0,0,0,0.04);${extraStyle}">${content}</div>`;
}

function summaryCard(
  label: string,
  value: string,
  sub: string,
  accentColor: string,
  stackedLabel?: { line1: string; line2: string }
): string {
  const labelHtml = stackedLabel
    ? `${stackedLabel.line1}<br/>${stackedLabel.line2}`
    : label;
  return `<div style="background:#FAFAFC;border:1px solid #E5E7EB;border-radius:12px;
                      padding:18px 20px;flex:1;min-width:0;
                      box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="height:3px;background:${accentColor};border-radius:2px;margin-bottom:12px;"></div>
    <p style="font-size:9px;font-weight:700;letter-spacing:0.1em;color:#6B7280;
              text-transform:uppercase;margin:0 0 6px 0;line-height:1.35;">${labelHtml}</p>
    <p style="font-size:22px;font-weight:800;color:#111827;margin:0 0 4px 0;">${value}</p>
    <p style="font-size:10px;color:#6B7280;margin:0;">${sub}</p>
  </div>`;
}

function stackedSectionTitle(line1: string, line2: string): string {
  return `<p style="font-size:11px;font-weight:800;color:#111827;margin:0;line-height:1.25;">${line1}<br/>${line2}</p>`;
}

function radarSvg(data: ReportData): string {
  const items = [
    { label: "Cognitive", pct: data.cognitive.percent },
    { label: "Aptitude", pct: data.aptitude.percent },
    { label: "Personality", pct: Math.round((data.personality.items.reduce((s, i) => s + i.score, 0) / data.personality.items.length)) },
    { label: "Career Int.", pct: Math.round((data.careerInterest.total / data.careerInterest.outOf) * 100) },
    { label: "Emotional IQ", pct: data.emotionalIntelligence.percent },
    { label: "Learning", pct: Math.round((data.learningStyle.total / data.learningStyle.outOf) * 100) },
    { label: "Behavioural", pct: data.behavioralSocial.percent },
    { label: "Resilience", pct: data.stressResilience.percent },
  ];

  const cx = 300;
  const cy = 300;
  const r = 128;
  const n = items.length;
  const sideGap = 78;
  const outerGap = 44;

  function polarPt(i: number, frac: number): [number, number] {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return [cx + r * frac * Math.cos(angle), cy + r * frac * Math.sin(angle)];
  }

  /** Fixed label slots so long side labels (Personality, Behavioural) never clip in PDF. */
  function radarLabelPos(i: number, text: string): { x: number; y: number; anchor: string; lines: string[] } {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rim = r + outerGap;
    const words = text.split(" ");

    if (i === 2) {
      return { x: cx + r + sideGap, y: cy, anchor: "start", lines: ["Personality"] };
    }
    if (i === 6) {
      return { x: cx - r - sideGap, y: cy, anchor: "end", lines: ["Behavioural"] };
    }
    if (Math.abs(cos) < 0.2) {
      return {
        x: cx,
        y: cy + (sin < 0 ? -(rim + 10) : rim + 10),
        anchor: "middle",
        lines: words.length > 1 ? words : [text],
      };
    }
    const x = cx + (rim + 16) * cos;
    const y = cy + (rim + 16) * sin;
    return {
      x,
      y,
      anchor: cos > 0 ? "start" : "end",
      lines: words.length > 1 ? words : [text],
    };
  }

  function renderLabel(i: number, text: string): string {
    const { x, y, anchor, lines } = radarLabelPos(i, text);
    const fs = 12;
    const fill = "#374151";
    const lineH = 15;
    if (lines.length === 1) {
      return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle"
        font-size="${fs}" font-weight="600" fill="${fill}" font-family="Arial, Helvetica, sans-serif">${lines[0]}</text>`;
    }
    const y0 = y - lineH / 2;
    return `<text x="${x}" y="${y0}" text-anchor="${anchor}" font-size="${fs}" font-weight="600"
      fill="${fill}" font-family="Arial, Helvetica, sans-serif">
      <tspan x="${x}" dy="0">${lines[0]}</tspan>
      <tspan x="${x}" dy="${lineH}">${lines.slice(1).join(" ")}</tspan>
    </text>`;
  }

  const gridLines = [0.2, 0.4, 0.6, 0.8, 1.0].map((frac) => {
    const pts = items.map((_, i) => polarPt(i, frac).join(",")).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="#E5E7EB" stroke-width="1"/>`;
  });

  const axes = items.map((_, i) => {
    const [x, y] = polarPt(i, 1.0);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#E5E7EB" stroke-width="1"/>`;
  });

  const dataPts = items.map((item, i) => polarPt(i, item.pct / 100).join(",")).join(" ");
  const labels = items.map((item, i) => renderLabel(i, item.label));
  const dots = items.map((item, i) => {
    const [dx, dy] = polarPt(i, item.pct / 100);
    return `<circle cx="${dx}" cy="${dy}" r="4" fill="#5B4CF0"/>`;
  });

  return `<svg viewBox="0 0 600 600" width="360" height="360" xmlns="http://www.w3.org/2000/svg">
    ${gridLines.join("")}
    ${axes.join("")}
    <polygon points="${dataPts}" fill="rgba(91,76,240,0.15)" stroke="#5B4CF0" stroke-width="2"/>
    ${labels.join("")}
    ${dots.join("")}
  </svg>`;
}

function donutSvg(pct: number, color: string, label: string): string {
  const r = 54, cx = 70, cy = 70, stroke = 10;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return `<svg viewBox="0 0 140 140" width="140" height="140" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E5E7EB" stroke-width="${stroke}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
      stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ / 4}"
      stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="18" font-weight="800"
      fill="#111827" font-family="sans-serif">${pct}%</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="9.5" fill="#6B7280"
      font-family="sans-serif">${label}</text>
  </svg>`;
}

// ─── pages ──────────────────────────────────────────────────────────────────

function coverPage(d: ReportData): string {
  return `
  <div class="page cover-page">
    <!-- decorative circles -->
    <div style="position:absolute;top:-80px;right:-80px;width:320px;height:320px;
                border-radius:50%;background:rgba(139,124,248,0.18);"></div>
    <div style="position:absolute;bottom:-60px;left:-60px;width:220px;height:220px;
                border-radius:50%;background:rgba(139,124,248,0.12);"></div>

    <!-- logo -->
    <div style="position:absolute;top:36px;left:40px;display:flex;align-items:center;gap:10px;">
      <div style="background:#5B4CF0;border-radius:8px;width:32px;height:32px;
                  display:flex;align-items:center;justify-content:center;">
        <span style="color:#fff;font-weight:800;font-size:14px;">K</span>
      </div>
      <div>
        <p style="color:#fff;font-weight:700;font-size:13px;margin:0;letter-spacing:0.03em;">KAREER Studio</p>
        <p style="color:rgba(255,255,255,0.6);font-size:9px;margin:0;letter-spacing:0.1em;">POWERED BY ADMITra</p>
      </div>
    </div>

    <!-- centre content -->
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
                text-align:center;padding:60px 40px 40px;">
      <p style="color:rgba(255,255,255,0.6);font-size:10px;font-weight:600;letter-spacing:0.18em;
                text-transform:uppercase;margin:0 0 18px;">Career DNA Profiler</p>
      <h1 style="color:#fff;font-size:40px;font-weight:800;margin:0 0 8px;letter-spacing:-0.01em;">
        ${d.candidate.name}</h1>
      <p style="color:rgba(255,255,255,0.55);font-size:12px;margin:0 0 48px;">Code: ${d.candidate.code}</p>

      <!-- score circle -->
      <div style="width:160px;height:160px;border-radius:50%;border:2px solid rgba(255,255,255,0.25);
                  display:flex;flex-direction:column;align-items:center;justify-content:center;
                  background:rgba(255,255,255,0.07);margin-bottom:20px;">
        <p style="color:#fff;font-size:42px;font-weight:800;margin:0;line-height:1;">${d.candidate.totalScore}</p>
        <p style="color:rgba(255,255,255,0.6);font-size:10px;letter-spacing:0.1em;
                  text-transform:uppercase;margin:4px 0 0;">Career DNA Score</p>
      </div>

      <p style="color:rgba(255,255,255,0.7);font-size:11.5px;max-width:340px;line-height:1.7;margin:0;">
        A comprehensive multi-dimensional assessment of cognitive ability, aptitude, personality,
        career interests, emotional intelligence, and behavioural competencies.
      </p>
    </div>

    <!-- footer -->
    <div style="position:absolute;bottom:36px;left:40px;">
      <p style="color:rgba(255,255,255,0.45);font-size:9px;text-transform:uppercase;
                letter-spacing:0.1em;margin:0 0 3px;">Assessment Date</p>
      <p style="color:rgba(255,255,255,0.85);font-size:11px;font-weight:600;margin:0;">
        ${d.candidate.assessmentDate}</p>
    </div>
    <div style="position:absolute;bottom:36px;right:40px;">
      <p style="color:rgba(255,255,255,0.45);font-size:9px;text-align:right;margin:0;">
        ADMITra / KAREER Studio- Confidential</p>
    </div>
  </div>`;
}

function executiveSummaryPage(d: ReportData): string {
  const overallPct = Math.round((d.candidate.totalScore / 760) * 100); // rough max

  const bulletList = (arr: string[]) =>
    arr.map(b => `<li style="margin-bottom:5px;">${b}</li>`).join("");

  return `
  <div class="page content-page">
    ${sectionHeader("01", "Executive Summary", "Intelligence Snapshot")}

    <!-- Top 4 summary cards -->
    <div style="display:flex;gap:12px;margin-bottom:16px;">
      ${summaryCard("Career DNA Score", `${d.candidate.totalScore}`, `${(d.candidate as { answeredLabel?: string }).answeredLabel || "360 / 360 answered"}`, "#5B4CF0")}
      ${summaryCard("Cognitive Ability", `${d.cognitive.total}/${d.cognitive.outOf}`, `${d.cognitive.percent}% score`, "#22C55E")}
      ${summaryCard("", `${d.aptitude.total}/${d.aptitude.outOf}`, `${d.aptitude.percent}% score`, "#8B7CF8", { line1: "Aptitude", line2: "Index" })}
      ${summaryCard("Stress Resilience", `${d.stressResilience.percent}%`, `${d.stressResilience.total}/${d.stressResilience.outOf}`, "#F59E0B")}
    </div>

    <!-- Key takeaways (full width, single column - avoids awkward column breaks) -->
    ${card(`
      <p style="font-size:9px;font-weight:700;letter-spacing:0.1em;color:#5B4CF0;
                text-transform:uppercase;margin:0 0 10px;">Key Takeaways</p>
      <ul style="margin:0;padding-left:16px;font-size:10.5px;color:#374151;line-height:1.75;">
        ${bulletList(d.keyTakeaways)}
      </ul>
    `, "margin-bottom:16px;")}

    <!-- Strengths + Development -->
    <div style="display:flex;gap:12px;margin-bottom:16px;">
      ${card(`
        <p style="font-size:9px;font-weight:700;letter-spacing:0.1em;color:#22C55E;
                  text-transform:uppercase;margin:0 0 10px;">Top Strengths</p>
        <ul style="margin:0;padding-left:16px;font-size:10.5px;color:#111827;line-height:1.7;">
          ${bulletList(d.topStrengths)}
        </ul>
      `, "flex:1;")}
      ${card(`
        <p style="font-size:9px;font-weight:700;letter-spacing:0.1em;color:#EF4444;
                  text-transform:uppercase;margin:0 0 10px;">Development Areas</p>
        <ul style="margin:0;padding-left:16px;font-size:10.5px;color:#111827;line-height:1.7;">
          ${bulletList(d.developmentAreas)}
        </ul>
      `, "flex:1;")}
    </div>

    <!-- Overall score bar -->
    <div style="margin-bottom:0;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <p style="font-size:11px;font-weight:700;color:#111827;margin:0;">Overall Career DNA Score</p>
        <p style="font-size:11px;font-weight:700;color:#5B4CF0;margin:0;">${overallPct}%</p>
      </div>
      ${progressBar(overallPct, 10)}
      <div style="display:flex;justify-content:space-between;margin-top:6px;">
        <span style="font-size:9px;color:#6B7280;">Emerging</span>
        <span style="font-size:9px;color:#6B7280;">Developing</span>
        <span style="font-size:9px;color:#6B7280;">Proficient</span>
        <span style="font-size:9px;color:#6B7280;">Advanced</span>
        <span style="font-size:9px;color:#6B7280;">Exceptional</span>
      </div>
    </div>

    ${pageFooter(d, "Page 2")}
  </div>`;
}

function cognitiveAptitudePage(d: ReportData): string {
  const row = (item: { label: string; pct: number; score: number; max: number }) => `
    <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:12px 16px;
                margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:10.5px;font-weight:600;color:#111827;">${item.label}</span>
        <span style="font-size:10.5px;font-weight:700;color:${pctColor(item.pct)};">${item.score}/${item.max} (${item.pct}%)</span>
      </div>
      ${progressBar(item.pct, 6)}
    </div>`;

  const donutRow = `
    <div style="display:flex;gap:16px;justify-content:center;align-items:center;margin-bottom:16px;
                background:#FAFAFC;border:1px solid #E5E7EB;border-radius:12px;padding:16px;">
      ${donutSvg(d.cognitive.percent, "#5B4CF0", "Cognitive")}
      ${donutSvg(d.aptitude.percent, "#22C55E", "Aptitude")}
      ${donutSvg(Math.round((d.cognitive.percent + d.aptitude.percent) / 2), "#8B7CF8", "Combined")}
    </div>`;

  return `
  <div class="page content-page">
    ${sectionHeader("02", "Cognitive Ability & Aptitude", "Multi-Domain Intelligence Profile")}

    ${donutRow}

    <div style="display:flex;gap:16px;margin-bottom:0;">
      <!-- Left: Cognitive -->
      <div style="flex:1;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <p style="font-size:11px;font-weight:800;color:#111827;margin:0;">Cognitive Ability</p>
          <span style="background:#EEF2FF;color:#5B4CF0;font-size:9px;font-weight:700;
                       padding:3px 10px;border-radius:999px;">${d.cognitive.total}/${d.cognitive.outOf}- ${d.cognitive.percent}%</span>
        </div>
        ${d.cognitive.items.map(row).join("")}

        ${card(`
          <p style="font-size:9px;font-weight:700;color:#5B4CF0;letter-spacing:0.1em;
                    text-transform:uppercase;margin:0 0 6px;">Insight</p>
          <ul style="margin:0;padding-left:14px;font-size:10px;color:#374151;line-height:1.75;">
            <li>Numerical and memory processing are standout strengths (90% each).</li>
            <li>Verbal and spatial reasoning are in the moderate range- targeted practice will close the gap.</li>
            <li>Overall cognitive profile places this candidate above the 70th percentile.</li>
          </ul>
          <p style="font-size:10px;color:#374151;line-height:1.6;margin:8px 0 0;">
            <strong>Suggested Action:</strong> Leverage quantitative strengths for data-heavy roles; build verbal and spatial
            skills through structured exercises over a 60-day period.
          </p>
        `, "margin-top:10px;")}
      </div>

      <!-- Right: Aptitude -->
      <div style="flex:1;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          ${stackedSectionTitle("Aptitude", "Index")}
          <span style="background:#EEF2FF;color:#5B4CF0;font-size:9px;font-weight:700;
                       padding:3px 10px;border-radius:999px;">${d.aptitude.total}/${d.aptitude.outOf}- ${d.aptitude.percent}%</span>
        </div>
        ${d.aptitude.items.map(row).join("")}

        ${card(`
          <p style="font-size:9px;font-weight:700;color:#5B4CF0;letter-spacing:0.1em;
                    text-transform:uppercase;margin:0 0 6px;">Insight</p>
          <ul style="margin:0;padding-left:14px;font-size:10px;color:#374151;line-height:1.75;">
            <li>Logical, numerical, and creativity aptitude all score 90%- exceptional analytical depth.</li>
            <li>Verbal and mechanical aptitude (60%) are development opportunities.</li>
            <li>Creativity & Innovation score positions candidate well for product and strategy roles.</li>
          </ul>
          <p style="font-size:10px;color:#374151;line-height:1.6;margin:8px 0 0;">
            <strong>Suggested Action:</strong> Pursue roles requiring quantitative problem-solving and
            innovative thinking; supplement with verbal communication skill-building.
          </p>
        `, "margin-top:10px;")}
      </div>
    </div>

    ${pageFooter(d, "Page 3")}
  </div>`;
}

function personalityPage(d: ReportData): string {
  const radar = radarSvg(d);

  const personalityCard = (item: (typeof d.personality.items)[0]) => `
    <div style="background:#FAFAFC;border:1px solid #E5E7EB;border-radius:12px;
                padding:16px 18px;flex:1;">
      <p style="font-size:9px;font-weight:700;letter-spacing:0.1em;color:#6B7280;
                text-transform:uppercase;margin:0 0 4px;">${item.label}</p>
      <p style="font-size:14px;font-weight:800;color:#111827;margin:0 0 4px;">${item.type}</p>
      <p style="font-size:11px;font-weight:700;color:#5B4CF0;margin:0 0 8px;">${item.score}%</p>
      ${progressBar(item.score, 5)}
    </div>`;

  return `
  <div class="page content-page">
    ${sectionHeader("03", "Personality Profile", "Psychometric Style Analysis")}

    <!-- 4 personality cards -->
    <div style="display:flex;gap:12px;margin-bottom:20px;">
      ${d.personality.items.map(personalityCard).join("")}
    </div>

    <!-- Radar chart centred -->
    <div style="display:flex;justify-content:center;margin-bottom:20px;">
      ${radar}
    </div>

    <!-- Personality summary box -->
    ${card(`
      <p style="font-size:9px;font-weight:700;letter-spacing:0.1em;color:#5B4CF0;
                text-transform:uppercase;margin:0 0 10px;">Personality Intelligence Summary</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <p style="font-size:10.5px;font-weight:700;color:#111827;margin:0 0 4px;">Social Style- Reflective Orientation (88%)</p>
          <ul style="margin:0;padding-left:14px;font-size:10px;color:#374151;line-height:1.7;">
            <li>Prefers thoughtful, considered interactions over impulsive responses.</li>
            <li>Builds trust through consistency and depth of knowledge.</li>
          </ul>
        </div>
        <div>
          <p style="font-size:10.5px;font-weight:700;color:#111827;margin:0 0 4px;">Thinking Style- Conceptual Thinking (84%)</p>
          <ul style="margin:0;padding-left:14px;font-size:10px;color:#374151;line-height:1.7;">
            <li>Strong capacity for abstract reasoning and big-picture strategy.</li>
            <li>Well-suited for research, design, and systems thinking roles.</li>
          </ul>
        </div>
        <div>
          <p style="font-size:10.5px;font-weight:700;color:#111827;margin:0 0 4px;">Decision Style- Value-Based (94%)</p>
          <ul style="margin:0;padding-left:14px;font-size:10px;color:#374151;line-height:1.7;">
            <li>Decisions are principle-driven, coherent, and defensible.</li>
            <li>High integrity under pressure- valuable in leadership contexts.</li>
          </ul>
        </div>
        <div>
          <p style="font-size:10.5px;font-weight:700;color:#111827;margin:0 0 4px;">Working Style- Flexible (94%)</p>
          <ul style="margin:0;padding-left:14px;font-size:10px;color:#374151;line-height:1.7;">
            <li>Adapts readily to shifting priorities and work formats.</li>
            <li>Thrives in dynamic, project-based or remote environments.</li>
          </ul>
        </div>
      </div>
    `)}

    ${pageFooter(d, "Page 4")}
  </div>`;
}

function careerInterestPage(d: ReportData): string {
  const row = (item: (typeof d.careerInterest.items)[0]) => `
    <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;
                padding:12px 16px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:10.5px;font-weight:600;color:#111827;">${item.label}</span>
        <span style="font-size:10.5px;font-weight:700;color:${pctColor(item.pct)};">${item.pct}%</span>
      </div>
      ${progressBar(item.pct, 6)}
    </div>`;

  return `
  <div class="page content-page">
    ${sectionHeader("04", "Career Interest Profile", "Holland RIASEC Framework Analysis")}

    <div style="display:flex;gap:16px;margin-bottom:16px;">
      <div style="flex:1.2;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <span style="background:#EEF2FF;color:#5B4CF0;font-size:10px;font-weight:700;
                       padding:4px 12px;border-radius:999px;letter-spacing:0.05em;">Dominant Code: ISE</span>
          <span style="font-size:10px;color:#6B7280;">${d.careerInterest.total}/${d.careerInterest.outOf} total</span>
        </div>
        ${d.careerInterest.items.map(row).join("")}
      </div>

      <div style="flex:1;">
        ${card(`
          <p style="font-size:9px;font-weight:700;letter-spacing:0.1em;color:#5B4CF0;
                    text-transform:uppercase;margin:0 0 8px;">What ISE Means</p>
          <ul style="margin:0;padding-left:14px;font-size:10px;color:#374151;line-height:1.8;">
            <li><strong>Investigative (100%):</strong> Driven by analysis, research, and intellectual curiosity.</li>
            <li><strong>Social (57%):</strong> Values collaboration, teaching, and human-centred work.</li>
            <li><strong>Enterprising (43%):</strong> Comfortable with leadership, persuasion, and initiative.</li>
          </ul>
          <p style="font-size:10px;color:#374151;line-height:1.6;margin:10px 0 0;">
            <strong>Suggested Action:</strong> Prioritise roles that blend analytical depth with human impact-
            research leadership, data strategy, and advisory consulting are natural fits.
          </p>
        `)}

        ${card(`
          <p style="font-size:9px;font-weight:700;letter-spacing:0.1em;color:#22C55E;
                    text-transform:uppercase;margin:0 0 8px;">Top Career Alignments</p>
          <ul style="margin:0;padding-left:14px;font-size:10px;color:#374151;line-height:1.8;">
            <li>Data Science &amp; Machine Learning</li>
            <li>Management Consulting</li>
            <li>Research &amp; Development</li>
            <li>Product Strategy &amp; Analytics</li>
          </ul>
        `, "margin-top:12px;")}
      </div>
    </div>

    ${pageFooter(d, "Page 5")}
  </div>`;
}

function emotionalLearningPage(d: ReportData): string {
  const row = (item: { label: string; pct: number; score: number; max: number }) => `
    <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:12px 16px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:10.5px;font-weight:600;color:#111827;">${item.label}</span>
        <span style="font-size:10.5px;font-weight:700;color:${pctColor(item.pct)};">${item.score}/${item.max} (${item.pct}%)</span>
      </div>
      ${progressBar(item.pct, 6)}
    </div>`;

  return `
  <div class="page content-page">
    ${sectionHeader("05", "Emotional Intelligence & Learning Style", "EQ Profile and Cognitive Learning Preferences")}

    <div style="display:flex;gap:16px;margin-bottom:16px;">
      <!-- EQ -->
      <div style="flex:1;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <p style="font-size:11px;font-weight:800;color:#111827;margin:0;">Emotional Intelligence</p>
          <span style="background:#FEF3C7;color:#D97706;font-size:9px;font-weight:700;
                       padding:3px 10px;border-radius:999px;">${d.emotionalIntelligence.total}/${d.emotionalIntelligence.outOf}- ${d.emotionalIntelligence.percent}%</span>
        </div>
        ${d.emotionalIntelligence.items.map(row).join("")}
        ${card(`
          <p style="font-size:9px;font-weight:700;color:#F59E0B;letter-spacing:0.1em;
                    text-transform:uppercase;margin:0 0 6px;">Key Insight</p>
          <ul style="margin:0;padding-left:14px;font-size:10px;color:#374151;line-height:1.75;">
            <li>Self-awareness (50%) is the strongest EQ dimension- a solid foundation.</li>
            <li>Empathy (25%) and social skills (30%) are critical development priorities.</li>
            <li>EQ development will directly amplify leadership effectiveness.</li>
          </ul>
          <p style="font-size:10px;color:#374151;line-height:1.6;margin:8px 0 0;">
            <strong>Suggested Action:</strong> Enroll in a structured EQ coaching program. Focus on
            empathy-building exercises and active listening practices over 90 days.
          </p>
        `, "margin-top:10px;")}
      </div>

      <!-- Learning Style -->
      <div style="flex:1;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <p style="font-size:11px;font-weight:800;color:#111827;margin:0;">Learning Style</p>
          <span style="background:#EEF2FF;color:#5B4CF0;font-size:9px;font-weight:700;
                       padding:3px 10px;border-radius:999px;">${d.learningStyle.total}/${d.learningStyle.outOf}</span>
        </div>
        ${d.learningStyle.items.map(row).join("")}
        ${card(`
          <p style="font-size:9px;font-weight:700;color:#5B4CF0;letter-spacing:0.1em;
                    text-transform:uppercase;margin:0 0 6px;">Key Insight</p>
          <ul style="margin:0;padding-left:14px;font-size:10px;color:#374151;line-height:1.75;">
            <li>Auditory (100%) and Social/Solitary (80%) learning are dominant channels.</li>
            <li>Thrives with podcast-style learning, lectures, and peer discussion.</li>
            <li>Kinesthetic learning (33%)- consider adding practical lab or project work.</li>
          </ul>
          <p style="font-size:10px;color:#374151;line-height:1.6;margin:8px 0 0;">
            <strong>Suggested Action:</strong> Structure learning through audio-led formats, study groups,
            and solo deep-work sessions for maximum retention.
          </p>
        `, "margin-top:10px;")}
      </div>
    </div>

    ${pageFooter(d, "Page 6")}
  </div>`;
}

function behaviouralResiliencePage(d: ReportData): string {
  const row = (item: { label: string; pct: number; score: number; max: number }) => `
    <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:12px 16px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:10.5px;font-weight:600;color:#111827;">${item.label}</span>
        <span style="font-size:10.5px;font-weight:700;color:${pctColor(item.pct)};">${item.score}/${item.max} (${item.pct}%)</span>
      </div>
      ${progressBar(item.pct, 6)}
    </div>`;

  const donutRow = `
    <div style="display:flex;gap:16px;justify-content:center;align-items:center;margin-bottom:16px;
                background:#FAFAFC;border:1px solid #E5E7EB;border-radius:12px;padding:16px;">
      ${donutSvg(d.behavioralSocial.percent, "#5B4CF0", "Behavioural")}
      ${donutSvg(d.stressResilience.percent, "#F59E0B", "Resilience")}
      ${donutSvg(d.emotionalIntelligence.percent, "#EF4444", "EQ")}
    </div>`;

  return `
  <div class="page content-page">
    ${sectionHeader("06", "Behavioural & Stress Resilience", "Workplace Competency and Coping Profile")}

    ${donutRow}

    <div style="display:flex;gap:16px;margin-bottom:0;">
      <!-- Behavioural -->
      <div style="flex:1;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <p style="font-size:11px;font-weight:800;color:#111827;margin:0;">Behavioural & Social</p>
          <span style="background:#DCFCE7;color:#16A34A;font-size:9px;font-weight:700;
                       padding:3px 10px;border-radius:999px;">${d.behavioralSocial.total}/${d.behavioralSocial.outOf}- ${d.behavioralSocial.percent}%</span>
        </div>
        ${d.behavioralSocial.items.map(row).join("")}
        ${card(`
          <p style="font-size:9px;font-weight:700;color:#22C55E;letter-spacing:0.1em;
                    text-transform:uppercase;margin:0 0 6px;">Insight</p>
          <ul style="margin:0;padding-left:14px;font-size:10px;color:#374151;line-height:1.75;">
            <li>Teamwork (70%) is the highest behavioural competency- strong collaborative instinct.</li>
            <li>Communication skills (68%) are solid; focused practice will push this above 80%.</li>
            <li>Leadership potential (63%) is present- needs confidence-building experiences.</li>
          </ul>
          <p style="font-size:10px;color:#374151;line-height:1.6;margin:8px 0 0;">
            <strong>Suggested Action:</strong> Seek team lead or project coordinator roles to activate
            leadership potential while leveraging collaborative strengths.
          </p>
        `, "margin-top:10px;")}
      </div>

      <!-- Resilience -->
      <div style="flex:1;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <p style="font-size:11px;font-weight:800;color:#111827;margin:0;">Stress Resilience</p>
          <span style="background:#FEF3C7;color:#D97706;font-size:9px;font-weight:700;
                       padding:3px 10px;border-radius:999px;">${d.stressResilience.total}/${d.stressResilience.outOf}- ${d.stressResilience.percent}%</span>
        </div>
        ${d.stressResilience.items.map(row).join("")}
        ${card(`
          <p style="font-size:9px;font-weight:700;color:#F59E0B;letter-spacing:0.1em;
                    text-transform:uppercase;margin:0 0 6px;">Insight</p>
          <ul style="margin:0;padding-left:14px;font-size:10px;color:#374151;line-height:1.75;">
            <li>Stress Triggers & Awareness (80%)- highly self-aware under pressure.</li>
            <li>All four resilience dimensions are in the 70-80% range- consistent performance.</li>
            <li>This profile indicates strong psychological readiness for demanding environments.</li>
          </ul>
          <p style="font-size:10px;color:#374151;line-height:1.6;margin:8px 0 0;">
            <strong>Suggested Action:</strong> Maintain resilience through regular mindfulness, reflection,
            and stress-debrief routines- especially during high-stakes career transitions.
          </p>
        `, "margin-top:10px;")}
      </div>
    </div>

    ${pageFooter(d, "Page 7")}
  </div>`;
}

function finalPage(d: ReportData, pageNum: number): string {
  return `
  <div class="page content-page">
    ${sectionHeader("12", "Final Recommendations", "Professional Summary & Next Steps")}

    <!-- dark recommendation box -->
    <div style="background:#1E1B4B;border-radius:16px;padding:28px 30px;margin-bottom:20px;
                position:relative;overflow:hidden;">
      <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;
                  border-radius:50%;background:rgba(139,124,248,0.2);"></div>
      <p style="font-size:9px;font-weight:700;letter-spacing:0.15em;color:rgba(255,255,255,0.55);
                text-transform:uppercase;margin:0 0 8px;">Final Recommendation</p>
      <h3 style="font-size:18px;font-weight:800;color:#fff;margin:0 0 12px;">
        Analytically Strong- EQ Development is the Career Catalyst</h3>
      <p style="font-size:10.5px;color:rgba(255,255,255,0.75);line-height:1.75;margin:0;
                max-width:480px;">
        This candidate demonstrates exceptional quantitative and analytical ability, paired with
        strong decision-making clarity and resilience. The primary development lever is Emotional
        Intelligence- targeted coaching over the next 90 days will unlock significant leadership
        and interpersonal performance gains. ISE career paths in data science, consulting, and
        product strategy offer the highest return on this profile.
      </p>
    </div>

    <!-- Recommended next steps (2 cols) -->
    <p style="font-size:11px;font-weight:800;color:#111827;margin:0 0 12px;">Recommended Next Steps</p>
    <div style="display:flex;gap:12px;margin-bottom:20px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:1;">
        ${[
          ["📋", "Book EQ Coaching", "Schedule a certified EQ coaching session within the next 14 days."],
          ["📚", "Build Portfolio", "Create one data analysis project to demonstrate analytical depth."],
          ["🎯", "Set 30-Day Milestones", "Track weekly progress across all 9 assessment dimensions."],
          ["🔄", "Reassess in 90 Days", "Measure improvement and update your career readiness profile."],
        ].map(([icon, title, desc]) => `
          <div style="background:#FAFAFC;border:1px solid #E5E7EB;border-radius:10px;padding:14px 16px;">
            <p style="font-size:14px;margin:0 0 4px;">${icon}</p>
            <p style="font-size:10.5px;font-weight:700;color:#111827;margin:0 0 3px;">${title}</p>
            <p style="font-size:10px;color:#6B7280;margin:0;line-height:1.6;">${desc}</p>
          </div>`).join("")}
      </div>
    </div>

    <!-- Score band reference -->
    <p style="font-size:11px;font-weight:800;color:#111827;margin:0 0 10px;">Score Band Reference</p>
    <div style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
      ${[
        ["90-100%", "Exceptional", "#22C55E", "Elite performance- top-tier career readiness"],
        ["75-89%", "Advanced", "#5B4CF0", "Strong profile- focused optimisation recommended"],
        ["55-74%", "Proficient", "#8B7CF8", "Solid foundation- structured development plan required"],
        ["35-54%", "Developing", "#F59E0B", "Growth gaps- guided coaching essential"],
        ["0-34%", "Emerging", "#EF4444", "Foundational work needed- systematic approach required"],
      ].map(([band, label, color, desc], i) => `
        <div style="display:flex;align-items:center;gap:12px;padding:8px 16px;
                    background:${i % 2 === 0 ? "#fff" : "#FAFAFC"};border-bottom:1px solid #E5E7EB;">
          <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></div>
          <span style="font-size:10px;font-weight:700;color:${color};width:60px;">${band}</span>
          <span style="font-size:10px;font-weight:700;color:#111827;width:90px;">${label}</span>
          <span style="font-size:10px;color:#6B7280;">${desc}</span>
        </div>`).join("")}
    </div>

    ${pageFooter(d, `Page ${pageNum}`)}
  </div>`;
}

function pageFooter(_d: ReportData, pageLabel: string): string {
  return `
  <div class="report-page-footer">
    <span>ADMITra / KAREER Studio - Confidential Report</span>
    <span>${pageLabel}</span>
  </div>`;
}

// ─── full document ──────────────────────────────────────────────────────────

export function buildReportHtml(data: ReportData): string {
  const careerModule = careerIntelligenceModulePages();
  const finalPageNum = 7 + careerModule.pageCount + 1;

  const rawHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Career DNA Executive Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
      background: #f3f3f3;
      color: #111827;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 794px;
      height: 1123px;
      max-height: 1123px;
      background: #fff;
      position: relative;
      margin: 0 auto 32px;
      page-break-after: always;
      overflow: hidden;
    }

    .cover-page {
      background: linear-gradient(155deg, #2D1B8E 0%, #3730A3 35%, #5B4CF0 70%, #7C3AED 100%);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .content-page {
      padding: 40px;
      padding-bottom: 56px;
    }

    .page-body {
      max-height: calc(1123px - 96px);
      overflow: hidden;
    }

    .report-page-footer {
      position: absolute;
      bottom: 24px;
      left: 40px;
      right: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #E5E7EB;
      padding-top: 10px;
      font-size: 12px;
      color: #000000;
    }

    .report-page-footer span {
      font-size: 12px;
      color: #000000;
    }

    @page {
      size: A4;
      margin: 0;
    }

    @media print {
      body { background: none; }
      .page { margin: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  ${coverPage(data)}
  ${executiveSummaryPage(data)}
  ${cognitiveAptitudePage(data)}
  ${personalityPage(data)}
  ${careerInterestPage(data)}
  ${emotionalLearningPage(data)}
  ${behaviouralResiliencePage(data)}
  ${careerModule.html}
  ${finalPage(data, finalPageNum)}
</body>
</html>`;

  return normalizeReportHtml(rawHtml);
}
