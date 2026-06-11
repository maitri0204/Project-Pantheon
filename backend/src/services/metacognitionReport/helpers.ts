import { renderReportBullets } from "../reportBullets";
import { icons, CardVariant } from "./icons";
import { getQuadrantType, QuadrantType } from "./quadrantContent";

export function bullets(items: string[], variant?: "success" | "warning" | "danger" | "purple" | "checklist"): string {
  const bulletColor =
    variant === "success"
      ? "var(--success)"
      : variant === "warning"
        ? "var(--warning)"
        : variant === "danger"
          ? "var(--danger)"
          : variant === "purple"
            ? "var(--purple)"
            : "var(--blue)";
  return renderReportBullets(items, {
    color: "var(--slate-900)",
    bulletColor,
    compact: true,
    checklist: variant === "checklist",
    className: "report-bullets--metacog",
    fontSize: "9.5px",
    lineHeight: 1.55,
  });
}

export function progressBar(label: string, pct: number, variant?: "default" | "success" | "warning" | "danger"): string {
  const fillClass = variant && variant !== "default" ? `progress-bar-fill-${variant}` : "progress-bar-fill";
  return `
    <div class="progress-row">
      <div class="progress-header"><span>${label}</span><span>${pct}%</span></div>
      <div class="progress-bar-bg"><div class="${fillClass}" style="width:${pct}%"></div></div>
    </div>`;
}

export function statCard(value: string, label: string, variant?: "default" | "success" | "warning" | "danger" | "purple"): string {
  const cls = variant && variant !== "default" ? `stat-card stat-card-${variant}` : "stat-card";
  return `
    <div class="${cls}">
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
    </div>`;
}

const cardVariantClass: Record<CardVariant, string> = {
  default: "",
  primary: "card-primary",
  purple: "card-purple",
  success: "card-success",
  warning: "card-warning",
  danger: "card-danger",
  insight: "card-insight",
  executive: "card-executive",
};

const iconColorMap: Record<string, string> = {
  blue: "card-icon-blue",
  purple: "card-icon-purple",
  green: "card-icon-green",
  amber: "card-icon-amber",
  red: "card-icon-red",
  dark: "card-icon-dark",
};

export function card(title: string, content: string, variant: CardVariant = "default", icon?: keyof typeof icons, iconColor = "blue", compact = false): string {
  const v = cardVariantClass[variant];
  const compactCls = compact ? " card-compact" : "";
  const iconHtml = icon
    ? `<div class="card-header"><div class="card-icon ${iconColorMap[iconColor]}">${icons[icon]}</div><h3>${title}</h3></div>${content}`
    : `<h3>${title}</h3>${content}`;
  return `<div class="card ${v}${compactCls}">${iconHtml}</div>`;
}

export function iconCard(title: string, content: string, icon: keyof typeof icons, iconColor = "blue", variant: CardVariant = "default"): string {
  return card(title, content, variant, icon, iconColor);
}

export function pageShell(label: string, title: string, subtitle: string, content: string, pageNum: number, total = 19): string {
  return `
    <div class="page">
      <div class="page-top-bar"></div>
      <div class="page-header">
        <div>
          <div class="page-label">${label}</div>
          <h2>${title}</h2>
          <p class="page-subtitle">${subtitle}</p>
        </div>
      </div>
      <div class="page-content">${content}</div>
      ${pageFooter(pageNum, total)}
    </div>`;
}

export function pageFooter(pageNum: number, total = 19): string {
  return `
    <div class="page-footer">
      <span class="page-footer-brand">Thinking &amp; Expression Skills Test</span>
      <span class="page-num">${pageNum} / ${total}</span>
    </div>`;
}

export function sectionDivider(text: string): string {
  return `<div class="section-divider">${text}</div>`;
}

