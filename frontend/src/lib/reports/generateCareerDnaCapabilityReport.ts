/**
 * Career DNA – Cognitive + Aptitude Capability Engine (v4)
 *
 * FIXES APPLIED:
 *  - Root cause fix: pdf.setTextColor() used for text (NOT setFillColor)
 *  - Radar chart: correct relative segment calculation for polygon
 *  - Page 3: score value moved left to prevent right-edge cutoff
 *  - Pages 4+5 merged into single page 4 (no wasted space)
 *  - Guidance checkmark (unicode) replaced with ASCII to fix spaced-font bug
 *  - Page 1: attractive 2-column section score cards with shadow + colored headers
 */

import * as XLSX from "xlsx";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CapabilityReportInput = {
  studentName: string;
  submittedAt?: string;
  classGrade?: string;
  schoolName?: string;
  organizationBranding?: {
    organizationName?: string;
    logoUrl?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    representativeName?: string;
  };
  traitScores: TraitScores;
  otherSectionScores?: Record<string, any>;
};

const TRAIT_KEYS = ["VR", "NR", "SR", "MP", "LR", "NA", "VA", "MA", "CI"] as const;
type TraitKey = (typeof TRAIT_KEYS)[number];
type TraitScores = Record<TraitKey, number>;

type CareerDbRow = { career: string; cluster: string; description: string; proposedStream: string; required: TraitScores };
type CareerResult = {
  rank: number; career: string; cluster: string; description: string; proposedStream: string;
  capabilityScore: number; band: BandEntry;
  gaps: Record<TraitKey, number>; flag: string;
};
type BandEntry = {
  label: string;
  color: [number, number, number];
  lightColor: [number, number, number];
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CAREER_DB_PATH = "/career_dna_db.xlsx";

const TRAIT_LABELS: Record<TraitKey, string> = {
  VR: "Verbal Reasoning",     NR: "Numerical Reasoning",  SR: "Spatial Reasoning",
  MP: "Memory & Processing",  LR: "Logical & Analytical", NA: "Numerical Aptitude",
  VA: "Verbal Aptitude",      MA: "Mechanical Aptitude",  CI: "Creativity & Innovation",
};

const WEIGHTS: Record<TraitKey, number> = {
  VR: 0.10, NR: 0.15, SR: 0.15, MP: 0.10, LR: 0.20, NA: 0.15, VA: 0.05, MA: 0.05, CI: 0.05,
};

const BANDS: BandEntry[] = [
  { label: "Strong Capability Alignment",  color: [16, 185, 129], lightColor: [209, 250, 229] },
  { label: "High Capability Potential",    color: [59, 130, 246], lightColor: [219, 234, 254] },
  { label: "Moderate Capability Match",    color: [245, 158,  11], lightColor: [254, 243, 199] },
  { label: "Conditional Capability Match", color: [249, 115,  22], lightColor: [255, 237, 213] },
  { label: "Low Capability Alignment",     color: [239,  68,  68], lightColor: [254, 226, 226] },
];

const SECTION_META: Array<{
  key: string; label: string;
  color: [number, number, number]; defaultMax: number;
}> = [
  { key: "COGNITIVE",              label: "Cognitive Ability",       color: [59,  130, 246], defaultMax: 40  },
  { key: "APTITUDE",               label: "Aptitude Profile",        color: [8,  145, 178], defaultMax: 50  },
  { key: "PERSONALITY",            label: "Personality Type",        color: [139, 92, 246], defaultMax: 100 },
  { key: "CAREER_INTEREST",        label: "Career Interest",         color: [236, 72, 153], defaultMax: 100 },
  { key: "EMOTIONAL_INTELLIGENCE", label: "Emotional Intelligence",  color: [34,  197,  94], defaultMax: 100 },
  { key: "LEARNING_STYLE",         label: "Learning Style",          color: [245, 158,  11], defaultMax: 100 },
  { key: "BEHAVIORAL_SOCIAL",      label: "Behavioral & Social",     color: [249, 115,  22], defaultMax: 100 },
  { key: "STRESS_RESILIENCE",      label: "Stress & Resilience",     color: [239,  68,  68], defaultMax: 160 },
];

const DISCLAIMER =
  "This capability report is for educational and career guidance only. It evaluates career alignment using " +
  "cognitive ability and aptitude scores. It does not measure career interest, personality, emotional readiness, " +
  "family context, academic history, market demand, salary potential, or future job certainty. Final career and " +
  "stream decisions must involve student discussion, parent input, academic records, and counselor review.";

const MBTI_NAMES: Record<string, string> = {
  ISTJ: "The Systematic Organizer",
  ISFJ: "The Protective Supporter",
  INFJ: "The Purpose Driven Guide",
  INTJ: "The Master Strategist",
  ISTP: "The Practical Problem Solver",
  ISFP: "The Artist",
  INFP: "The Value Creator",
  INTP: "The Curious",
  ESTP: "The Action Taker",
  ESFP: "The Joyful Performer",
  ENFP: "The Visionary",
  ENTP: "The Entrepreneur",
  ESTJ: "The Strategic Leader",
  ESFJ: "The Community Builder",
  ENFJ: "The Mentor Leader",
  ENTJ: "The Visionary Director",
};

const MBTI_DESCRIPTIONS: Record<string, string> = {
  ISTJ: "You value structure, responsibility, and reliability. You approach tasks methodically and follow through with dedication.",
  ISFJ: "You are warm, considerate, and deeply committed to supporting those around you.",
  INFJ: "You are insightful, principled, and driven by a strong sense of purpose and compassion.",
  INTJ: "You are strategic, determined, and innovative — always planning several steps ahead.",
  ISTP: "You are hands-on, analytical, and thrive when solving real-world problems.",
  ISFP: "You are gentle, sensitive, and express yourself through creativity and aesthetics.",
  INFP: "You are idealistic, empathetic, and driven by deeply held personal values.",
  INTP: "You are logical, original, and endlessly curious about how things work.",
  ESTP: "You are energetic, pragmatic, and thrive in fast-paced, hands-on situations.",
  ESFP: "You are spontaneous, energetic, and bring joy and enthusiasm to everything you do.",
  ENFP: "You are enthusiastic, creative, and always exploring new possibilities.",
  ENTP: "You are inventive, strategic, and love tackling complex challenges with fresh ideas.",
  ESTJ: "You are organized, logical, and naturally take charge to get things done efficiently.",
  ESFJ: "You are caring, sociable, and dedicated to building strong communities around you.",
  ENFJ: "You are charismatic, empathetic, and naturally inspire and guide others.",
  ENTJ: "You are bold, strategic, and driven to lead with a compelling long-term vision.",
};
 
const MBTI_DIMENSION_META: Record<string, { label: string; nameA: string; nameB: string; cr: number; cg: number; cb: number }> = {
  "E/I": { label: "SOCIAL STYLE",    nameA: "Social Orientation",    nameB: "Reflective Orientation", cr: 122, cg: 140, cb: 110 },
  "S/N": { label: "THINKING STYLE",  nameA: "Practical Observation", nameB: "Conceptual Thinking",    cr: 139, cg: 184, cb: 208 },
  "T/F": { label: "DECISION STYLE",  nameA: "Logical Decision",      nameB: "Value-Based Decision",   cr: 123, cg: 107, cb: 138 },
  "J/P": { label: "WORKING STYLE",   nameA: "Structured Working",    nameB: "Flexible Working",        cr: 192, cg: 124, cb: 90  },
};

// Friendly 2-letter circle labels matching Career DNA app
const FRIENDLY_LETTER: Record<string, string> = {
  E: "SO", I: "RO", S: "PO", N: "CT", T: "LD", F: "VD", J: "SW", P: "FW",
};

const RIASEC_NAMES: Record<string, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

function formatCareerInterestCode(code: string): string {
  const normalized = String(code || "").toUpperCase().replace(/[^RIASEC]/g, "");
  const topTwo = normalized.slice(0, 2).split("").map((char) => RIASEC_NAMES[char]).filter(Boolean);
  return topTwo.length ? topTwo.join(" + ") : "Interest Profile";
}

const LEARNING_STYLE_NAMES: Record<string, string> = {
  V: "Visual",
  A: "Auditory",
  K: "Kinesthetic",
};

function getLearningStyleCodeFromName(name: string): "V" | "A" | "K" | "" {
  const n = String(name || "").trim().toLowerCase();
  if (!n) return "";
  if (n.includes("visual") || n === "v") return "V";
  if (n.includes("auditory") || n.includes("audio") || n === "a") return "A";
  if (n.includes("kinesthetic") || n.includes("kinaesthetic") || n === "k") return "K";
  return "";
}

function getLearningStyleRankedNames(data: any): string[] {
  const styleScores = new Map<string, number>();
  const parts = Array.isArray(data?.parts) ? data.parts : [];

  parts.forEach((part: any) => {
    const code = getLearningStyleCodeFromName(String(part?.partName || ""));
    if (!code) return;
    const pct = Number(part?.percentage ?? 0);
    const prev = styleScores.get(code);
    if (prev === undefined || pct > prev) styleScores.set(code, pct);
  });

  const rankedFromParts = Array.from(styleScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([code]) => LEARNING_STYLE_NAMES[code])
    .filter(Boolean);

  if (rankedFromParts.length >= 2) return rankedFromParts.slice(0, 2);

  const normalized = String(data?.dominantCode || data?.learningStyleCode || "").toUpperCase().replace(/[^VAK]/g, "");
  const fallback = normalized
    .split("")
    .filter((c: string, i: number, arr: string[]) => arr.indexOf(c) === i)
    .map((char) => LEARNING_STYLE_NAMES[char])
    .filter(Boolean);

  const merged = [...rankedFromParts, ...fallback].filter((name: string, i: number, arr: string[]) => arr.indexOf(name) === i);
  return merged.slice(0, 2);
}

function formatLearningStylePrimarySecondary(data: any): string {
  const ranked = getLearningStyleRankedNames(data);
  if (ranked.length >= 2) return `Primary: ${ranked[0]} | Secondary: ${ranked[1]}`;
  if (ranked.length === 1) return `Primary: ${ranked[0]} | Secondary: —`;
  return "Primary: Learning Style | Secondary: —";
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getBand(score: number): BandEntry {
  if (score >= 85) return BANDS[0];
  if (score >= 75) return BANDS[1];
  if (score >= 65) return BANDS[2];
  if (score >= 50) return BANDS[3];
  return BANDS[4];
}

function computeCapabilityScore(student: TraitScores, required: TraitScores): number {
  let total = 0;
  for (const key of TRAIT_KEYS) {
    const req = required[key];
    total += (req > 0 ? Math.min(100, (student[key] / req) * 100) : 100) * WEIGHTS[key];
  }
  return Math.round(total);
}

function computeGaps(student: TraitScores, required: TraitScores): Record<TraitKey, number> {
  const gaps = {} as Record<TraitKey, number>;
  for (const key of TRAIT_KEYS) gaps[key] = Math.round(student[key] - required[key]);
  return gaps;
}

function getFlag(score: number, gaps: Record<TraitKey, number>): string {
  const v = Object.values(gaps);
  if (v.every((g) => g >= 0)) return "Requirements Met";
  if (v.some((g) => g < -20)) return "Major Gap Present";
  if (v.filter((g) => g >= -20 && g < -10).length >= 2) return "Multiple Dev Gaps";
  if (score < 65) return "Conditional Alignment";
  return "Minor Dev Needed";
}

function getGapColor(gap: number): [number, number, number] {
  if (gap >= 10)  return [16, 185, 129];     // Green - Surplus(+10+)
  if (gap >= 0)   return [59, 130, 246];    // Blue - Meets Req(0+)
  if (gap >= -10) return [245, 158,  11];   // Amber - Minor(0 to -10)
  if (gap >= -20) return [168, 85, 247];    // Purple - Moderate(-20)
  return [239, 68, 68];                      // Red - Major(<-20)
}

function getGapLabel(gap: number): string {
  if (gap >= 10)  return "Strong Surplus";
  if (gap >= 0)   return "Meets Req";
  if (gap >= -10) return "Minor";
  if (gap >= -20) return "Moderate";
  return "Major";
}

function perfLabel(pct: number): string {
  if (pct >= 80) return "Excellent";
  if (pct >= 65) return "Proficient";
  if (pct >= 50) return "Developing";
  return "Needs Focus";
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA LOADING
// ─────────────────────────────────────────────────────────────────────────────

async function loadCareerDb(): Promise<CareerDbRow[]> {
  const res = await fetch(CAREER_DB_PATH);
  if (!res.ok) throw new Error(`Cannot load Career DB: ${CAREER_DB_PATH}`);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: 0 })
    .map((r) => {
      const descKey = Object.keys(r).find((k) => {
        const nk = k.trim().toLowerCase().replace(/\s+/g, "");
        return nk === "description" || nk === "desc" || nk === "careerdescription" || nk === "jobdescription";
      });
      const descVal = descKey ? r[descKey] : (r["Career Description"] || r.Description || r.description || r.Desc || r.desc || "");
      const normalizedDesc = String(descVal ?? "").trim();
      return {
        career: String(r.Career || r.career || "").trim(),
        cluster: String(r.Cluster || r.cluster || "").trim(),
        description: normalizedDesc && normalizedDesc !== "0" ? normalizedDesc : "",
          proposedStream: String(r["Proposed Stream"] || r["proposed stream"] || r.proposedStream || r.proposed_stream || "").trim(),
          required: {
          VR: Number(r.VR) || 0, NR: Number(r.NR) || 0, SR: Number(r.SR) || 0,
          MP: Number(r.MP) || 0, LR: Number(r.LR) || 0, NA: Number(r.NA) || 0,
          VA: Number(r.VA) || 0, MA: Number(r.MA) || 0, CI: Number(r.CI) || 0,
        },
      };
    })
    .filter((r) => r.career);
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF COLOR HELPERS
// NOTE: ALWAYS use setTxt() for text color, setFill() for shapes, setDraw() for borders.
//       Never use setFillColor() to control text — jsPDF uses separate setTextColor().
// ─────────────────────────────────────────────────────────────────────────────

function setFill(pdf: any, r: number, g: number, b: number) { pdf.setFillColor(r, g, b); }
function setDraw(pdf: any, r: number, g: number, b: number) { pdf.setDrawColor(r, g, b); }
function setTxt(pdf: any, r: number, g: number, b: number)  { pdf.setTextColor(r, g, b); }

// ─────────────────────────────────────────────────────────────────────────────
// PAGE CHROME
// ─────────────────────────────────────────────────────────────────────────────

function addPageHeader(pdf: any, title: string, PW: number) {
  setFill(pdf, 30, 58, 138);
  pdf.rect(0, 0, PW, 16, "F");
  setTxt(pdf, 255, 255, 255); // WHITE text on dark blue
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(title, PW / 2, 10.5, { align: "center" });
  setTxt(pdf, 15, 23, 42); // reset to near-black
}

function addPageFooter(pdf: any, pageNum: number, total: number, PW: number) {
  setFill(pdf, 226, 232, 240);
  pdf.rect(0, 285, PW, 12, "F");
  setTxt(pdf, 100, 116, 139);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(`Page ${pageNum} of ${total}`, PW / 2, 292, { align: "center" });
  pdf.text("Career DNA – Capability Profile Report", 8, 292);
  setTxt(pdf, 15, 23, 42);
}

function secHeader(pdf: any, title: string, y: number, ML: number, CW: number): number {
  setFill(pdf, 30, 58, 138);
  pdf.roundedRect(ML, y, CW, 8, 1.5, 1.5, "F");
  setTxt(pdf, 255, 255, 255); // WHITE text on dark blue
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.text(title.toUpperCase(), ML + CW / 2, y + 5.8, { align: "center" });
  setTxt(pdf, 15, 23, 42); // reset
  return y + 11;
}

// ─────────────────────────────────────────────────────────────────────────────
// RADAR CHART (fixed polygon drawing)
// ─────────────────────────────────────────────────────────────────────────────

function drawRadarChart(
  pdf: any,
  cx: number,
  cy: number,
  radius: number,
  scores: number[],
  labels: string[],
  options?: { labelRadius?: number; labelWidth?: number; labelFontSize?: number }
) {
  const n = labels.length;
  const startAngle = -Math.PI / 2;
  const angleStep = (2 * Math.PI) / n;

  const pt = (i: number, r: number): [number, number] => [
    cx + r * Math.cos(startAngle + i * angleStep),
    cy + r * Math.sin(startAngle + i * angleStep),
  ];

  // Grid rings (25 / 50 / 75 / 100)
  [100, 75, 50, 25].forEach((pct, gi) => {
    const r = radius * (pct / 100);
    const ringColor: [number, number, number] = gi === 0 ? [193, 202, 230] : [210, 220, 240];
    setDraw(pdf, ...ringColor);
    pdf.setLineWidth(0.3);
    for (let i = 0; i < n; i++) {
      const [x1, y1] = pt(i, r);
      const [x2, y2] = pt((i + 1) % n, r);
      pdf.line(x1, y1, x2, y2);
    }
    // pct label next to first axis
    const [lx, ly] = pt(0, r);
    setTxt(pdf, 148, 163, 184);
    pdf.setFontSize(6);
    pdf.text(`${pct}`, lx + 1, ly);
    setTxt(pdf, 15, 23, 42);
  });

  // Axes
  for (let i = 0; i < n; i++) {
    const [x, y] = pt(i, radius);
    setDraw(pdf, 193, 202, 230);
    pdf.setLineWidth(0.3);
    pdf.line(cx, cy, x, y);
  }

  // Score polygon – FIXED: correct relative segments from scorePoints[i] to scorePoints[i+1]
  const scorePoints: [number, number][] = labels.map((_, i) =>
    pt(i, radius * (Math.min(100, Math.max(0, scores[i])) / 100))
  );

  setFill(pdf, 219, 234, 254);
  setDraw(pdf, 37, 99, 235);
  pdf.setLineWidth(1.2);

  // Build relative-move segments: each entry is [dx, dy] from previous point
  const segs: [number, number][] = [];
  for (let i = 1; i < n; i++) {
    segs.push([scorePoints[i][0] - scorePoints[i - 1][0], scorePoints[i][1] - scorePoints[i - 1][1]]);
  }
  // Start at scorePoints[0], close=true adds final segment back to start
  pdf.lines(segs, scorePoints[0][0], scorePoints[0][1], [1, 1], "FD", true);

  // Dots
  scorePoints.forEach(([x, y]) => {
    setFill(pdf, 37, 99, 235);
    pdf.circle(x, y, 1.5, "F");
    setFill(pdf, 255, 255, 255);
    pdf.circle(x, y, 0.6, "F");
  });

  // Labels and score values
  const labelR = options?.labelRadius ?? (radius + 16);
  const labelWidth = options?.labelWidth ?? 28;
  const labelFontSize = options?.labelFontSize ?? 5.5;
  labels.forEach((label, i) => {
    const [lx, ly] = pt(i, labelR);
    setTxt(pdf, 30, 41, 59);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(labelFontSize);
    const labelLines = pdf.splitTextToSize(label, labelWidth) as string[];
    labelLines.forEach((ll: string, lli: number) => {
      pdf.text(ll, lx, ly + lli * 3.8, { align: "center" });
    });

    const [sx, sy] = scorePoints[i];
    const angle = startAngle + i * angleStep;
    setTxt(pdf, 29, 78, 216);
    pdf.setFontSize(7.5);
    // Place score value inward (toward center) to avoid overlapping outer labels / grid markers
    pdf.text(`${scores[i]}`, sx - Math.cos(angle) * 4.5, sy - Math.sin(angle) * 4.5, { align: "center" });
  });
  setTxt(pdf, 15, 23, 42);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION SCORE CARD (Page 1 – attractive 2-column layout)
// ─────────────────────────────────────────────────────────────────────────────

function drawSectionCard(
  pdf: any,
  x: number, y: number, w: number, h: number,
  label: string,
  score: number, maxScore: number,
  color: [number, number, number],
  options?: { hideScore?: boolean; traitNames?: string[]; personalityCode?: string; customTitle?: string; customValue?: string; badgeText?: string }
) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const [cr, cg, cb] = color;
  const hideScore = Boolean(options?.hideScore);

  // Shadow (offset gray rect)
  setFill(pdf, 200, 210, 225);
  pdf.roundedRect(x + 0.8, y + 0.8, w, h, 2, 2, "F");

  // Card background
  setFill(pdf, 255, 255, 255);
  setDraw(pdf, 220, 228, 240);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(x, y, w, h, 2, 2, "FD");

  // Colored top header band
  setFill(pdf, cr, cg, cb);
  pdf.roundedRect(x, y, w, 7.5, 2, 2, "F");
  pdf.rect(x, y + 4, w, 3.5, "F"); // square off bottom of top band

  // Section label in header (white text)
  setTxt(pdf, 255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text(label, x + 3, y + 5.5);

  // Large pct value (right side of header)
  if (!hideScore) {
    pdf.setFontSize(10);
    pdf.text(`${pct}%`, x + w - 3, y + 5.5, { align: "right" });
  }

  // Score fraction below header – unified formatting
  if (!hideScore) {
    setTxt(pdf, 30, 41, 59);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    const scoreStr = `${score} / ${maxScore}`;
    pdf.text(scoreStr, x + 3, y + 14);
  } else {
    const pCode = (options?.personalityCode || "").trim().toUpperCase();
    const fullTypeName = options?.customValue || MBTI_NAMES[pCode] || (pCode ? `Type: ${pCode}` : "Personality Profile");
    if (options?.customTitle) {
      setTxt(pdf, 71, 85, 105);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      pdf.text(options.customTitle, x + 3, y + 11.5);
    }
    setTxt(pdf, cr, cg, cb);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    const explicitLines = String(fullTypeName)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const typeWrapped = explicitLines.length > 1
      ? explicitLines
      : (pdf.splitTextToSize(fullTypeName, w - 8) as string[]);
    const linesToRender = typeWrapped.slice(0, 2);
    const bodyTop = y + 7.5;
    const bodyBottom = y + h;
    const bodyCenter = (bodyTop + bodyBottom) / 2;
    const lineGap = 4;
    const blockH = Math.max(0, (linesToRender.length - 1) * lineGap);
    const firstBaselineY = bodyCenter - blockH / 2 + 1.2;
    linesToRender.forEach((tl: string, tli: number) => {
      pdf.text(tl, x + 3, firstBaselineY + tli * lineGap);
    });
  }

  // Progress bar (only for scored sections, not personality)
  if (!hideScore) {
    const barX = x + 3;
    const barY = y + 16.5;
    const barW = w - 6;
    const barH = 3;
    setFill(pdf, 226, 232, 240);
    setDraw(pdf, 0, 0, 0);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(barX, barY, barW, barH, 0.8, 0.8, "FD");
    setFill(pdf, cr, cg, cb);
    pdf.roundedRect(barX, barY, Math.max(0.3, barW * (pct / 100)), barH, 0.8, 0.8, "F");
  }

  // Performance label
  const perf = hideScore ? (options?.badgeText || "Traits") : perfLabel(pct);
  const perfColors: Record<string, [number, number, number]> = {
    Excellent: [16, 185, 129], Proficient: [59, 130, 246], Developing: [245, 158, 11], "Needs Focus": [239, 68, 68], Traits: [100, 116, 139],
  };
  const [pr, pg, pb] = perfColors[perf] || [100, 116, 139];
  setFill(pdf, pr, pg, pb);
  pdf.roundedRect(x + w - 20, y + 15.5, 18, 4.5, 1, 1, "F");
  setTxt(pdf, 255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.text(perf, x + w - 11, y + 18.5, { align: "center" });

  setTxt(pdf, 15, 23, 42);
}

function drawTraitRow(
  pdf: any,
  x: number,
  y: number,
  w: number,
  label: string,
  score: number,
  weightPct: number,
  color: [number, number, number]
) {
  const [cr, cg, cb] = color;
  const rowH = 9.5;
  setFill(pdf, 255, 255, 255);
  setDraw(pdf, 220, 228, 240);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(x, y, w, rowH, 1.2, 1.2, "FD");

  setFill(pdf, cr, cg, cb);
  pdf.roundedRect(x, y, 2, rowH, 0.8, 0.8, "F");
  pdf.rect(x + 1, y, 1, rowH, "F");

  setTxt(pdf, 15, 23, 42);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  // Vertically center label in row (no weight text below)
  pdf.text(label, x + 4, y + rowH / 2 + 1.5);

  const barX = x + 52;
  const barY = y + rowH / 2 - 1.5;
  const barW = w - 75;
  const barH = 2.8;
  setFill(pdf, 226, 232, 240);
  setDraw(pdf, 0, 0, 0);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(barX, barY, barW, barH, 0.8, 0.8, "FD");
  setFill(pdf, cr, cg, cb);
  pdf.roundedRect(barX, barY, Math.max(0.2, barW * (Math.max(0, Math.min(100, score)) / 100)), barH, 0.8, 0.8, "F");

  setTxt(pdf, 0, 0, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(`${Math.round(score)} / 100`, x + w - 3, y + 6.2, { align: "right" });

  setTxt(pdf, 15, 23, 42);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export async function generateCareerDnaCapabilityReport(
  args: CapabilityReportInput,
  options?: { returnBlob?: boolean }
): Promise<void | Blob> {
  const { traitScores, studentName, classGrade, schoolName, submittedAt, organizationBranding, otherSectionScores } = args;

  const allPresent = TRAIT_KEYS.every((k) => typeof traitScores[k] === "number" && !isNaN(traitScores[k]));
  if (!allPresent) throw new Error("Incomplete – all 9 trait scores required.");

  const careerDb = await loadCareerDb();

  const ranked: CareerResult[] = careerDb
    .map((row) => {
      const score = computeCapabilityScore(traitScores, row.required);
      const gaps = computeGaps(traitScores, row.required);
        return { career: row.career, cluster: row.cluster, description: row.description || "", proposedStream: row.proposedStream || "", capabilityScore: score, band: getBand(score), gaps, flag: getFlag(score, gaps) };
    })
    .sort((a, b) => b.capabilityScore - a.capabilityScore || a.career.localeCompare(b.career))
    .map((c, i) => ({ ...c, rank: i + 1 }));

  const top10 = ranked.slice(0, 10);

  const clusterMap = new Map<string, number[]>();
  ranked.forEach((c) => {
    if (!clusterMap.has(c.cluster)) clusterMap.set(c.cluster, []);
    clusterMap.get(c.cluster)!.push(c.capabilityScore);
  });
  const clusterData = Array.from(clusterMap.entries())
    .map(([cluster, scores]) => ({ cluster, avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length), count: scores.length }))
    .sort((a, b) => b.avgScore - a.avgScore);

  // ─── jsPDF setup ─────────────────────────────────────────────────────────────
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const PW = 210, ML = 8, CW = PW - ML * 2;
  let pageNum = 0;

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1: Hero Cover + Student Profile + KPI Strip + Score Cards + Top Careers
  // ════════════════════════════════════════════════════════════════════════════
  pageNum++;
  setFill(pdf, 248, 250, 252);
  pdf.rect(0, 0, PW, 297, "F");

  // ─ HERO BANNER (0–56mm) ──────────────────────────────────────────────────
  setFill(pdf, 147, 197, 253);
  pdf.rect(0, 0, PW, 56, "F");

  // Diagonal accent band on right side
  setFill(pdf, 96, 165, 250);
  pdf.lines([[90, 0], [0, 56], [-115, 0]], 120, 0, [1, 1], "F");

  // Subtle dot grid in accent zone
  setFill(pdf, 219, 234, 254);
  for (let di = 0; di < 7; di++) {
    for (let dj = 0; dj < 5; dj++) {
      const ddx = 124 + di * 10;
      const ddy = 2 + dj * 10;
      if (ddx < PW - 6 && ddy < 50) pdf.circle(ddx, ddy, 0.8, "F");
    }
  }

  // DNA Double Helix (x ≈ 171–189)
  const helixCX = 180, helixYa = 4, helixYb = 52, helixN = 14, helixAmp = 9;
  for (let hi = 0; hi <= helixN; hi++) {
    const t = hi / helixN;
    const hy = helixYa + t * (helixYb - helixYa);
    const hang = t * Math.PI * 3;
    const hx1 = helixCX + helixAmp * Math.cos(hang);
    const hx2 = helixCX - helixAmp * Math.cos(hang);
    if (hi > 0) {
      const pt2 = (hi - 1) / helixN;
      const phy = helixYa + pt2 * (helixYb - helixYa);
      const phang = pt2 * Math.PI * 3;
      const phx1 = helixCX + helixAmp * Math.cos(phang);
      const phx2 = helixCX - helixAmp * Math.cos(phang);
      setDraw(pdf, 96, 165, 250); pdf.setLineWidth(0.6); pdf.line(phx1, phy, hx1, hy);
      setDraw(pdf, 74, 222, 128); pdf.line(phx2, phy, hx2, hy);
      setDraw(pdf, 100, 130, 190); pdf.setLineWidth(0.22); pdf.line(phx1, phy, phx2, phy);
    }
    setFill(pdf, 147, 197, 253); pdf.circle(hx1, hy, 1.7, "F");
    setFill(pdf, 134, 239, 172); pdf.circle(hx2, hy, 1.7, "F");
  }

  // Capability Index donut ring (center-right of hero)
  // const ringCX = 146, ringCY = 28, ringR = 14;
  // const [capR, capG, capB]: [number, number, number] =
  //   capabilityIndex >= 75 ? [16, 185, 129] :
  //   capabilityIndex >= 50 ? [245, 158, 11] : [239, 68, 68];
  // setFill(pdf, 191, 219, 254); pdf.circle(ringCX, ringCY, ringR + 2, "F");
  // setFill(pdf, capR, capG, capB); pdf.circle(ringCX, ringCY, ringR, "F");
  // setFill(pdf, 96, 165, 250); pdf.circle(ringCX, ringCY, ringR - 4.5, "F");
  // setTxt(pdf, 255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.5);
  // pdf.text("DNA", ringCX, ringCY + 1.2, { align: "center" });

  // Hero title text (left)
  setTxt(pdf, 15, 23, 42); pdf.setFont("helvetica", "bold"); pdf.setFontSize(26);
  pdf.text("CAREER DNA", ML + 3, 20);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(12);
  pdf.text("Capability Profile Report", ML + 3, 30);
  pdf.setFontSize(8.5); setTxt(pdf, 30, 58, 138);
  pdf.text("Cognitive Ability & Aptitude-Based Career Analysis", ML + 3, 38);
  setDraw(pdf, 59, 130, 246); pdf.setLineWidth(0.7); pdf.line(ML + 3, 41.8, 104, 41.8);
  setFill(pdf, 16, 185, 129); pdf.circle(ML + 108, 41.8, 0.9, "F");

  // // Org strip (49–56mm)
  // setFill(pdf, 96, 165, 250); pdf.rect(0, 49, PW, 7, "F");
  // if (organizationBranding?.organizationName) {
  //   setTxt(pdf, 15, 23, 42); pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.5);
  //   pdf.text(organizationBranding.organizationName, PW / 2, 54.5, { align: "center" });
  // }

  // ─ STUDENT CARD (58–83mm) ────────────────────────────────────────────────
  const studentCardY = 58;
  const studentCardH = 25;
  setFill(pdf, 255, 255, 255); setDraw(pdf, 200, 210, 230); pdf.setLineWidth(0.4);
  pdf.roundedRect(ML, studentCardY, CW, studentCardH, 2, 2, "FD");
  setFill(pdf, 59, 130, 246);
  pdf.roundedRect(ML, studentCardY, 3, studentCardH, 1, 1, "F");
  pdf.rect(ML + 1.5, studentCardY, 1.5, studentCardH, "F");

  // Initials avatar circle
  const initials = (studentName || "S").split(" ").map((w: string) => w[0] || "").join("").slice(0, 2).toUpperCase();
  const avatarCX = ML + 11;
  const avatarCY = studentCardY + 12.5;
  setFill(pdf, 239, 246, 255); setDraw(pdf, 59, 130, 246); pdf.setLineWidth(0.8);
  pdf.circle(avatarCX, avatarCY, 5.6, "FD");
  setTxt(pdf, 37, 99, 235); pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.8);
  pdf.text(initials, avatarCX, avatarCY + 2, { align: "center" });

  // Student details
  setTxt(pdf, 15, 23, 42); pdf.setFont("helvetica", "bold"); pdf.setFontSize(13);
  const displayName = (studentName || "Student").length > 28 ? (studentName || "Student").slice(0, 27) + "…" : (studentName || "Student");
  pdf.text(displayName, ML + 23, studentCardY + 8);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); setTxt(pdf, 71, 85, 105);
  pdf.text(`Grade: ${classGrade || "—"}`, ML + 23, studentCardY + 13.5);
  const schoolTxt = (schoolName || "—").length > 28 ? (schoolName || "—").slice(0, 27) + "…" : (schoolName || "—");
  pdf.text(`School: ${schoolTxt}`, ML + 23, studentCardY + 18);
  pdf.text(`Date: ${submittedAt || "—"}`, ML + 23, studentCardY + 22.5);

  // Top career badge (right of student card)
  const topCareer = top10[0]?.career || "—";
  setFill(pdf, 209, 250, 229); setDraw(pdf, 16, 185, 129); pdf.setLineWidth(0.3);
  pdf.roundedRect(PW - ML - 62, studentCardY + 2, 60, 21, 1.5, 1.5, "FD");
  setTxt(pdf, 5, 120, 70); pdf.setFont("helvetica", "bold"); pdf.setFontSize(6.5);
  pdf.text("TOP CAREER MATCH", PW - ML - 32, studentCardY + 6, { align: "center" });
  setFill(pdf, 16, 185, 129); pdf.roundedRect(PW - ML - 60, studentCardY + 8, 58, 13, 1, 1, "F");
  setTxt(pdf, 255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.5);
  const tcTxt = topCareer.length > 26 ? topCareer.slice(0, 25) + "…" : topCareer;
  pdf.text(tcTxt, PW - ML - 31, studentCardY + 16.5, { align: "center" });

  // ─ KPI RIBBON (85–97mm) ──────────────────────────────────────────────────
  const kpiY = studentCardY + studentCardH + 2;
  const kpiH = 12;
  const kpiW = (CW - 4) / 3;
  const kpiItems: Array<{ label: string; value: string; color: [number, number, number] }> = [
    { label: "PROPOSED DOMAIN/S", value: (top10[0]?.cluster || "—").length > 22 ? (top10[0]?.cluster || "—").slice(0, 21) + "…" : (top10[0]?.cluster || "—"), color: [59, 130, 246] },
    { label: "PROPOSED STREAM/S", value: (top10[0]?.proposedStream || "—").length > 22 ? (top10[0]?.proposedStream || "—").slice(0, 21) + "…" : (top10[0]?.proposedStream || "—"), color: [245, 158, 11] },
    { label: "CAREERS ANALYZED", value: `${ranked.length} Global Careers`, color: [139, 92, 246] },
  ];
  kpiItems.forEach((item, ki) => {
    const kx = ML + ki * (kpiW + 2);
    setFill(pdf, 255, 255, 255); setDraw(pdf, 200, 210, 230); pdf.setLineWidth(0.25);
    pdf.roundedRect(kx, kpiY, kpiW, kpiH, 1.5, 1.5, "FD");
    setFill(pdf, item.color[0], item.color[1], item.color[2]);
    pdf.roundedRect(kx, kpiY, 2.5, kpiH, 0.8, 0.8, "F");
    pdf.rect(kx + 1.5, kpiY, 1, kpiH, "F");
    setTxt(pdf, 100, 116, 139); pdf.setFont("helvetica", "bold"); pdf.setFontSize(6.5);
    pdf.text(item.label, kx + 5, kpiY + 4.5);
    setTxt(pdf, item.color[0], item.color[1], item.color[2]);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(9);
    pdf.text(item.value, kx + 5, kpiY + 9.5);
  });

  // ─ SCORE CARDS ───────────────────────────────────────────────────────────
  let y = kpiY + kpiH + 2;
  y = secHeader(pdf, "Complete Assessment Scores Overview", y, ML, CW);
  const cardW = (CW - 2) / 2;
  const cardH = 22;
  SECTION_META.forEach((meta, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = ML + col * (cardW + 2);
    const cy = y + row * (cardH + 3);
    const cardLabel = meta.key === "PERSONALITY" ? "Personality Trait" : meta.label;
    const data = (otherSectionScores?.[meta.key] || {}) as any;
    const score = data?.score ?? 0;
    const maxScore = data?.maxScore ?? meta.defaultMax;
    drawSectionCard(pdf, cx, cy, cardW, cardH, cardLabel, score, maxScore, meta.color, {
      hideScore: meta.key === "PERSONALITY" || meta.key === "CAREER_INTEREST" || meta.key === "LEARNING_STYLE",
      traitNames: meta.key === "PERSONALITY" ? (data?.traits || data?.traitNames || []) : undefined,
      personalityCode: meta.key === "PERSONALITY" ? (data?.personalityType || data?.personalityCode || "") : undefined,
      customTitle: undefined,
      customValue:
        meta.key === "LEARNING_STYLE"
          ? formatLearningStylePrimarySecondary(data).replace(" | ", "\n")
          : meta.key === "CAREER_INTEREST"
            ? formatCareerInterestCode(data?.dominantCode || data?.interestCode || "")
            : undefined,
      badgeText: meta.key === "CAREER_INTEREST" || meta.key === "LEARNING_STYLE" ? "Top 2" : undefined,
    });
  });

  // ─ TOP 3 CAREER HIGHLIGHTS ───────────────────────────────────────────────
  // SECTION_META has 8 items, 2 cols = 4 rows
  const numScoreRows = Math.ceil(SECTION_META.length / 2);
  const cardsEnd = y + numScoreRows * (cardH + 3) - 3;
  const cHlY = cardsEnd + 3;
  const cHlSecY = secHeader(pdf, "Top 3 Career Matches", cHlY, ML, CW);
  const cHlCW = (CW - 4) / 3;
  const cHlH = 281 - cHlSecY;
  top10.slice(0, 3).forEach((item, ci) => {
    const cx = ML + ci * (cHlCW + 2);
    const [cr, cg, cb] = item.band.color;
    const [lr, lg, lb] = item.band.lightColor;
    setFill(pdf, lr, lg, lb); setDraw(pdf, cr, cg, cb); pdf.setLineWidth(0.4);
    pdf.roundedRect(cx, cHlSecY, cHlCW, cHlH, 2, 2, "FD");
    setFill(pdf, cr, cg, cb);
    pdf.roundedRect(cx, cHlSecY, cHlCW, 9, 2, 2, "F");
    pdf.rect(cx, cHlSecY + 4.5, cHlCW, 4.5, "F");
    setTxt(pdf, 255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(8);
    pdf.text(`Preference ${item.rank}`, cx + 3.5, cHlSecY + 6.5);
    // Career name
    setTxt(pdf, 15, 23, 42); pdf.setFont("helvetica", "bold"); pdf.setFontSize(9);
    const nameLines = pdf.splitTextToSize(item.career, cHlCW - 6) as string[];
    const nameLineCount = Math.min(nameLines.length, 2);
    nameLines.slice(0, 2).forEach((nl: string, nli: number) => { pdf.text(nl, cx + 3, cHlSecY + 14 + nli * 5); });

    const cleanDesc = String(item.description || "").trim();
    const cleanCluster = String(item.cluster || "").trim();
    const showDesc = cleanDesc.length > 0 && cleanDesc.toLowerCase() !== cleanCluster.toLowerCase();

    // Description — start immediately below career name; always allow up to 4 lines
    const afterNameY = cHlSecY + 14 + nameLineCount * 5;
    const scRR = 9;
    const bandH = 6;
    const bandTopY = cHlSecY + cHlH - bandH;
    const descStartY = afterNameY + 2;
    const descLineH = 3.4;

    // Reserve space for exactly 4 lines, then place ring below them and clamp above band
    const idealRingCY = descStartY + 3 * descLineH + scRR + 4;
    const ringCY = Math.min(idealRingCY, bandTopY - scRR - 0.2);

    setTxt(pdf, 71, 85, 105); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7);
    if (showDesc) {
      const descLines = pdf.splitTextToSize(cleanDesc, cHlCW - 6) as string[];
      descLines.slice(0, 4).forEach((dl: string, dli: number) => {
        pdf.text(dl, cx + 3, descStartY + dli * descLineH);
      });
    }

    // Score ring
    setFill(pdf, cr, cg, cb);    pdf.circle(cx + cHlCW / 2, ringCY, scRR, "F");
    setTxt(pdf, 255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(11);
    pdf.text(`${item.capabilityScore}`, cx + cHlCW / 2, ringCY + 1.5, { align: "center" });

    // Capability band label pinned to bottom
    setFill(pdf, cr, cg, cb);
    pdf.roundedRect(cx + 3, bandTopY + 0.5, cHlCW - 6, bandH - 1, 0.8, 0.8, "F");
    setTxt(pdf, 255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(6.5);
    const bShort = item.band.label.replace(" Alignment", "").replace(" Potential", "").replace(" Match", "");
    pdf.text(bShort, cx + cHlCW / 2, bandTopY + bandH - 1.5, { align: "center" });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 2: Grouped Components (Cognitive first, then Aptitude)
  // ════════════════════════════════════════════════════════════════════════════
  pdf.addPage();
  pageNum++;
  setFill(pdf, 248, 250, 252);
  pdf.rect(0, 0, PW, 297, "F");

  addPageHeader(pdf, "Cognitive and Aptitude Components", PW);

  let p2y = 20;

  setTxt(pdf, 71, 85, 105);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.text("Components are grouped below with full names and individual capability scores out of 100.", ML, p2y + 3);
  p2y += 8;

  const cognitiveRows: Array<{ key: TraitKey; label: string }> = [
    { key: "VR", label: "Verbal Reasoning" },
    { key: "NR", label: "Numerical Reasoning" },
    { key: "SR", label: "Spatial Reasoning" },
    { key: "MP", label: "Memory and Processing" },
  ];
  const aptitudeRows: Array<{ key: TraitKey; label: string }> = [
    { key: "LR", label: "Logical and Analytical Ability" },
    { key: "NA", label: "Numerical Aptitude" },
    { key: "VA", label: "Verbal Aptitude" },
    { key: "MA", label: "Mechanical Aptitude" },
    { key: "CI", label: "Creativity and Innovation" },
  ];

  p2y = secHeader(pdf, "Cognitive Ability", p2y, ML, CW);
  cognitiveRows.forEach((row, i) => {
    const score = Math.round(traitScores[row.key]);
    const weight = Math.round(WEIGHTS[row.key] * 100);
    const color: [number, number, number] = score >= 75 ? [16, 185, 129] : score >= 50 ? [245, 158, 11] : [239, 68, 68];
    drawTraitRow(pdf, ML, p2y + i * 11, CW, row.label, score, weight, color);
  });

  p2y += cognitiveRows.length * 11 + 4;
  p2y = secHeader(pdf, "Aptitude Profile", p2y, ML, CW);
  aptitudeRows.forEach((row, i) => {
    const score = Math.round(traitScores[row.key]);
    const weight = Math.round(WEIGHTS[row.key] * 100);
    const color: [number, number, number] = score >= 75 ? [16, 185, 129] : score >= 50 ? [245, 158, 11] : [239, 68, 68];
    drawTraitRow(pdf, ML, p2y + i * 11, CW, row.label, score, weight, color);
  });

  p2y += aptitudeRows.length * 11 + 4;
  setFill(pdf, 239, 246, 255);
  setDraw(pdf, 191, 219, 254);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(ML, p2y, CW, 20, 1.5, 1.5, "FD");
  setFill(pdf, 30, 58, 138);
  pdf.roundedRect(ML, p2y, CW, 5.5, 1.5, 1.5, "F");
  pdf.rect(ML, p2y + 3, CW, 2.5, "F");
  setTxt(pdf, 255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("INTERPRETATION", ML + CW / 2, p2y + 3.9, { align: "center" });
  setTxt(pdf, 30, 41, 59);
  pdf.setFontSize(8.8);
  const iX = ML + 3;
  const iY1 = p2y + 9.4;
  const iY2 = p2y + 13.1;
  const iY3 = p2y + 16.8;

  pdf.setFont("helvetica", "normal");
  const l1a = "Scores above 75 indicate ";
  pdf.text(l1a, iX, iY1);
  let cx = iX + pdf.getTextWidth(l1a);
  pdf.setFont("helvetica", "bold");
  const l1b = '"strong"';
  pdf.text(l1b, cx, iY1);
  cx += pdf.getTextWidth(l1b);
  pdf.setFont("helvetica", "normal");
  pdf.text(" readiness in that component.", cx, iY1);

  const l2a = "Scores between 50 and 74 indicate ";
  pdf.text(l2a, iX, iY2);
  cx = iX + pdf.getTextWidth(l2a);
  pdf.setFont("helvetica", "bold");
  const l2b = '"developing"';
  pdf.text(l2b, cx, iY2);
  cx += pdf.getTextWidth(l2b);
  pdf.setFont("helvetica", "normal");
  pdf.text(" capability.", cx, iY2);

  const l3a = "Scores below 50 indicate a ";
  pdf.text(l3a, iX, iY3);
  cx = iX + pdf.getTextWidth(l3a);
  pdf.setFont("helvetica", "bold");
  const l3b = '"focused development"';
  pdf.text(l3b, cx, iY3);
  cx += pdf.getTextWidth(l3b);
  pdf.setFont("helvetica", "normal");
  pdf.text(" area for better career fit.", cx, iY3);

  // ─ RADAR CHARTS (split for visibility)
  p2y += 26;
  p2y = secHeader(pdf, "Trait Radar Profiles", p2y, ML, CW);
  const cognitiveLabels = [
    "Verbal Reasoning",
    "Numerical Reasoning",
    "Spatial Reasoning",
    "Memory & Processing",
  ];
  const aptitudeLabels = [
    "Logical Reasoning",
    "Numerical Aptitude",
    "Verbal Aptitude",
    "Mechanical Aptitude",
    "Creative Intelligence",
  ];
  const cogCX = ML + 48;
  const aptCX = PW - ML - 48;
  const radarCY2 = p2y + 50;
  const cogR = 21;
  const aptR = 21;

  setTxt(pdf, 30, 58, 138);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("Cognitive Components", cogCX, p2y + 10, { align: "center" });
  pdf.text("Aptitude Components", aptCX, p2y + 10, { align: "center" });

  drawRadarChart(
    pdf,
    cogCX,
    radarCY2,
    cogR,
    [traitScores.VR, traitScores.NR, traitScores.SR, traitScores.MP].map((v) => Math.round(v)),
    cognitiveLabels,
    { labelRadius: 36, labelWidth: 30, labelFontSize: 6.8 }
  );
  drawRadarChart(
    pdf,
    aptCX,
    radarCY2,
    aptR,
    [traitScores.LR, traitScores.NA, traitScores.VA, traitScores.MA, traitScores.CI].map((v) => Math.round(v)),
    aptitudeLabels,
    { labelRadius: 36, labelWidth: 31, labelFontSize: 6.8 }
  );

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 3: Top 10 Career Recommendations
  // ════════════════════════════════════════════════════════════════════════════
  pdf.addPage();
  pageNum++;
  setFill(pdf, 248, 250, 252);
  pdf.rect(0, 0, PW, 297, "F");

  addPageHeader(pdf, "Top 10 Career Recommendations", PW);

  let p3y = 20;

  setTxt(pdf, 71, 85, 105);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.text("Ranked by Capability Score.", ML, p3y + 3);
  p3y += 8;

  // Table header
  setFill(pdf, 30, 58, 138);
  pdf.rect(ML, p3y, CW, 7, "F");
  setTxt(pdf, 255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("#",          ML + 4,   p3y + 5);
  pdf.text("Career Roles",ML + 13,  p3y + 5);
  pdf.text("Cluster",    ML + 100, p3y + 5);
  pdf.text("Compatibility Score",    ML + 164, p3y + 5);
  // pdf.text("Score",      ML + 182, p3y + 5);
  p3y += 9;

  top10.forEach((item, idx) => {
    const rowY = p3y + idx * 11;
    if (rowY > 270) return;

    const [lr, lg, lb] = item.band.lightColor;
    const [cr, cg, cb] = item.band.color;

    // Row bg
    setFill(pdf, lr, lg, lb);
    pdf.rect(ML, rowY, CW, 10, "F");

    // Accent strip
    setFill(pdf, cr, cg, cb);
    pdf.rect(ML, rowY, 1.5, 10, "F");

    // Rank badge
    setFill(pdf, cr, cg, cb);
    pdf.circle(ML + 5.5, rowY + 5, 4, "F");
    setTxt(pdf, 255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(`${item.rank}`, ML + 5.5, rowY + 7, { align: "center" });

    // Career
    setTxt(pdf, 15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    const careerStr = item.career.length > 45 ? item.career.slice(0, 44) + "…" : item.career;
    pdf.text(careerStr, ML + 13, rowY + 6.5);

    // Cluster
    setTxt(pdf, 71, 85, 105);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    const clusterStr = item.cluster.length > 18 ? item.cluster.slice(0, 17) + "…" : item.cluster;
    pdf.text(clusterStr, ML + 100, rowY + 6.5);

    // Score bar
    const barX = ML + 155, barY = rowY + 2.5, barW = 24, barH = 5;
    const fillW = Math.max(0.5, barW * (item.capabilityScore / 100));
    setFill(pdf, 226, 232, 240);
    setDraw(pdf, 0, 0, 0);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(barX, barY, barW, barH, 1, 1, "FD");
    setFill(pdf, cr, cg, cb);
    pdf.roundedRect(barX, barY, fillW, barH, 1, 1, "F");

    // Score value – positioned with enough room from right edge
    setTxt(pdf, 0, 0, 0);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(`${item.capabilityScore}`, ML + 186, rowY + 6.5);
  });

  // Band key footer bar
  const bandKeyY = p3y + 10 * 11 + 2;
  if (bandKeyY < 270) {
    setFill(pdf, 226, 232, 240);
    pdf.rect(ML, bandKeyY, CW, 8, "F");
    setTxt(pdf, 71, 85, 105);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text("BAND KEY:", ML + 2, bandKeyY + 5);
    const shortLabels = ["Strong (>=85)", "High (75-84)", "Moderate (65-74)", "Conditional (50-64)", "Low (<50)"];
    BANDS.forEach((b, bi) => {
      const bx = ML + 28 + bi * 34;
      setFill(pdf, b.color[0], b.color[1], b.color[2]);
      pdf.roundedRect(bx, bandKeyY + 1.5, 4.5, 5, 0.5, 0.5, "F");
      setTxt(pdf, 30, 41, 59);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(shortLabels[bi], bx + 5.5, bandKeyY + 5.5);
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 4: Cluster Summary + Gap Analysis + Development Areas
  // ════════════════════════════════════════════════════════════════════════════
  pdf.addPage();
  pageNum++;
  setFill(pdf, 248, 250, 252);
  pdf.rect(0, 0, PW, 297, "F");

  addPageHeader(pdf, "Cluster Summary, Gap Analysis & Guidance", PW);

  let p4y = 20;

  // ─ Cluster summary (2-col)
  p4y = secHeader(pdf, "Cluster Capability Summary", p4y, ML, CW);

  const half = Math.ceil(clusterData.length / 2);
  const c1 = clusterData.slice(0, half);
  const c2 = clusterData.slice(half);
  const rowH4 = 5.5;
  const colCW = (CW - 2) / 2;

  // Column headers
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  setTxt(pdf, 30, 58, 138);
  pdf.text("Domain", ML, p4y);
  pdf.text("Avg Score", ML + 45, p4y);
  pdf.text("Domain", ML + colCW + 2, p4y);
  pdf.text("Avg Score", ML + colCW + 47, p4y);
  p4y += 2.5;

  const maxRows = Math.min(Math.max(c1.length, c2.length), 12);
  for (let ci = 0; ci < maxRows; ci++) {
    const rowY = p4y + ci * rowH4;

    if (ci % 2 === 0) {
      setFill(pdf, 241, 245, 249);
      pdf.rect(ML, rowY, CW, rowH4 - 0.2, "F");
    }

    const renderClRow = (item: typeof clusterData[0] | undefined, cx: number) => {
      if (!item) return;
      const band = getBand(item.avgScore);
      const [cr, cg, cb] = band.color;
      const barW = 20;

      setTxt(pdf, 15, 23, 42);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      const name = item.cluster.length > 14 ? item.cluster.slice(0, 13) + "…" : item.cluster;
      pdf.text(name, cx, rowY + 4);

      setFill(pdf, 226, 232, 240);
      setDraw(pdf, 0, 0, 0);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(cx + 45, rowY + 0.8, barW, 3.5, 0.6, 0.6, "FD");
      setFill(pdf, cr, cg, cb);
      pdf.roundedRect(cx + 45, rowY + 0.8, Math.max(0.3, barW * (item.avgScore / 100)), 3.5, 0.6, 0.6, "F");

      setTxt(pdf, 0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.text(`${item.avgScore}`, cx + 67, rowY + 4);
    };

    renderClRow(c1[ci], ML);
    renderClRow(c2[ci], ML + colCW + 2);
  }

  p4y += maxRows * rowH4 + 3;

  // ─ Gap analysis
  p4y = secHeader(pdf, "Development Gap Analysis – Top 5 Careers", p4y, ML, CW);

  // Grouped header (Cognitive first, then Aptitude)
  setFill(pdf, 227, 235, 250);
  pdf.rect(ML, p4y, CW, 4.5, "F");
  setTxt(pdf, 30, 58, 138);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.text("COGNITIVE", ML + 62, p4y + 3.2, { align: "center" });
  pdf.text("APTITUDE", ML + 139, p4y + 3.2, { align: "center" });
  p4y += 4.8;

  // Table header
  setFill(pdf, 30, 58, 138);
  pdf.rect(ML, p4y, CW, 6, "F");
  setTxt(pdf, 255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("Career", ML + 1, p4y + 4.2);

  const gapCols = [ML + 44, ML + 61, ML + 78, ML + 95, ML + 112, ML + 129, ML + 146, ML + 163, ML + 180];
  const traitShorts = ["VR", "NR", "SR", "MP", "LR", "NA", "VA", "MA", "CI"];
  traitShorts.forEach((t, ti) => {
    pdf.text(t, gapCols[ti], p4y + 4.2, { align: "center" });
  });
  p4y += 7;

  top10.slice(0, 5).forEach((item, ri) => {
    const rowY = p4y + ri * 7;
    if (rowY > 200) return;

    setFill(pdf, ri % 2 === 0 ? 241 : 248, ri % 2 === 0 ? 245 : 250, ri % 2 === 0 ? 249 : 252);
    pdf.rect(ML, rowY, CW, 6.5, "F");

    setTxt(pdf, 15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    const n = item.career.length > 17 ? item.career.slice(0, 16) + "…" : item.career;
    pdf.text(n, ML + 1, rowY + 4.8);

    TRAIT_KEYS.forEach((key, ti) => {
      const gap = item.gaps[key];
      const [gcr, gcg, gcb] = getGapColor(gap);
      setFill(pdf, gcr, gcg, gcb);
      pdf.roundedRect(gapCols[ti] - 5, rowY + 0.8, 10, 5.5, 0.6, 0.6, "F");
      setTxt(pdf, 255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.text(gap > 0 ? `+${gap}` : `${gap}`, gapCols[ti], rowY + 4.8, { align: "center" });
    });
  });

  p4y += 5 * 7 + 2;

  // Gap legend
  setFill(pdf, 226, 232, 240);
  pdf.rect(ML, p4y, CW, 6, "F");
  setTxt(pdf, 71, 85, 105);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.text("Gap Key:", ML + 2, p4y + 4);
  const gapLegItems = [
    { label: "Surplus(+10+)", color: [16, 185, 129] as [number, number, number] },
    { label: "Meets Req(0+)", color: [59, 130, 246] as [number, number, number] },
    { label: "Minor(0 to -10)", color: [245, 158, 11] as [number, number, number] },
    { label: "Moderate(-20)", color: [168, 85, 247] as [number, number, number] },
    { label: "Major(<-20)", color: [239, 68, 68] as [number, number, number] },
  ];
  gapLegItems.forEach((item, gi) => {
    const gx = ML + 22 + gi * 36;
    setFill(pdf, item.color[0], item.color[1], item.color[2]);
    pdf.roundedRect(gx, p4y + 1, 4, 4, 0.4, 0.4, "F");
    setTxt(pdf, 30, 41, 59);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.text(item.label, gx + 5, p4y + 4.2);
  });

  p4y += 9;

  // ─ Development Areas
  p4y = secHeader(pdf, "Key Development Areas", p4y, ML, CW);

  const devTraits = new Map<TraitKey, number[]>();
  top10.slice(0, 5).forEach((item) => {
    TRAIT_KEYS.forEach((key) => {
      if (item.gaps[key] < 0) {
        if (!devTraits.has(key)) devTraits.set(key, []);
        devTraits.get(key)!.push(item.gaps[key]);
      }
    });
  });

  if (devTraits.size === 0) {
    setFill(pdf, 248, 250, 252);
    setDraw(pdf, 203, 213, 225);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(ML, p4y, CW, 7, 1, 1, "FD");
    setTxt(pdf, 51, 65, 85);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Student meets requirements for all traits across the top 5 career recommendations.", ML + CW / 2, p4y + 5, { align: "center" });
    p4y += 10;
  } else {
    const devEntries = Array.from(devTraits.entries()).sort((a, b) => Math.min(...a[1]) - Math.min(...b[1]));
    devEntries.slice(0, 4).forEach((entry, di) => {
      const [key, gaps] = entry;
      const worst = Math.min(...gaps);
      const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);

      setFill(pdf, di % 2 === 0 ? 255 : 248, di % 2 === 0 ? 255 : 250, di % 2 === 0 ? 255 : 252);
      setDraw(pdf, 203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(ML, p4y + di * 8, CW, 7, 1, 1, "FD");
      setFill(pdf, 148, 163, 184);
      pdf.roundedRect(ML, p4y + di * 8, 3, 7, 1, 1, "F");
      pdf.rect(ML + 1.5, p4y + di * 8, 1.5, 7, "F");
      setTxt(pdf, 15, 23, 42);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text(TRAIT_LABELS[key], ML + 7, p4y + di * 8 + 5);
      setTxt(pdf, 71, 85, 105);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.text(`Avg gap: ${avg} pts (${getGapLabel(avg)})  |  Affects ${gaps.length} of top 5 careers`, ML + 60, p4y + di * 8 + 5);
    });
    p4y += Math.min(devEntries.length, 4) * 8 + 2;
  }

  p4y += 3;

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 5+: Complete Assessment Scores Detailed Breakdown
  // ════════════════════════════════════════════════════════════════════════════

  const startDetailedBreakdownPage = (continued: boolean): number => {
    pdf.addPage();
    pageNum++;
    setFill(pdf, 248, 250, 252);
    pdf.rect(0, 0, PW, 297, "F");
    addPageHeader(pdf, continued ? "Complete Assessment Score" : "Complete Assessment Scores", PW);
    let y = 20;
    y = secHeader(pdf, continued ? "Detailed Score" : "Detailed Score", y, ML, CW);
    setTxt(pdf, 71, 85, 105);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Each section shows total score and full component.", ML, y + 3.5);
    return y + 9;
  };

  // Helper: draw a section header banner and return the y below it
  const drawSectionHeader = (
    y: number,
    label: string,
    score: number,
    maxScore: number,
    pct: number,
    color: [number, number, number],
    showOverall: boolean = true,
  ): number => {
    const H = 9;
    setFill(pdf, color[0], color[1], color[2]);
    setDraw(pdf, color[0], color[1], color[2]);
    pdf.setLineWidth(0);
    pdf.roundedRect(ML, y, CW, H, 2, 2, "F");
    setTxt(pdf, 255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(label, ML + 4, y + 6.2);
    if (showOverall) {
      pdf.setFontSize(9.5);
      pdf.text(`Overall: ${score}/${maxScore}  (${pct}%)`, ML + CW - 4, y + 6.2, { align: "right" });
    }
    return y + H + 3;
  };

  // Helper: draw vertical bar chart for an array of {name, pct, subLabel}
  const drawVerticalBarChart = (
    startY: number,
    bars: Array<{ name: string; pct: number; subLabel: string }>,
    color: [number,number,number]
  ): number => {
    const n = Math.max(1, bars.length);
    const AXIS_W = 10; // width reserved for Y-axis labels
    const TOP_PAD = 9;  // space above chart top for 100% value label
    const chartX = ML + AXIS_W + 2;
    const chartW = CW - AXIS_W - 4;
    const chartH = 48; // taller bars
    const chartY = startY + TOP_PAD;
    const bottomY = chartY + chartH;
    const labelH = 14; // height below axis for two lines of label + subLabel
    const totalBoxH = TOP_PAD + chartH + labelH + 8;

    // Background rect for chart area
    setFill(pdf, 250, 251, 253);
    setDraw(pdf, 220, 228, 240);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(ML, startY, CW, totalBoxH, 1, 1, "FD");

    // Y-axis grid lines
    [0, 25, 50, 75, 100].forEach((g) => {
      const gy = bottomY - (chartH * g / 100);
      setDraw(pdf, 210, 220, 235);
      pdf.setLineWidth(0.15);
      pdf.line(chartX, gy, chartX + chartW, gy);
      setTxt(pdf, 140, 150, 168);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.text(`${g}%`, ML + AXIS_W, gy + 1, { align: "right" });
    });

    // X-axis baseline
    setDraw(pdf, 100, 116, 139);
    pdf.setLineWidth(0.4);
    pdf.line(chartX, bottomY, chartX + chartW, bottomY);

    // Bars
    const slotW = chartW / n;
    const barW = Math.min(slotW * 0.55, 18);

    bars.forEach((bar, idx) => {
      const pctVal = Math.max(0, Math.min(100, bar.pct));
      const bh = Math.max(pctVal > 0 ? 1.5 : 0, (chartH * pctVal) / 100);
      const bx = chartX + idx * slotW + (slotW - barW) / 2;
      const by = bottomY - bh;

      // Value label above bar
      setTxt(pdf, 30, 41, 59);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.text(`${Math.round(pctVal)}%`, bx + barW / 2, by - 1.5, { align: "center" });

      // Bar fill with border
      setFill(pdf, color[0], color[1], color[2]);
      setDraw(pdf, Math.max(0, color[0] - 40), Math.max(0, color[1] - 40), Math.max(0, color[2] - 40));
      pdf.setLineWidth(0.25);
      pdf.roundedRect(bx, by, barW, bh, 0.8, 0.8, "FD");

      // Label below (2 lines: bold name + normal subLabel)
      const labelY = bottomY + 4;
      const labelX = bx + barW / 2;
      const words = bar.name.split(" ");
      const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
      const line2 = words.length > 1 ? words.slice(Math.ceil(words.length / 2)).join(" ") : "";
      setTxt(pdf, 30, 41, 59);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.8);
      pdf.text(line1, labelX, labelY, { align: "center" });
      if (line2) {
        pdf.text(line2, labelX, labelY + 4, { align: "center" });
      }
      if (bar.subLabel) {
        setTxt(pdf, 100, 116, 139);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.2);
        pdf.text(bar.subLabel, labelX, labelY + (line2 ? 8 : 4), { align: "center" });
      }
    });

    return startY + totalBoxH + 3;
  };

  // Helper: draw PERSONALITY section (MBTI type + dimensions grid)
  const drawPersonalitySection = (startY: number, data: any, color: [number,number,number]): number => {
    const personalityType = String(data?.personalityType || "").trim().toUpperCase();
    const title = MBTI_NAMES[personalityType] || personalityType || "Personality Profile";
    const desc = MBTI_DESCRIPTIONS[personalityType] || "";
    const dims: Array<{ pair: string; winner: string; letterA: string; letterB: string; percentA: number; percentB: number }> =
      Array.isArray(data?.personalityDimensions) && data.personalityDimensions.length
        ? data.personalityDimensions
        : personalityType.length === 4
          ? [
              { pair: "E/I", winner: personalityType[0], letterA: "E", letterB: "I", percentA: personalityType[0]==="E"?65:35, percentB: personalityType[0]==="E"?35:65 },
              { pair: "S/N", winner: personalityType[1], letterA: "S", letterB: "N", percentA: personalityType[1]==="S"?65:35, percentB: personalityType[1]==="S"?35:65 },
              { pair: "T/F", winner: personalityType[2], letterA: "T", letterB: "F", percentA: personalityType[2]==="T"?65:35, percentB: personalityType[2]==="T"?35:65 },
              { pair: "J/P", winner: personalityType[3], letterA: "J", letterB: "P", percentA: personalityType[3]==="J"?65:35, percentB: personalityType[3]==="J"?35:65 },
            ]
          : [];

    let y = startY;

    // Type title + desc box
    const descLines = desc ? (pdf.splitTextToSize(desc, CW - 10) as string[]) : [];
    const infoH = 13 + descLines.length * 4.8 + 4;
    setFill(pdf, 245, 243, 255);
    setDraw(pdf, 200, 185, 240);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(ML, y, CW, infoH, 1.5, 1.5, "FD");

    setTxt(pdf, 109, 40, 217);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(title, ML + 4, y + 6.2);
    y += 12.5;
    if (descLines.length) {
      setTxt(pdf, 75, 85, 99);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      descLines.forEach((line) => {
        pdf.text(line, ML + 4, y);
        y += 4.8;
      });
    }
    y += 4;

    // MBTI Dimension Grid (2 cols × 2 rows)
    if (dims.length === 4) {
      const colW = CW / 2 - 2;
      const rowH = 42;
      dims.forEach((dim, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cx = ML + col * (colW + 4);
        const cy = y + row * (rowH + 4);
        const meta = MBTI_DIMENSION_META[dim.pair];
        if (!meta) return;

        // Card background
        setFill(pdf, 248, 249, 252);
        setDraw(pdf, 210, 218, 235);
        pdf.setLineWidth(0.2);
        pdf.roundedRect(cx, cy, colW, rowH, 1.5, 1.5, "FD");

        // Dimension label at top
        setTxt(pdf, 71, 85, 105);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.text(meta.label, cx + colW / 2, cy + 5.5, { align: "center" });

        // Circles: use friendly 2-letter names (SO/RO, PO/CT, LD/VD, SW/FW)
        const labelA = FRIENDLY_LETTER[dim.letterA] ?? dim.letterA;
        const labelB = FRIENDLY_LETTER[dim.letterB] ?? dim.letterB;
        const circR = 6.5;
        const gap = circR * 2 + 5;
        const leftCX = cx + colW / 2 - gap / 2 - circR;
        const rightCX = cx + colW / 2 + gap / 2 + circR;
        // Layout within card (rowH=42):
        //   cy+0:  card top
        //   cy+6:  dimension label
        //   cy+11: orientation name line 1
        //   cy+15: orientation name line 2 (if 2 words)
        //   cy+26: circle center
        //   cy+35: percent label
        //   cy+42: card bottom
        const cirY = cy + 26;
        const winA = dim.winner === dim.letterA;
        const winB = dim.winner === dim.letterB;

        // Winner name labels above circles
        const nameLines = (name: string) => {
          const words = name.split(" ");
          return words.length > 1 ? [words[0], words.slice(1).join(" ")] : [name];
        };
        const nlA = nameLines(meta.nameA);
        const nlB = nameLines(meta.nameB);
        const nameTopY = cy + 11.5;
        if (winA) { setTxt(pdf, 56, 68, 88); pdf.setFont("helvetica", "bold"); }
        else { setTxt(pdf, 92, 106, 128); pdf.setFont("helvetica", "normal"); }
        pdf.setFontSize(6.5);
        nlA.forEach((ln, li) => pdf.text(ln, leftCX, nameTopY + li * 3.8, { align: "center" }));

        if (winB) { setTxt(pdf, 56, 68, 88); pdf.setFont("helvetica", "bold"); }
        else { setTxt(pdf, 92, 106, 128); pdf.setFont("helvetica", "normal"); }
        pdf.setFontSize(6.5);
        nlB.forEach((ln, li) => pdf.text(ln, rightCX, nameTopY + li * 3.8, { align: "center" }));

        // Circle A
        if (winA) { setFill(pdf, meta.cr, meta.cg, meta.cb); } else { setFill(pdf, 228, 232, 240); }
        setDraw(pdf, meta.cr, meta.cg, meta.cb);
        pdf.setLineWidth(winA ? 0.5 : 0.25);
        pdf.circle(leftCX, cirY, circR, "FD");
        if (winA) { setTxt(pdf, 255, 255, 255); } else { setTxt(pdf, 158, 168, 185); }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6.8);
        pdf.text(labelA, leftCX, cirY + 2.5, { align: "center" });

        // Circle B
        if (winB) { setFill(pdf, meta.cr, meta.cg, meta.cb); } else { setFill(pdf, 228, 232, 240); }
        setDraw(pdf, meta.cr, meta.cg, meta.cb);
        pdf.setLineWidth(winB ? 0.5 : 0.25);
        pdf.circle(rightCX, cirY, circR, "FD");
        if (winB) { setTxt(pdf, 255, 255, 255); } else { setTxt(pdf, 158, 168, 185); }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6.8);
        pdf.text(labelB, rightCX, cirY + 2.5, { align: "center" });

        // Percent labels below circles
        setTxt(pdf, 80, 90, 110);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.text(`${dim.percentA}%`, leftCX, cirY + circR + 4, { align: "center" });
        pdf.text(`${dim.percentB}%`, rightCX, cirY + circR + 4, { align: "center" });
      });
      y += 2 * (rowH + 4) + 4;
    }

    return y;
  };

  // Helper: draw Learning Style section (primary/secondary cards + ranked horizontal bars)
  const drawLearningStyleSection = (startY: number, data: any): number => {
    const rawParts: Array<{ partName: string; score: number; maxScore: number; percentage: number }> =
      Array.isArray(data?.parts) ? data.parts : [];

    const vakMap = new Map<"V" | "A" | "K", { partName: string; score: number; maxScore: number; percentage: number }>();
    rawParts.forEach((part) => {
      const code = getLearningStyleCodeFromName(String(part?.partName || ""));
      if (!code) return;
      const current = vakMap.get(code);
      if (!current || Number(part?.percentage ?? 0) > Number(current.percentage ?? 0)) {
        vakMap.set(code, {
          partName: LEARNING_STYLE_NAMES[code] || String(part?.partName || "Style"),
          score: Math.round(Number(part?.score ?? 0)),
          maxScore: Math.round(Number(part?.maxScore ?? 0)),
          percentage: Math.round(Number(part?.percentage ?? 0)),
        });
      }
    });

    const parts = (["V", "A", "K"] as const)
      .map((code) => vakMap.get(code))
      .filter(Boolean) as Array<{ partName: string; score: number; maxScore: number; percentage: number }>;

    parts.sort((a, b) => b.percentage - a.percentage || b.score - a.score);

    if (!parts.length) return startY + 2;

    let y = startY;
    const primary = parts[0];
    const secondary = parts[1];

    // Primary / Secondary in simple text format
    if (primary) {
      setTxt(pdf, 30, 41, 59);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text(`Primary: ${primary.partName}`, ML + 1, y + 4.5);
      if (secondary) {
        pdf.text(`Secondary: ${secondary.partName}`, ML + 1, y + 9.5);
        y += 12.5;
      } else {
        y += 8;
      }
    }

    // Ranked horizontal bars for all parts
    setTxt(pdf, 30, 41, 59);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("All Styles — Ranked", ML, y + 4);
    y += 7;

    const barX = ML + 29;
    const scoreAreaW = 34;
    const barTotalW = CW - 30 - scoreAreaW;
    parts.forEach((part, idx) => {
      const pct = Math.max(0, Math.min(100, part.percentage));
      const rowH = 8;
      const rankColors: Array<[number,number,number]> = [[16,185,129],[20,184,166],[100,116,139]];
      const [cr, cg, cb] = idx < 2 ? rankColors[idx] : rankColors[2];

      // rank badge
      setFill(pdf, cr, cg, cb);
      pdf.circle(ML + 3.5, y + rowH / 2, 3, "F");
      setTxt(pdf, 255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text(`${idx + 1}`, ML + 3.5, y + rowH / 2 + 2.5, { align: "center" });

      // Part name
      setTxt(pdf, 30, 41, 59);
      pdf.setFont("helvetica", idx < 2 ? "bold" : "normal");
      pdf.setFontSize(8.5);
      const nameStr = part.partName.length > 18 ? part.partName.slice(0, 17) + "…" : part.partName;
      pdf.text(nameStr, ML + 9, y + 5.5);

      // Score text
      setTxt(pdf, cr, cg, cb);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(`${part.score}/${part.maxScore} (${pct}%)`, ML + CW - 3, y + 2.8, { align: "right" });

      // Horizontal bar track
      const barH = 3;
      const barY = y + rowH - 3.5;
      setFill(pdf, 220, 228, 240);
      pdf.roundedRect(barX, barY, barTotalW, barH, 1, 1, "F");
      if (pct > 0) {
        setFill(pdf, cr, cg, cb);
        pdf.roundedRect(barX, barY, barTotalW * pct / 100, barH, 1, 1, "F");
      }

      y += rowH + 2;
    });

    return y + 3;
  };

  let p5y = startDetailedBreakdownPage(false);

  const detailedSectionMeta = SECTION_META.filter((m) => m.key !== "COGNITIVE" && m.key !== "APTITUDE");

  detailedSectionMeta.forEach((meta) => {
    const data = (otherSectionScores?.[meta.key] || {}) as any;
    const score = Math.round(Number(data?.score || 0));
    const maxScore = Number(data?.maxScore || meta.defaultMax);
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    // Estimate height for page-break check
    let estimatedH = 12; // header
    if (meta.key === "PERSONALITY") {
      const pType = String(data?.personalityType || "").trim().toUpperCase();
      const pDesc = MBTI_DESCRIPTIONS[pType] || "";
      const dLines = pDesc ? Math.ceil(pDesc.length / 60) : 0;
      estimatedH = 12 + 11 + dLines * 4.8 + 4 + (pType.length === 4 ? 2 * (42 + 4) + 4 : 0);
    } else if (meta.key === "LEARNING_STYLE") {
      estimatedH = 12 + 12 + 7 + 3 * 10 + 6;
    } else {
      const pLen = Array.isArray(data?.parts) ? data.parts.length : 0;
      estimatedH = 12 + (pLen > 0 ? 45 + 12 + 12 : 10);
    }

    if (p5y + estimatedH > 282) {
      p5y = startDetailedBreakdownPage(true);
    }

    // Section header banner
    p5y = drawSectionHeader(p5y, meta.label, score, maxScore, pct, meta.color, meta.key !== "PERSONALITY");

    if (meta.key === "PERSONALITY") {
      p5y = drawPersonalitySection(p5y, data, meta.color);
    } else if (meta.key === "LEARNING_STYLE") {
      p5y = drawLearningStyleSection(p5y, data);
    } else {
      // Vertical bar chart for numeric parts
      const parts: Array<any> = Array.isArray(data?.parts) ? data.parts : [];
      if (parts.length) {
        const bars = parts.map((part: any) => ({
          name: String(part?.partName || "Component"),
          pct: Math.max(0, Math.min(100, Math.round(Number(part?.percentage ?? 0)))),
          subLabel: `${Math.round(Number(part?.score ?? 0))}/${Math.round(Number(part?.maxScore ?? 0))}`,
        }));
        p5y = drawVerticalBarChart(p5y, bars, meta.color);
      } else if (meta.key === "CAREER_INTEREST" && data?.dominantCode) {
        const profile = formatCareerInterestCode(data.dominantCode);
        setFill(pdf, 255, 251, 235);
        setDraw(pdf, 245, 158, 11);
        pdf.setLineWidth(0.2);
        pdf.roundedRect(ML, p5y, CW, 10, 1, 1, "FD");
        setTxt(pdf, 30, 41, 59);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.5);
        pdf.text(`Dominant Code: ${data.dominantCode}  —  ${profile}`, ML + 4, p5y + 6.5);
        p5y += 14;
      } else {
        setTxt(pdf, 130, 140, 155);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.text("Detailed component data not available.", ML + 4, p5y + 5);
        p5y += 10;
      }
    }

    p5y += 5; // gap between sections
  });

  // ════════════════════════════════════════════════════════════════════════════
  // COUNSELOR GUIDANCE + DISCLAIMER (kept as requested)
  // ════════════════════════════════════════════════════════════════════════════
  pdf.addPage();
  pageNum++;
  setFill(pdf, 248, 250, 252);
  pdf.rect(0, 0, PW, 297, "F");

  addPageHeader(pdf, "Guidance and Disclaimer", PW);

  let p6y = 20;
  p6y = secHeader(pdf, "Counselor Guidance", p6y, ML, CW);

  setFill(pdf, 255, 255, 255);
  setDraw(pdf, 200, 210, 230);
  pdf.setLineWidth(0.3);
  const guidanceLines = [
    "This report evaluates careers using cognitive and aptitude profile alignment.",
    "Higher scores indicate stronger current capability match.",
    "Development areas show traits where targeted improvement can strengthen fit.",
    "Next Steps:",
    "- Review RIASEC interest profile (personality and career interest assessment)",
    "- Consider academic performance and available stream options",
    "- Discuss family preferences and economic opportunities with student",
    "- Coordinate with school counselor for comprehensive career planning",
  ];

  const guidanceTextLines: string[] = [];
  guidanceLines.forEach((line) => {
    if (line === "Next Steps:") {
      guidanceTextLines.push("__NEXT_STEPS__");
      return;
    }
    const wrapped = pdf.splitTextToSize(line, CW - 8) as string[];
    wrapped.forEach((w: string) => guidanceTextLines.push(w));
  });

  const guideLineH = 3.8;
  const guidanceBoxH = Math.max(30, 8 + guidanceTextLines.length * guideLineH);
  pdf.roundedRect(ML, p6y, CW, guidanceBoxH, 1.5, 1.5, "FD");

  setTxt(pdf, 30, 41, 59);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  let lineY = p6y + 5.5;
  guidanceTextLines.forEach((line) => {
    if (line === "__NEXT_STEPS__") {
      pdf.setFont("helvetica", "bold");
      pdf.text("Next Steps:", ML + 3, lineY);
      pdf.setFont("helvetica", "normal");
    } else {
      pdf.text(line, ML + 3, lineY);
    }
    lineY += guideLineH;
  });

  p6y += guidanceBoxH + 4;

  // ─ Disclaimer
  setFill(pdf, 254, 242, 242);
  setDraw(pdf, 220, 38, 38);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(ML, p6y, CW, 24, 1.5, 1.5, "FD");

  setTxt(pdf, 127, 29, 29);
  setFill(pdf, 220, 38, 38);
  pdf.roundedRect(ML, p6y, CW, 6.5, 1.5, 1.5, "F");
  pdf.rect(ML, p6y + 3.5, CW, 3, "F");
  setTxt(pdf, 255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.8);
  pdf.text("DISCLAIMER", ML + CW / 2, p6y + 4.8, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.8);
  setTxt(pdf, 127, 29, 29);
  const discLines = pdf.splitTextToSize(DISCLAIMER, CW - 6);
  discLines.slice(0, 6).forEach((line: string, li: number) => {
    pdf.text(line, ML + 3, p6y + 11.5 + li * 3.4);
  });

  // Dynamic footer numbering based on actual page count
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    addPageFooter(pdf, p, totalPages, PW);
  }

  if (options?.returnBlob) return pdf.output("blob");
  pdf.save(`CareerDNA_Capability_Report_${(studentName || "Student").replace(/\s+/g, "_")}.pdf`);
}