export function circularProgressSvg(pct: number, size = 130): string {
  const r = (size - 12) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E2E8F0" stroke-width="8"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#grad)" stroke-width="8"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#2563EB"/>
          <stop offset="100%" stop-color="#7C3AED"/>
        </linearGradient>
      </defs>
    </svg>`;
}

export function radarChartSvg(values: number[], labels: string[], size = 320): string {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 58;
  const n = values.length;
  const angleStep = (2 * Math.PI) / n;

  const pointAt = (index: number, radius: number) => {
    const angle = angleStep * index - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle), angle };
  };

  const grids = [0.25, 0.5, 0.75, 1]
    .map((level) => {
      const pts = Array.from({ length: n }, (_, i) => {
        const p = pointAt(i, maxR * level);
        return `${p.x},${p.y}`;
      }).join(" ");
      return `<polygon points="${pts}" fill="none" stroke="#E2E8F0" stroke-width="1"/>`;
    })
    .join("");

  const axes = Array.from({ length: n }, (_, i) => {
    const p = pointAt(i, maxR);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#E2E8F0" stroke-width="1"/>`;
  }).join("");

  const dataPts = values.map((v, i) => {
    const p = pointAt(i, maxR * (v / 100));
    return `${p.x},${p.y}`;
  }).join(" ");

  const dots = values.map((v, i) => {
    const p = pointAt(i, maxR * (v / 100));
    return `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#2563EB" stroke="#fff" stroke-width="2"/>`;
  }).join("");

  const labelEls = labels.map((label, i) => {
    const p = pointAt(i, maxR + 38);
    let anchor = "middle";
    if (p.x < cx - 8) anchor = "end";
    else if (p.x > cx + 8) anchor = "start";
    const dy = p.y < cy - 10 ? -2 : p.y > cy + 10 ? 6 : 3;
    return `<text x="${p.x}" y="${p.y + dy}" text-anchor="${anchor}" dominant-baseline="middle" font-size="8.5" font-weight="700" fill="#0F172A">${label}</text>`;
  }).join("");

  const valueLabels = values.map((v, i) => {
    const p = pointAt(i, maxR * (v / 100));
    return `<text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-size="8" font-weight="800" fill="#2563EB">${v}%</text>`;
  }).join("");

  const legend = labels.map((label, i) => {
    const colors = ["#EF4444", "#F59E0B", "#2563EB", "#7C3AED", "#10B981"];
    return `<span class="radar-legend-item"><span class="radar-legend-dot" style="background:${colors[i]}"></span>${label} (${values[i]}%)</span>`;
  }).join("");

  return `
    <svg class="report-chart-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="overflow:visible">
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(37,99,235,0.25)"/>
          <stop offset="100%" stop-color="rgba(124,58,237,0.15)"/>
        </linearGradient>
      </defs>
      ${grids}${axes}
      <polygon points="${dataPts}" fill="url(#radarFill)" stroke="#2563EB" stroke-width="2.5"/>
      ${dots}${valueLabels}${labelEls}
    </svg>
    <div class="radar-legend">${legend}</div>`;
}

export function domainScoreCards(names: string[], pcts: number[]): string {
  const colors = ["#EF4444", "#F59E0B", "#2563EB", "#7C3AED", "#10B981"];
  return `<div class="card-grid">${names.map((name, i) => `
    <div class="domain-card">
      <div class="domain-card-score" style="color:${colors[i]}">${pcts[i]}%</div>
      <div class="domain-card-name">${name}</div>
    </div>`).join("")}</div>`;
}

export function quadrantSvg(knowledge: number, regulation: number, quadrantType?: QuadrantType): string {
  const w = 240;
  const h = 220;
  const padL = 38;
  const padB = 28;
  const padT = 20;
  const padR = 12;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const midX = padL + plotW / 2;
  const midY = padT + plotH / 2;
  const halfW = plotW / 2;
  const halfH = plotH / 2;

  const activeType = quadrantType ?? getQuadrantType(knowledge, regulation);
  const dotX = padL + (knowledge / 100) * plotW;
  const dotY = padT + plotH - (regulation / 100) * plotH;

  const cells: Record<QuadrantType, { x: number; y: number; fill: string }> = {
    "Reflective Learner": { x: padL, y: padT, fill: "url(#activeQuadrantGrad)" },
    "Self-Regulated Learner": { x: midX, y: padT, fill: "rgba(16,185,129,0.1)" },
    "Passive Learner": { x: padL, y: midY, fill: "rgba(100,116,139,0.08)" },
    "Strategic Learner": { x: midX, y: midY, fill: "rgba(245,158,11,0.1)" },
  };

  const quadrantRects = (Object.keys(cells) as QuadrantType[])
    .map((type) => {
      const cell = cells[type];
      const isActive = type === activeType;
      const stroke = isActive ? ' stroke="#2563EB" stroke-width="2"' : ' stroke="none"';
      return `<rect x="${cell.x}" y="${cell.y}" width="${halfW}" height="${halfH}" fill="${cell.fill}"${stroke}/>`;
    })
    .join("");

  const labelFill = (type: QuadrantType) => (type === activeType ? "#2563EB" : "#94A3B8");
  const labelWeight = (type: QuadrantType) => (type === activeType ? "700" : "600");

  return `
    <div class="quadrant-chart-wrap">
    <svg class="report-chart-svg" width="360" height="330" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="activeQuadrantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(37,99,235,0.15)"/>
          <stop offset="100%" stop-color="rgba(124,58,237,0.08)"/>
        </linearGradient>
      </defs>
      <rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" fill="#FAFBFC" rx="5" stroke="#E2E8F0" stroke-width="1"/>
      ${quadrantRects}
      <line x1="${midX}" y1="${padT}" x2="${midX}" y2="${padT + plotH}" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4,3"/>
      <line x1="${padL}" y1="${midY}" x2="${padL + plotW}" y2="${midY}" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="${padL + plotW/4}" y="${padT + 12}" font-size="7" font-weight="${labelWeight("Reflective Learner")}" fill="${labelFill("Reflective Learner")}" text-anchor="middle">Reflective</text>
      <text x="${padL + plotW*0.75}" y="${padT + 12}" font-size="7" font-weight="${labelWeight("Self-Regulated Learner")}" fill="${labelFill("Self-Regulated Learner")}" text-anchor="middle">Self-Regulated</text>
      <text x="${padL + plotW/4}" y="${padT + plotH - 4}" font-size="7" font-weight="${labelWeight("Passive Learner")}" fill="${labelFill("Passive Learner")}" text-anchor="middle">Passive</text>
      <text x="${padL + plotW*0.75}" y="${padT + plotH - 4}" font-size="7" font-weight="${labelWeight("Strategic Learner")}" fill="${labelFill("Strategic Learner")}" text-anchor="middle">Strategic</text>
      <text x="${padL}" y="${padT + plotH + 12}" font-size="6" fill="#94A3B8">0</text>
      <text x="${midX}" y="${padT + plotH + 12}" font-size="6" fill="#94A3B8" text-anchor="middle">50</text>
      <text x="${padL + plotW}" y="${padT + plotH + 12}" font-size="6" fill="#94A3B8" text-anchor="end">100</text>
      <text x="${padL + plotW/2}" y="${h - 2}" font-size="7" font-weight="600" fill="#475569" text-anchor="middle">Knowledge %</text>
      <text x="${padL - 4}" y="${padT + plotH}" font-size="6" fill="#94A3B8" text-anchor="end">0</text>
      <text x="${padL - 4}" y="${midY}" font-size="6" fill="#94A3B8" text-anchor="end">50</text>
      <text x="${padL - 4}" y="${padT + 6}" font-size="6" fill="#94A3B8" text-anchor="end">100</text>
      <text x="10" y="${padT + plotH/2}" font-size="7" font-weight="600" fill="#475569" text-anchor="middle" transform="rotate(-90,10,${padT + plotH/2})">Regulation %</text>
      <line x1="${padL}" y1="${dotY}" x2="${dotX}" y2="${dotY}" stroke="#2563EB" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.75"/>
      <line x1="${dotX}" y1="${dotY}" x2="${dotX}" y2="${midY}" stroke="#2563EB" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.75"/>
      <circle cx="${dotX}" cy="${dotY}" r="6" fill="#2563EB" stroke="#fff" stroke-width="2"/>
      <circle cx="${dotX}" cy="${dotY}" r="10" fill="none" stroke="#2563EB" stroke-width="1.5" opacity="0.3"/>
    </svg>
    <div class="quadrant-position-label">
      <span class="qpl-title">Your Position</span>
      <span class="qpl-values">Knowledge ${knowledge}% &nbsp;·&nbsp; Regulation ${regulation}%</span>
    </div>
    </div>`;
}

export function weekPlanBlock(week: string, goal: string, tasks: string[], practice: string[], guidance: string[]): string {
  return `
    <div class="week-plan-block">
      <div class="week-plan-header">
        <span class="week-badge">${week}</span>
        <h3>${goal}</h3>
      </div>
      <div class="two-col">
        <div>
          <h4>Tasks &amp; Actions</h4>
          ${bullets(tasks)}
        </div>
        <div>
          <h4>Practice Activities</h4>
          ${bullets(practice)}
        </div>
      </div>
      <div class="week-guidance">
        <h4>Guidance &amp; Mentorship</h4>
        ${bullets(guidance, "purple")}
      </div>
    </div>`;
}

export function phaseHeader(phase: string, days: string, goal: string): string {
  return `
    <div class="phase-header">
      <span class="phase-badge">${phase}</span>
      <div>
        <h3>${days}</h3>
        <p>${goal}</p>
      </div>
    </div>`;
}

export function strengthCard(rank: number, title: string, content: string): string {
  const medals = ["medal-gold", "medal-silver", "medal-bronze"];
  return `
    <div class="strength-card">
      <div class="medal ${medals[rank - 1] || "medal-bronze"}">${rank}</div>
      <div class="strength-body">
        <h3>${title}</h3>
        ${content}
      </div>
    </div>`;
}

export function challengeCard(title: string, content: string, severity: number): string {
  return `
    <div class="challenge-card">
      <div class="severity-bar"><div class="severity-fill" style="width:${severity}%"></div></div>
      <h3>${title}</h3>
      ${content}
    </div>`;
}

export function growthTrajectorySvg(current: number, target: number): string {
  const w = 400;
  const h = 80;
  const pad = 20;
  const points = [
    { x: pad, y: h - pad - (current / 100) * (h - 2 * pad) },
    { x: pad + (w - 2 * pad) * 0.33, y: h - pad - ((current + 10) / 100) * (h - 2 * pad) },
    { x: pad + (w - 2 * pad) * 0.66, y: h - pad - ((current + 20) / 100) * (h - 2 * pad) },
    { x: w - pad, y: h - pad - (target / 100) * (h - 2 * pad) },
  ];
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${w - pad},${h - pad} L${pad},${h - pad} Z`;
  return `
    <svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(37,99,235,0.2)"/>
          <stop offset="100%" stop-color="rgba(37,99,235,0)"/>
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#tGrad)"/>
      <path d="${pathD}" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>
      ${points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#2563EB" stroke="#fff" stroke-width="2"/>`).join("")}
      <text x="${pad}" y="${h - 4}" font-size="7" fill="#64748B">Now</text>
      <text x="${w - pad - 20}" y="${h - 4}" font-size="7" fill="#64748B">90 Days</text>
    </svg>`;
}

export function timelineRoadmap(steps: { label: string; text: string }[]): string {
  return `
    <div class="timeline">
      ${steps.map((s, i) => `
        <div class="timeline-step">
          <div class="timeline-dot">${i + 1}</div>
          <div class="timeline-label">${s.label}</div>
        </div>`).join("")}
    </div>
    ${steps.map((s) => `<div class="timeline-item"><h3>${s.label}</h3><p>${s.text}</p></div>`).join("")}`;
}

export function insightPanel(title: string, content: string, icon: keyof typeof icons, color = "blue"): string {
  return `
    <div class="insight-mini">
      <div class="insight-mini-header">
        <div class="card-icon ${iconColorMap[color]}" style="width:22px;height:22px;border-radius:6px;">${icons[icon]}</div>
        <h3>${title}</h3>
      </div>
      ${content}
    </div>`;
}

export function highlightBox(title: string, content: string, dark = false): string {
  const cls = dark ? "highlight-box-dark" : "highlight-box";
  return `<div class="${cls}"><h3>${title}</h3>${content}</div>`;
}

export function riskOpportunityPanels(riskTitle: string, riskContent: string, oppTitle: string, oppContent: string, recTitle: string, recContent: string): string {
  return `
    <div class="three-col">
      <div class="panel-risk"><h3>${riskTitle}</h3>${riskContent}</div>
      <div class="panel-opportunity"><h3>${oppTitle}</h3>${oppContent}</div>
      <div class="panel-recommend"><h3>${recTitle}</h3>${recContent}</div>
    </div>`;
}
