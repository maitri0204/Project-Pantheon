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
  otherSectionScores?: Record<string, SectionData>;
};

const TRAIT_KEYS = ["VR", "NR", "SR", "MP", "LR", "NA", "VA", "MA", "CI"] as const;
type TraitKey = (typeof TRAIT_KEYS)[number];
type TraitScores = Record<TraitKey, number>;

type CareerDbRow = { career: string; cluster: string; description: string; proposedStream: string; required: TraitScores };
type CareerResult = {
  rank: number; career: string; cluster: string; description: string; proposedStream: string;
  capabilityScore: number; band: BandEntry;
  gaps: Record<TraitKey, number>; flag: string;
  fitCount: number;
  majorGapCount: number;
  totalGapDeficit: number;
};
type BandEntry = {
  label: string;
  color: [number, number, number];
  lightColor: [number, number, number];
};

type SectionPart = {
  partName?: string;
  percentage?: number;
};

type SectionData = {
  score?: number;
  maxScore?: number;
  parts?: SectionPart[];
  [key: string]: unknown;
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

const COGNITIVE_CONCEPT_LINES: string[] = [
  "Cognitive ability explains how you understand, process, and apply information.",
  "It helps identify your current learning strengths and where focused effort can improve performance.",
  "• Verbal Reasoning: language comprehension, interpretation, and communication.",
  "• Numerical Reasoning: working with numbers, patterns, and quantitative logic.",
  "• Spatial Reasoning: visualizing objects, layouts, and structures.",
  "• Memory & Processing Speed: learning speed, recall, and information handling efficiency.",
];

const APTITUDE_CONCEPT_LINES: string[] = [
  "Aptitude indicates natural readiness for specific task types and work styles.",
  "It does not guarantee success, but shows where your current capability alignment is stronger.",
  "• Logical & Analytical: pattern recognition and step-wise reasoning.",
  "• Numerical Aptitude: practical application of mathematics in real tasks.",
  "• Verbal Aptitude: idea expression and language-based working capability.",
  "• Mechanical Aptitude: systems, tools, movement, and practical mechanics.",
  "• Creativity & Innovation: idea generation and non-linear problem solving.",
];

const CAREER_MATCH_CONCEPT_LINES: string[] = [
  "Career matches are generated by comparing your cognitive and aptitude profile with role requirements.",
  "A higher score indicates stronger current capability alignment, not guaranteed success.",
  "Capability Band Guide:",
  "• Strong Capability Alignment",
  "• High Capability Potential",
  "• Moderate Capability Match",
  "• Conditional Capability Match",
  "• Low Capability Alignment",
];

const GAP_ANALYSIS_CONCEPT_LINES: string[] = [
  "Gap analysis compares your current scores with career requirements.",
  "A gap does not mean you cannot pursue a career. It indicates where targeted development helps.",
  "Use this section to identify strengths, improvement priorities, and action planning areas.",
];

const LEARNING_STYLE_CONCEPT_LINES: string[] = [
  "Learning style shows how you may absorb and understand information more comfortably.",
  "Visual learners often prefer diagrams, auditory learners prefer listening, and kinesthetic learners prefer hands-on practice.",
  "This is not a measure of intelligence; it is a guide for better study strategy and environment fit.",
];

const STRESS_RESILIENCE_CONCEPT_LINES: string[] = [
  "Stress & resilience reflects how you respond to pressure, uncertainty, and setbacks.",
  "It helps identify coping strengths and areas where emotional skills can be developed.",
  "This section is for support planning, not judgment.",
];

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

function summarizeCareerFit(gaps: Record<TraitKey, number>): { fitCount: number; majorGapCount: number; totalGapDeficit: number } {
  const values = Object.values(gaps);
  return {
    fitCount: values.filter((value) => value >= 0).length,
    majorGapCount: values.filter((value) => value < -20).length,
    totalGapDeficit: values.filter((value) => value < 0).reduce((sum, value) => sum + Math.abs(value), 0),
  };
}

function buildCareerRecommendations(traitScores: TraitScores, careerDb: CareerDbRow[], limit = 10): CareerResult[] {
  const ranked = careerDb
    .map((row) => {
      const capabilityScore = computeCapabilityScore(traitScores, row.required);
      const gaps = computeGaps(traitScores, row.required);
      const fit = summarizeCareerFit(gaps);
      return {
        rank: 0,
        career: row.career,
        cluster: row.cluster,
        description: row.description || "",
        proposedStream: row.proposedStream || "",
        capabilityScore,
        band: getBand(capabilityScore),
        gaps,
        flag: getFlag(capabilityScore, gaps),
        fitCount: fit.fitCount,
        majorGapCount: fit.majorGapCount,
        totalGapDeficit: fit.totalGapDeficit,
      } as CareerResult;
    })
    .sort((a, b) => {
      const bandWeight = (band: string) => (band === "Strong Capability Alignment" ? 3 : band === "High Capability Potential" ? 2 : band === "Moderate Capability Match" ? 1 : 0);
      return (
        bandWeight(b.band.label) - bandWeight(a.band.label) ||
        b.capabilityScore - a.capabilityScore ||
        b.fitCount - a.fitCount ||
        a.majorGapCount - b.majorGapCount ||
        a.totalGapDeficit - b.totalGapDeficit ||
        a.career.localeCompare(b.career)
      );
    });

  const strongMatches = ranked.filter((career) => career.band.label === "Strong Capability Alignment" || career.band.label === "High Capability Potential");
  const suitableMatches = strongMatches.filter((career) => career.capabilityScore >= 75 && career.majorGapCount === 0 && career.fitCount >= 7);
  const secondaryMatches = strongMatches.filter((career) => career.capabilityScore >= 70 && career.majorGapCount <= 1 && career.fitCount >= 6);

  const preferredSet = suitableMatches.length >= 4
    ? suitableMatches
    : secondaryMatches.length >= 4
      ? secondaryMatches
      : strongMatches;

  const chosen = (preferredSet.length ? preferredSet : ranked).slice(0, limit);
  return chosen.map((career, index) => ({ ...career, rank: index + 1 }));
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

function drawConceptPanel(
  pdf: any,
  x: number,
  y: number,
  w: number,
  title: string,
  lines: string[],
  color: [number, number, number],
  options?: { icon?: string; compact?: boolean }
): number {
  const icon = options?.icon || "i";
  const compact = Boolean(options?.compact);
  const contentW = w - 6;
  const wrapped: string[] = [];

  lines.forEach((line) => {
    const txt = String(line || "").trim();
    if (!txt) return;
    const chunks = pdf.splitTextToSize(txt, contentW) as string[];
    chunks.forEach((c: string) => wrapped.push(c));
  });

  const lineH = compact ? 3.6 : 4;
  const bodyH = Math.max(16, wrapped.length * lineH + 6.5);
  const totalH = bodyH + 7;
  const [cr, cg, cb] = color;

  setFill(pdf, 255, 255, 255);
  setDraw(pdf, 203, 213, 225);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(x, y, w, totalH, 1.8, 1.8, "FD");

  setFill(pdf, cr, cg, cb);
  pdf.roundedRect(x, y, w, 7, 1.8, 1.8, "F");
  pdf.rect(x, y + 3.5, w, 3.5, "F");

  setTxt(pdf, 255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.text(`${icon}  ${title}`, x + 3, y + 4.8);

  setTxt(pdf, 30, 41, 59);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(compact ? 7.8 : 8.2);
  wrapped.forEach((line, i) => {
    pdf.text(line, x + 3, y + 10.8 + i * lineH);
  });

  return totalH;
}

function drawArcGauge(
  pdf: any,
  cx: number,
  cy: number,
  outerR: number,
  score: number,
  maxScore: number,
  color: [number, number, number],
  label: string
) {
  const safeMax = Math.max(1, maxScore);
  const pct = Math.max(0, Math.min(1, score / safeMax));
  const displayPct = Math.round(pct * 100);
  const [cr, cg, cb] = color;
  const innerR = outerR * 0.56;
  const startA = -Math.PI / 2;
  const n = 64;

  // Gray background full disk
  setFill(pdf, 226, 232, 240);
  pdf.circle(cx, cy, outerR, "F");
  // White inner hole
  setFill(pdf, 255, 255, 255);
  pdf.circle(cx, cy, innerR, "F");

  // Colored arc sector (pie wedge)
  if (pct > 0.005) {
    const endA = startA + 2 * Math.PI * pct;
    setFill(pdf, cr, cg, cb);
    const pts: [number, number][] = [[cx, cy]];
    for (let i = 0; i <= n; i++) {
      const a = startA + (endA - startA) * (i / n);
      pts.push([cx + outerR * Math.cos(a), cy + outerR * Math.sin(a)]);
    }
    const segs: [number, number][] = [];
    for (let i = 1; i < pts.length; i++) {
      segs.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
    }
    pdf.lines(segs, pts[0][0], pts[0][1], [1, 1], "F", true);
    // Re-draw inner white hole to create donut ring effect
    setFill(pdf, 255, 255, 255);
    pdf.circle(cx, cy, innerR, "F");
  }

  // Score text in center
  setTxt(pdf, cr, cg, cb);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.text(`${displayPct}%`, cx, cy + 0.6, { align: "center" });
  setTxt(pdf, 71, 85, 105);
  pdf.setFontSize(5.8);
  pdf.text(`${Math.round(score)}/${Math.round(safeMax)}`, cx, cy + 4.5, { align: "center" });

  // Label below
  setTxt(pdf, 71, 85, 105);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text(label, cx, cy + outerR + 5, { align: "center" });
}

function drawSplitConceptResultCard(
  pdf: any,
  x: number,
  y: number,
  w: number,
  title: string,
  lines: string[],
  color: [number, number, number],
  renderResult: (x: number, y: number, w: number, h: number) => void
): number {
  const [cr, cg, cb] = color;
  const headH = 7;
  const resultW = w * 0.3;
  const contentW = w - resultW;

  const wrapped: string[] = [];
  lines.forEach((line) => {
    const text = String(line || "").trim();
    if (!text) return;
    const chunks = pdf.splitTextToSize(text, contentW - 6) as string[];
    chunks.forEach((chunk: string) => wrapped.push(chunk));
  });

  const lineH = 3.7;
  const bodyH = Math.max(42, wrapped.length * lineH + 7);
  const totalH = headH + bodyH;

  setFill(pdf, 255, 255, 255);
  setDraw(pdf, 203, 213, 225);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(x, y, w, totalH, 1.8, 1.8, "FD");

  setFill(pdf, cr, cg, cb);
  pdf.roundedRect(x, y, w, headH, 1.8, 1.8, "F");
  pdf.rect(x, y + headH / 2, w, headH / 2, "F");

  setTxt(pdf, 255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.6);
  pdf.text(title, x + 3, y + 4.9);

  const bodyY = y + headH;
  setFill(pdf, 248, 250, 252);
  pdf.rect(x, bodyY, resultW, bodyH, "F");
  setDraw(pdf, 203, 213, 225);
  pdf.setLineWidth(0.25);
  pdf.line(x + resultW, bodyY, x + resultW, bodyY + bodyH);

  renderResult(x + 1, bodyY + 1, resultW - 2, bodyH - 2);

  setTxt(pdf, 30, 41, 59);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.2);
  wrapped.forEach((line, idx) => {
    pdf.text(line, x + resultW + 3, bodyY + 4.8 + idx * lineH);
  });

  return totalH;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE-BASED CAREER DNA RENDERER (Career DNA.pdf)
// ─────────────────────────────────────────────────────────────────────────────

const CAREER_DNA_TEMPLATE_URL = "/Career DNA.pdf";
const PT_PER_MM = 72 / 25.4;

const COGNITIVE_PAGE_MAP: Array<{ page: number; key: TraitKey; label: string; color: string }> = [
  { page: 7, key: "VR", label: "Verbal Reasoning", color: "#3B82F6" },
  { page: 8, key: "NR", label: "Numerical Reasoning", color: "#2563EB" },
  { page: 9, key: "SR", label: "Spatial Reasoning", color: "#0EA5E9" },
  { page: 10, key: "MP", label: "Memory & Processing", color: "#0284C7" },
];

const APTITUDE_PAGE_MAP: Array<{ page: number; key: TraitKey; label: string; color: string }> = [
  { page: 13, key: "LR", label: "Logical & Analytical", color: "#14B8A6" },
  { page: 14, key: "NA", label: "Numerical Aptitude", color: "#0D9488" },
  { page: 15, key: "VA", label: "Verbal Aptitude", color: "#0891B2" },
  { page: 16, key: "MA", label: "Mechanical Aptitude", color: "#0284C7" },
  { page: 17, key: "CI", label: "Creativity & Innovation", color: "#6366F1" },
];

const tplAbsoluteUrl = (value?: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^data:image\//i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${raw.startsWith("/") ? "" : "/"}${raw}`;
  }
  return raw;
};

const tplNormalizeWebsite = (value?: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

const tplFirstLastName = (value?: string): string => {
  const cleaned = String(value || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "—";
  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length <= 2) return parts.join(" ");
  return `${parts[0]} ${parts[parts.length - 1]}`;
};

const tplClamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const tplToNumber = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const tplPct = (score: number, maxScore: number): number => {
  if (!maxScore) return 0;
  return tplClamp(Math.round((score / maxScore) * 100), 0, 100);
};
const tplMmToPt = (mm: number): number => mm * PT_PER_MM;

function tplShortLabel(label: string): string {
  const clean = String(label || "").trim();
  if (!clean) return "Part";
  if (clean.length <= 15) return clean;
  return `${clean.slice(0, 14)}…`;
}

function tplWrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const raw = String(text || "").trim();
  if (!raw) return [];
  const words = raw.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !current) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function tplCreateDonutDataUrl(args: {
  score: number;
  maxScore: number;
  title: string;
  colorHex: string;
}): string {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 460;
  canvas.height = 460;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const score = Math.max(0, tplToNumber(args.score));
  const maxScore = Math.max(1, tplToNumber(args.maxScore, 1));
  const pct = tplClamp(score / maxScore, 0, 1);
  const pctLabel = Math.round(pct * 100);

  const cx = 230;
  const cy = 190;
  const radius = 126;
  const thickness = 30;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = args.colorHex;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 42px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${pctLabel}%`, cx, cy - 2);

  ctx.fillStyle = "#64748B";
  ctx.font = "600 23px Arial";
  ctx.fillText(`${Math.round(score)} / ${Math.round(maxScore)}`, cx, cy + 34);

  ctx.fillStyle = "#334155";
  ctx.font = "700 21px Arial";
  const titleLines = tplWrapCanvasText(ctx, args.title, 300).slice(0, 2);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, cx, 382 + index * 24);
  });

  return canvas.toDataURL("image/png");
}

function tplCreateBarChartDataUrl(args: {
  title: string;
  bars: Array<{ label: string; percentage: number }>;
  colorHex: string;
}): string {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 660;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bars = args.bars.slice(0, 8);
  const chartLeft = 88;
  const chartTop = 54;
  const chartWidth = canvas.width - 170;
  const chartHeight = 470;
  const chartBottom = chartTop + chartHeight;

  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(chartLeft, chartTop);
  ctx.lineTo(chartLeft, chartBottom);
  ctx.lineTo(chartLeft + chartWidth, chartBottom);
  ctx.stroke();

  [0, 25, 50, 75, 100].forEach((tick) => {
    const y = chartBottom - (tick / 100) * chartHeight;
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartLeft, y);
    ctx.lineTo(chartLeft + chartWidth, y);
    ctx.stroke();

    ctx.fillStyle = "#64748B";
    ctx.font = "600 17px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`${tick}%`, chartLeft - 10, y + 5);
  });

  const gap = 26;
  const barWidth = (chartWidth - gap * (bars.length + 1)) / Math.max(1, bars.length);

  bars.forEach((bar, index) => {
    const value = tplClamp(tplToNumber(bar.percentage), 0, 100);
    const h = (value / 100) * chartHeight;
    const x = chartLeft + gap + index * (barWidth + gap);
    const y = chartBottom - h;

    ctx.fillStyle = args.colorHex;
    ctx.fillRect(x, y, barWidth, h);

    ctx.fillStyle = "#0F172A";
    ctx.font = "700 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(value)}%`, x + barWidth / 2, y - 12);

    ctx.fillStyle = "#334155";
    ctx.font = "600 15px Arial";
    const wrapped = tplWrapCanvasText(ctx, bar.label, barWidth + 20).slice(0, 2);
    wrapped.forEach((line, lineIndex) => {
      ctx.fillText(line, x + barWidth / 2, chartBottom + 30 + lineIndex * 17);
    });
  });

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 26px Arial";
  ctx.textAlign = "left";
  ctx.fillText(args.title, chartLeft, 42);

  return canvas.toDataURL("image/png");
}

async function tplEmbedDataUrlImage(pdfDoc: any, dataUrl: string): Promise<any | null> {
  if (!dataUrl) return null;
  try {
    const bytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
    try {
      return await pdfDoc.embedPng(bytes);
    } catch (errEmbedPng) {
      try {
        // eslint-disable-next-line no-console
        console.warn("tplEmbedDataUrlImage: embedPng failed, trying embedJpg", errEmbedPng, dataUrl);
        return await pdfDoc.embedJpg(bytes);
      } catch (errEmbedJpg) {
        // eslint-disable-next-line no-console
        console.error("tplEmbedDataUrlImage: failed to embed image as PNG or JPG", errEmbedPng, errEmbedJpg, dataUrl);
        return null;
      }
    }
  } catch (errFetch) {
    // eslint-disable-next-line no-console
    console.warn("tplEmbedDataUrlImage: failed to fetch dataUrl", errFetch, dataUrl);
    return null;
  }
}

function tplSection(otherSectionScores: CapabilityReportInput["otherSectionScores"], key: string): SectionData {
  return otherSectionScores?.[key] || {};
}

function tplSectionBars(section: SectionData): Array<{ label: string; percentage: number }> {
  const parts = Array.isArray(section?.parts) ? section.parts : [];
  if (parts.length === 0) {
    const score = tplToNumber(section?.score);
    const maxScore = Math.max(1, tplToNumber(section?.maxScore, 100));
    return [{ label: "Overall", percentage: tplPct(score, maxScore) }];
  }
  return parts.map((part: SectionPart, i: number) => ({
    label: String(part?.partName || `Part ${i + 1}`),
    percentage: tplClamp(tplToNumber(part?.percentage), 0, 100),
  }));
}

function tplDrawImageInA4Coords(
  page: any,
  img: any,
  pageWidthPt: number,
  pageHeightPt: number,
  a4X: number,
  a4Top: number,
  a4W: number,
  a4H: number,
) {
  const pageWmm = pageWidthPt / PT_PER_MM;
  const pageHmm = pageHeightPt / PT_PER_MM;
  const sx = pageWmm / 210;
  const sy = pageHmm / 297;

  const boxX = tplMmToPt(a4X * sx);
  const boxW = tplMmToPt(a4W * sx);
  const boxH = tplMmToPt(a4H * sy);
  const boxY = pageHeightPt - tplMmToPt((a4Top + a4H) * sy);

  const imgRatio = img.width / img.height;
  const boxRatio = boxW / boxH;
  let drawW = boxW;
  let drawH = boxH;
  if (imgRatio > boxRatio) {
    drawH = boxW / imgRatio;
  } else {
    drawW = boxH * imgRatio;
  }
  const x = boxX + (boxW - drawW) / 2;
  const y = boxY + (boxH - drawH) / 2;

  page.drawImage(img, { x, y, width: drawW, height: drawH });
}

async function tryGenerateCareerDnaFromTemplate(
  args: CapabilityReportInput,
  options?: { returnBlob?: boolean }
): Promise<Blob | undefined> {
  if (typeof window === "undefined") return undefined;

  const { PDFDocument, StandardFonts, rgb } = (await import("pdf-lib")) as any;
  const response = await fetch(`${window.location.origin}${CAREER_DNA_TEMPLATE_URL}`);
  if (!response.ok) return undefined;

  const templateBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  if (!pages.length) return undefined;

  const careerDb = await loadCareerDb();
  const recommendations = buildCareerRecommendations(args.traitScores, careerDb, 10);

  // Branding on page 1 + last page
  let embeddedLogo: any;
  const logoUrl = tplAbsoluteUrl(args.organizationBranding?.logoUrl);
    if (logoUrl) {
    try {
      const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
      try {
        embeddedLogo = await pdfDoc.embedPng(logoBytes);
      } catch (errEmbedPng) {
        try {
          // eslint-disable-next-line no-console
          console.warn("tryGenerateCareerDnaFromTemplate: embedPng failed, trying embedJpg", errEmbedPng, logoUrl);
          embeddedLogo = await pdfDoc.embedJpg(logoBytes);
        } catch (errEmbedJpg) {
          // eslint-disable-next-line no-console
          console.error("tryGenerateCareerDnaFromTemplate: failed to embed logo as PNG or JPG", errEmbedPng, errEmbedJpg, logoUrl);
          embeddedLogo = undefined;
        }
      }
    } catch (errFetch) {
      // eslint-disable-next-line no-console
      console.warn("tryGenerateCareerDnaFromTemplate: failed to fetch logo", errFetch, logoUrl);
      embeddedLogo = undefined;
    }
  }

  const drawBranding = (pageIndex: number, includeFooterContact: boolean) => {
    if (!pages[pageIndex]) return;
    const page = pages[pageIndex];
    const { width, height } = page.getSize();
    const pageWmm = width / PT_PER_MM;
    const pageHmm = height / PT_PER_MM;
    const sx = pageWmm / 210;
    const sy = pageHmm / 297;

    const X = (mm: number) => tplMmToPt(mm * sx);
    const Y = (mmFromTop: number) => height - tplMmToPt(mmFromTop * sy);
    const W = (mm: number) => tplMmToPt(mm * sx);
    const H = (mm: number) => tplMmToPt(mm * sy);

    const interpretedBy = tplFirstLastName(args.organizationBranding?.representativeName);
    const website = tplNormalizeWebsite(args.organizationBranding?.website) || "—";
    const logoArea = includeFooterContact
      ? { x: 55, top: 150, w: 98, h: 44 }
      : { x: 110, top: 8, w: 80, h: 28 };

    if (embeddedLogo) {
      const dims = embeddedLogo.scale(1);
      const ratio = dims.width / dims.height;
      const maxW = W(logoArea.w - 2);
      const maxH = H(logoArea.h - 2);
      let drawW = maxW;
      let drawH = drawW / ratio;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * ratio;
      }
      const areaX = X(logoArea.x);
      const areaY = Y(logoArea.top + logoArea.h);
      page.drawImage(embeddedLogo, {
        x: areaX + (W(logoArea.w) - drawW) / 2,
        y: areaY + (H(logoArea.h) - drawH) / 2,
        width: drawW,
        height: drawH,
      });
    }

    const webSize = 9;
    const webWidthPt = regularFont.widthOfTextAtSize(website, webSize);
    page.drawText(website, {
      x: (width - webWidthPt) / 2,
      y: Y(287.5),
      size: webSize,
      font: regularFont,
      color: rgb(0.12, 0.16, 0.2),
    });

    if (!includeFooterContact) {
      page.drawText(interpretedBy, {
        x: X(18),
        y: Y(255),
        size: 10,
        font: regularFont,
        color: rgb(1, 1, 1),
      });
      return;
    }

    page.drawText(`Phone: ${args.organizationBranding?.contactPhone || "—"}`, {
      x: X(30),
      y: Y(271),
      size: 9,
      font: regularFont,
      color: rgb(0.12, 0.16, 0.2),
    });
    page.drawText(`Email: ${args.organizationBranding?.contactEmail || "—"}`, {
      x: X(104),
      y: Y(271),
      size: 9,
      font: regularFont,
      color: rgb(0.12, 0.16, 0.2),
    });
  };

  drawBranding(0, false);
  drawBranding(pages.length - 1, true);

  const cognitiveSection = tplSection(args.otherSectionScores, "COGNITIVE");
  const aptitudeSection = tplSection(args.otherSectionScores, "APTITUDE");
  const eiSection = tplSection(args.otherSectionScores, "EMOTIONAL_INTELLIGENCE");
  const bsSection = tplSection(args.otherSectionScores, "BEHAVIORAL_SOCIAL");
  const srSection = tplSection(args.otherSectionScores, "STRESS_RESILIENCE");

  const cognitiveOverallImg = await tplEmbedDataUrlImage(
    pdfDoc,
    tplCreateDonutDataUrl({
      score: tplToNumber(cognitiveSection?.score),
      maxScore: Math.max(1, tplToNumber(cognitiveSection?.maxScore, 40)),
      title: "Cognitive Overall",
      colorHex: "#2563EB",
    })
  );
  if (cognitiveOverallImg && pages[5]) {
    const size = pages[5].getSize();
    tplDrawImageInA4Coords(pages[5], cognitiveOverallImg, size.width, size.height, 7, 74, 72, 72);
  }

  for (const item of COGNITIVE_PAGE_MAP) {
    const img = await tplEmbedDataUrlImage(
      pdfDoc,
      tplCreateDonutDataUrl({
        score: tplToNumber(args.traitScores[item.key]),
        maxScore: 100,
        title: item.label,
        colorHex: item.color,
      })
    );
    const page = pages[item.page - 1];
    if (!img || !page) continue;
    const size = page.getSize();
    tplDrawImageInA4Coords(page, img, size.width, size.height, 7, 74, 72, 72);
  }

  const aptitudeOverallImg = await tplEmbedDataUrlImage(
    pdfDoc,
    tplCreateDonutDataUrl({
      score: tplToNumber(aptitudeSection?.score),
      maxScore: Math.max(1, tplToNumber(aptitudeSection?.maxScore, 50)),
      title: "Aptitude Overall",
      colorHex: "#0D9488",
    })
  );
  if (aptitudeOverallImg && pages[11]) {
    const size = pages[11].getSize();
    tplDrawImageInA4Coords(pages[11], aptitudeOverallImg, size.width, size.height, 7, 74, 72, 72);
  }

  for (const item of APTITUDE_PAGE_MAP) {
    const img = await tplEmbedDataUrlImage(
      pdfDoc,
      tplCreateDonutDataUrl({
        score: tplToNumber(args.traitScores[item.key]),
        maxScore: 100,
        title: item.label,
        colorHex: item.color,
      })
    );
    const page = pages[item.page - 1];
    if (!img || !page) continue;
    const size = page.getSize();
    tplDrawImageInA4Coords(page, img, size.width, size.height, 7, 74, 72, 72);
  }

  const barTargets: Array<{ page: number; title: string; section: any; colorHex: string }> = [
    { page: 19, title: "Emotional Intelligence", section: eiSection, colorHex: "#22C55E" },
    { page: 21, title: "Behavioral & Social", section: bsSection, colorHex: "#F97316" },
    { page: 23, title: "Stress & Resilience", section: srSection, colorHex: "#EF4444" },
  ];

  for (const target of barTargets) {
    const chartImg = await tplEmbedDataUrlImage(
      pdfDoc,
      tplCreateBarChartDataUrl({
        title: `${target.title} - Section Bars`,
        bars: tplSectionBars(target.section),
        colorHex: target.colorHex,
      })
    );
    const page = pages[target.page - 1];
    if (!page || !chartImg) continue;
    const size = page.getSize();
    const chartY = target.page === 23 ? 33 : 41;
    tplDrawImageInA4Coords(page, chartImg, size.width, size.height, 22, chartY, 168, 112);
  }

  if (recommendations.length) {
    const insertIndex = Math.max(0, pdfDoc.getPageCount() - 1);
    const careersPage = pdfDoc.insertPage(insertIndex, [pages[0].getWidth(), pages[0].getHeight()]);
    const { width, height } = careersPage.getSize();
    const mm = (value: number) => value * PT_PER_MM;
    const pageLeft = mm(10);
    const pageWidth = width - mm(20);
    const pageHeight = height - mm(24);

    // Elegant blue gradient background
    careersPage.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.97, 0.98, 1) });
    
    // Blue header with gradient effect (taller to fit lines)
    careersPage.drawRectangle({ x: pageLeft, y: height - mm(26), width: pageWidth, height: mm(18), color: rgb(15 / 255, 76 / 255, 168 / 255) });
    careersPage.drawRectangle({ x: pageLeft, y: height - mm(26), width: pageWidth, height: mm(1.5), color: rgb(59 / 255, 130 / 255, 246 / 255) });
    
    careersPage.drawText("Suggested Career Matches", {
      x: pageLeft + mm(3),
      y: height - mm(13.5),
      size: 17,
      font: regularFont,
      color: rgb(1, 1, 1),
    });
    careersPage.drawText("Only high-confidence matches from the Career DNA Excel sheet are shown here.", {
      x: pageLeft + mm(3),
      y: height - mm(20.0),
      size: 8.5,
      font: regularFont,
      color: rgb(0.93, 0.94, 1),
    });
    careersPage.drawText("Logic: strong/high capability alignment, at least 7 matching traits, and no major capability gaps.", {
      x: pageLeft + mm(3),
      y: height - mm(24.0),
      size: 8,
      font: regularFont,
      color: rgb(0.93, 0.94, 1),
    });

    const cols = 2;
    const gapX = mm(4);
    const gapY = mm(3.6);
    const cardW = (pageWidth - gapX) / cols;
    const cardH = mm(31);
    const startY = height - mm(36.0);
    const startX = pageLeft;

    recommendations.slice(0, 10).forEach((career, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardW + gapX);
      const yTop = startY - row * (cardH + gapY);
      const y = yTop - cardH;
      if (y < mm(14)) return;

      // Elegant white card
      careersPage.drawRectangle({ x, y, width: cardW, height: cardH, color: rgb(1, 1, 1), borderColor: rgb(219 / 255, 234 / 255, 254 / 255), borderWidth: 1.2 });
      
      // Blue top bar
      careersPage.drawRectangle({ x, y: y + cardH - mm(2.2), width: cardW, height: mm(2.2), color: rgb(15 / 255, 76 / 255, 168 / 255) });
      
      // Highlight
      careersPage.drawRectangle({ x, y: y + cardH - mm(0.5), width: cardW, height: mm(0.5), color: rgb(59 / 255, 130 / 255, 246 / 255) });

      // Rank badge - smaller
      const rankBadgeX = x + mm(2.4);
      const rankBadgeY = y + cardH - mm(5.0);
      careersPage.drawRectangle({ x: rankBadgeX - mm(1.4), y: rankBadgeY - mm(1.4), width: mm(5.6), height: mm(5.6), color: rgb(59 / 255, 130 / 255, 246 / 255) });
      careersPage.drawText(String(career.rank), {
        x: rankBadgeX - mm(1.1),
        y: rankBadgeY - mm(0.5),
        size: 11,
        font: regularFont,
        color: rgb(1, 1, 1),
      });

      // Career title - better aligned with badge
      careersPage.drawText(career.career, {
        x: x + mm(9.2),
        y: y + cardH - mm(5.2),
        size: 9.5,
        font: regularFont,
        color: rgb(15 / 255, 23 / 255, 42 / 255),
      });

      const stream = career.proposedStream || career.cluster || "—";
      
      // Stream and Cluster chips: increase box height so content fits comfortably
      const chipLineY = y + cardH - mm(15.0);
      const chipW = (cardW - mm(4.0)) / 2;

      // Stream chip (taller)
      careersPage.drawRectangle({ x: x + mm(2.8), y: chipLineY, width: chipW, height: mm(7.0), color: rgb(229 / 255, 242 / 255, 255 / 255), borderColor: rgb(147 / 255, 197 / 255, 253 / 255), borderWidth: 0.7 });
      careersPage.drawText("Stream", { x: x + mm(3.2), y: chipLineY + mm(4.4), size: 5.2, font: regularFont, color: rgb(30 / 255, 58 / 255, 138 / 255) });
      careersPage.drawText(stream, { x: x + mm(3.2), y: chipLineY + mm(1.2), size: 7.2, font: regularFont, color: rgb(15 / 255, 76 / 255, 168 / 255) });

      // Cluster chip (taller)
      const clusterX = x + mm(2.8) + chipW + mm(1.2);
      careersPage.drawRectangle({ x: clusterX, y: chipLineY, width: chipW, height: mm(7.0), color: rgb(219 / 255, 234 / 255, 254 / 255), borderColor: rgb(96 / 255, 165 / 255, 250 / 255), borderWidth: 0.7 });
      careersPage.drawText("Cluster", { x: clusterX + mm(0.4), y: chipLineY + mm(4.4), size: 5.2, font: regularFont, color: rgb(30 / 255, 58 / 255, 138 / 255) });
      careersPage.drawText(career.cluster || "—", { x: clusterX + mm(0.4), y: chipLineY + mm(1.2), size: 7.2, font: regularFont, color: rgb(15 / 255, 76 / 255, 168 / 255) });

      // Traits progress bar at bottom - closer to chips
      const barY = y + mm(5.0);
      const barWidth = cardW - mm(5.6);
      
      // Label
      careersPage.drawText(`Traits:`, {
        x: x + mm(2.8),
        y: barY + mm(1.6),
        size: 6.5,
        font: regularFont,
        color: rgb(71 / 255, 85 / 255, 105 / 255),
      });
      
      // Count badge
      careersPage.drawText(`${career.fitCount}/9`, {
        x: x + mm(cardW - 7.2),
        y: barY + mm(1.6),
        size: 6.5,
        font: regularFont,
        color: rgb(59 / 255, 130 / 255, 246 / 255),
      });
      
      // Progress bar
      const barHeight = mm(1.4);
      careersPage.drawRectangle({ x: x + mm(2.8), y: barY - mm(1.2), width: barWidth, height: barHeight, color: rgb(241 / 255, 245 / 255, 250 / 255), borderColor: rgb(219 / 255, 234 / 255, 254 / 255), borderWidth: 0.5 });
      
      // Progress fill
      const fillWidth = (career.fitCount / 9) * barWidth;
      careersPage.drawRectangle({ x: x + mm(2.8), y: barY - mm(1.2), width: fillWidth, height: barHeight, color: rgb(59 / 255, 130 / 255, 246 / 255) });
    });

    // Page number intentionally omitted for this generated careers page
  }

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
  if (options?.returnBlob) return blob;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (args.studentName || "Student").replace(/[^a-zA-Z0-9]/g, "_");
  a.download = `CareerDNA_Report_${safeName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);

  return blob;
}

export async function generateCareerDnaCapabilityReport(
  args: CapabilityReportInput,
  options?: { returnBlob?: boolean }
): Promise<void | Blob> {
  // New template-based report (requested layout with fixed page coordinates)
  // If template rendering succeeds we return immediately.
  const templateBlob = await tryGenerateCareerDnaFromTemplate(args, options);
  if (templateBlob) return templateBlob;

  const { traitScores, studentName, classGrade, schoolName, submittedAt, otherSectionScores } = args;

  const allPresent = TRAIT_KEYS.every((k) => typeof traitScores[k] === "number" && !Number.isNaN(traitScores[k]));
  if (!allPresent) throw new Error("Incomplete – all 9 trait scores required.");

  const careerDb = await loadCareerDb();
  const top10 = buildCareerRecommendations(traitScores, careerDb, 10);

  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

  const PW = 210;
  const ML = 8;
  const CW = PW - ML * 2;
  let pageNum = 0;

  setFill(pdf, 248, 250, 252);
  pdf.rect(0, 0, PW, 297, "F");
  addPageHeader(pdf, "Career DNA Capability Profile", PW);
  setTxt(pdf, 30, 41, 59);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);
  pdf.text("CAREER DNA", ML + 2, 30);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  pdf.text("Capability Profile Report", ML + 2, 37);
  setFill(pdf, 255, 255, 255);
  setDraw(pdf, 203, 213, 225);
  pdf.roundedRect(ML, 44, CW, 27, 1.5, 1.5, "FD");
  setTxt(pdf, 15, 23, 42);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.text(studentName || "Student", ML + 3, 51.5);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.text(`Grade: ${classGrade || "—"}`, ML + 3, 57.5);
  pdf.text(`School: ${schoolName || "—"}`, ML + 3, 63);
  pdf.text(`Date: ${submittedAt || "—"}`, ML + 3, 68.5);
  pageNum++;

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 2+: Full Concept Notes with strict 30/70 split (30% Results | 70% Content)
  // ════════════════════════════════════════════════════════════════════════════

  const cognitiveRows: Array<{ key: TraitKey; label: string }> = [
    { key: "VR", label: "Verbal Reasoning" },
    { key: "NR", label: "Numerical Reasoning" },
    { key: "SR", label: "Spatial Reasoning" },
    { key: "MP", label: "Memory & Processing Speed" },
  ];
  const aptitudeRows: Array<{ key: TraitKey; label: string }> = [
    { key: "LR", label: "Logical & Analytical Reasoning" },
    { key: "NA", label: "Numerical Aptitude" },
    { key: "VA", label: "Verbal Aptitude" },
    { key: "MA", label: "Mechanical Aptitude" },
    { key: "CI", label: "Creativity & Innovation" },
  ];

  const cognitiveSection = (otherSectionScores?.COGNITIVE || {}) as any;
  const aptitudeSection = (otherSectionScores?.APTITUDE || {}) as any;
  const learningSection = (otherSectionScores?.LEARNING_STYLE || {}) as any;
  const stressSection = (otherSectionScores?.STRESS_RESILIENCE || {}) as any;

  const getSectionPct = (section: any, fallbackMax: number): number => {
    const score = Number(section?.score ?? section?.totalScore ?? 0);
    const max = Number(section?.maxScore ?? fallbackMax);
    return max > 0 ? Math.round((score / max) * 100) : 0;
  };

  const cognitivePct = getSectionPct(cognitiveSection, 40);
  const aptitudePct = getSectionPct(aptitudeSection, 50);

  const topStrengths = [...TRAIT_KEYS]
    .sort((a, b) => traitScores[b] - traitScores[a])
    .slice(0, 3);

  const gapAgg = new Map<TraitKey, number[]>();
  top10.slice(0, 5).forEach((career) => {
    TRAIT_KEYS.forEach((k) => {
      if (career.gaps[k] < 0) {
        if (!gapAgg.has(k)) gapAgg.set(k, []);
        gapAgg.get(k)!.push(career.gaps[k]);
      }
    });
  });
  const developmentTraits = Array.from(gapAgg.entries())
    .map(([k, gaps]) => ({ key: k, avg: Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3);

  const conceptNotes: Array<{
    title: string;
    color: [number, number, number];
    lines: string[];
    resultType:
      | "overall"
      | "cognitive_overview"
      | "trait"
      | "aptitude_overview"
      | "career_matches"
      | "capability_band"
      | "gap_analysis"
      | "learning_style"
      | "stress_resilience"
      | "final_guidance";
    traitKey?: TraitKey;
  }> = [
    {
      title: "1. CONCEPT NOTE — CAREER DNA: CAPABILITY PROFILE REPORT",
      color: [30, 58, 138],
      resultType: "overall",
      lines: [
        "What is this report?",
        "This report is designed to help me understand:",
        "• how I think,",
        "• how I learn,",
        "• what type of tasks may naturally suit me,",
        "• and which career pathways may currently show stronger capability alignment.",
        "The report does not predict my future. Instead, it helps me explore:",
        "• my strengths,",
        "• development areas,",
        "• and possible academic and career directions.",
        "This report combines: cognitive ability analysis, aptitude analysis, capability-based career matching, learning preferences, and behavioral indicators.",
        "The goal is to support better decisions related to streams, subjects, and future career exploration.",
      ],
    },
    {
      title: "2. CONCEPT NOTE — COGNITIVE ABILITY",
      color: [59, 130, 246],
      resultType: "cognitive_overview",
      lines: [
        "What is Cognitive Ability?",
        "Cognitive ability refers to the way I:",
        "• understand information,",
        "• process ideas,",
        "• solve problems,",
        "• remember concepts,",
        "• and apply learning.",
        "Every student has a different thinking pattern. Some perform better with numbers, language, visual thinking, analysis, or information processing.",
        "Understanding cognitive ability helps identify:",
        "• how I learn best,",
        "• where I may feel academically stronger,",
        "• and which types of careers may align better with my current capability profile.",
        "This does NOT mean I can only do one career or that lower scores mean failure.",
        "It simply helps identify stronger alignment areas and areas that may require additional development.",
      ],
    },
    {
      title: "3. CONCEPT NOTE — VERBAL REASONING",
      color: [30, 58, 138],
      resultType: "trait",
      traitKey: "VR",
      lines: [
        "What does this measure?",
        "Verbal reasoning measures my ability to:",
        "• understand written information,",
        "• interpret ideas,",
        "• analyze language,",
        "• and communicate clearly.",
        "It reflects how effectively I process information through words and language.",
        "Why is it important? Strong verbal reasoning is often useful in communication-heavy careers, understanding concepts, writing, presenting ideas, and people-oriented professions.",
        "Careers where it is commonly important: Law, Journalism, Psychology, Teaching, Media & Communication.",
      ],
    },
    {
      title: "4. CONCEPT NOTE — NUMERICAL REASONING",
      color: [30, 58, 138],
      resultType: "trait",
      traitKey: "NR",
      lines: [
        "What does this measure?",
        "Numerical reasoning measures my ability to:",
        "• work with numbers,",
        "• identify mathematical patterns,",
        "• solve quantitative problems,",
        "• and think logically using numerical information.",
        "Why is it important? Strong numerical reasoning may support careers involving calculations, analytics, engineering, finance, and technical systems.",
        "Careers where it is commonly important: Engineering, Data Science, Finance, AI & Analytics, Statistics.",
      ],
    },
    {
      title: "5. CONCEPT NOTE — SPATIAL REASONING",
      color: [30, 58, 138],
      resultType: "trait",
      traitKey: "SR",
      lines: [
        "What does this measure?",
        "Spatial reasoning measures my ability to:",
        "• visualize shapes and objects,",
        "• understand layouts and dimensions,",
        "• think visually,",
        "• and mentally work with structures or designs.",
        "Why is it important? This ability is commonly useful in careers involving design, architecture, visualization, and structural thinking.",
        "Careers where it is commonly important: Architecture, Interior Design, Product Design, Animation, Engineering Design.",
      ],
    },
    {
      title: "6. CONCEPT NOTE — MEMORY & PROCESSING SPEED",
      color: [30, 58, 138],
      resultType: "trait",
      traitKey: "MP",
      lines: [
        "What does this measure? This measures:",
        "• how quickly I process information,",
        "• how efficiently I understand tasks,",
        "• and how effectively I retain and recall information.",
        "Why is it important? Strong processing ability may help in faster learning, handling large amounts of information, and performing in time-sensitive academic or work environments.",
      ],
    },
    {
      title: "7. CONCEPT NOTE — APTITUDE PROFILE",
      color: [8, 145, 178],
      resultType: "aptitude_overview",
      lines: [
        "What is Aptitude?",
        "Aptitude reflects my natural ability or readiness to perform well in specific types of tasks.",
        "While cognitive ability explains 'how I think,' aptitude helps identify:",
        "• what type of work I may naturally handle more comfortably,",
        "• and where my learning advantage may exist.",
        "Aptitude does not guarantee success. It only indicates:",
        "• possible natural alignment,",
        "• and current capability readiness.",
      ],
    },
    {
      title: "8. CONCEPT NOTE — LOGICAL & ANALYTICAL ABILITY",
      color: [8, 145, 178],
      resultType: "trait",
      traitKey: "LR",
      lines: [
        "What does this measure?",
        "This measures my ability to:",
        "• identify patterns,",
        "• solve problems logically,",
        "• analyze situations,",
        "• and think step by step.",
        "Careers where it is commonly important: Technology, Engineering, Analytics, Research, Strategy & Consulting.",
      ],
    },
    {
      title: "9. CONCEPT NOTE — NUMERICAL APTITUDE",
      color: [8, 145, 178],
      resultType: "trait",
      traitKey: "NA",
      lines: [
        "What does this measure?",
        "Numerical aptitude reflects my ability to:",
        "• apply mathematics practically,",
        "• analyze numerical information,",
        "• and solve quantitative tasks efficiently.",
        "Careers where it is commonly important: Finance, Economics, Engineering, Data Analytics.",
      ],
    },
    {
      title: "10. CONCEPT NOTE — VERBAL APTITUDE",
      color: [8, 145, 178],
      resultType: "trait",
      traitKey: "VA",
      lines: [
        "What does this measure?",
        "This measures my ability to:",
        "• communicate ideas,",
        "• understand language,",
        "• express thoughts,",
        "• and work effectively with verbal information.",
        "Careers where it is commonly important: Law, Media, Teaching, Public Relations, Journalism.",
      ],
    },
    {
      title: "11. CONCEPT NOTE — MECHANICAL APTITUDE",
      color: [8, 145, 178],
      resultType: "trait",
      traitKey: "MA",
      lines: [
        "What does this measure?",
        "Mechanical aptitude measures my understanding of:",
        "• machines,",
        "• tools,",
        "• movement,",
        "• structures,",
        "• and practical mechanical systems.",
        "Careers where it is commonly important: Mechanical Engineering, Robotics, Manufacturing, Technical Trades.",
      ],
    },
    {
      title: "12. CONCEPT NOTE — CREATIVITY & INNOVATION",
      color: [8, 145, 178],
      resultType: "trait",
      traitKey: "CI",
      lines: [
        "What does this measure?",
        "This measures my ability to:",
        "• think creatively,",
        "• generate ideas,",
        "• solve problems differently,",
        "• and imagine new possibilities.",
        "Careers where it is commonly important: Design, Media, Product Innovation, Creative Technology, Advertising.",
      ],
    },
    {
      title: "13. CONCEPT NOTE — TOP CAREER MATCHES",
      color: [30, 58, 138],
      resultType: "career_matches",
      lines: [
        "How are career matches generated?",
        "Career matches are identified by comparing:",
        "• my cognitive ability profile,",
        "• and aptitude profile",
        "with the capability requirements of multiple careers.",
        "The system evaluates how closely my current capabilities align with different career pathways.",
        "A higher score does NOT guarantee success. It only indicates stronger current capability alignment.",
      ],
    },
    {
      title: "14. CONCEPT NOTE — CAPABILITY BAND",
      color: [30, 58, 138],
      resultType: "capability_band",
      lines: [
        "What does the capability band mean?",
        "Strong Capability Alignment: My current capability profile strongly aligns with this career.",
        "High Capability Potential: I show good potential alignment with moderate development needs.",
        "Moderate Capability Match: Some important capabilities align, but development may be required.",
        "Conditional Capability Match: Significant development may be needed for stronger alignment.",
        "Low Capability Alignment: Current capability alignment appears comparatively lower.",
        "These bands should be treated as guidance indicators, not final judgments.",
      ],
    },
    {
      title: "15. CONCEPT NOTE — GAP ANALYSIS",
      color: [30, 58, 138],
      resultType: "gap_analysis",
      lines: [
        "What is Gap Analysis?",
        "Gap analysis compares my current capability scores with the capability requirements of careers.",
        "The purpose is to identify:",
        "• where my strengths currently exist,",
        "• and which areas may require improvement.",
        "A gap does NOT mean I cannot pursue a career.",
        "It simply indicates where additional learning, practice, or development may be helpful.",
      ],
    },
    {
      title: "16. CONCEPT NOTE — LEARNING STYLE",
      color: [245, 158, 11],
      resultType: "learning_style",
      lines: [
        "What is Learning Style?",
        "Learning style reflects how I may absorb and understand information more comfortably.",
        "Examples:",
        "• Visual learners often prefer diagrams and images.",
        "• Auditory learners often learn better through listening and discussion.",
        "• Kinesthetic learners often prefer hands-on experiences.",
        "Learning style is not a measure of intelligence.",
        "It only helps identify learning environments that may feel more comfortable or effective.",
      ],
    },
    {
      title: "17. CONCEPT NOTE — STRESS & RESILIENCE",
      color: [239, 68, 68],
      resultType: "stress_resilience",
      lines: [
        "What does Stress & Resilience measure?",
        "This section helps understand:",
        "• how I respond to challenges,",
        "• how I manage pressure,",
        "• and how effectively I recover from setbacks.",
        "Resilience is important because many careers and academic environments involve pressure, deadlines, uncertainty, and problem-solving.",
        "This section does NOT measure weakness. It helps identify coping strengths and areas where emotional support or skill development may help.",
      ],
    },
    {
      title: "18. FINAL GUIDANCE NOTE",
      color: [51, 65, 85],
      resultType: "final_guidance",
      lines: [
        "Important Reminder",
        "This report is a guidance tool.",
        "It is not a final decision about my future, my intelligence, or my success potential.",
        "My long-term growth will also depend on:",
        "• effort,",
        "• discipline,",
        "• consistency,",
        "• exposure,",
        "• support,",
        "• and continuous learning.",
        "The purpose of this report is to help me understand myself better, explore suitable directions, and make more informed academic and career decisions.",
      ],
    },
  ];

  const startConceptPage = (title: string): number => {
    pdf.addPage();
    pageNum++;
    setFill(pdf, 248, 250, 252);
    pdf.rect(0, 0, PW, 297, "F");
    addPageHeader(pdf, title, PW);
    return 20;
  };

  const drawMiniBar = (
    x: number,
    y: number,
    w: number,
    h: number,
    value: number,
    color: [number, number, number]
  ) => {
    setFill(pdf, 226, 232, 240);
    pdf.roundedRect(x, y, w, h, 0.8, 0.8, "F");
    setFill(pdf, color[0], color[1], color[2]);
    pdf.roundedRect(x, y, Math.max(0.4, w * (Math.max(0, Math.min(100, value)) / 100)), h, 0.8, 0.8, "F");
  };

  let noteY = startConceptPage("Concept Notes with 30/70 Layout");

  conceptNotes.forEach((note, noteIndex) => {
    const estimatedH = 52 + Math.max(0, note.lines.length - 2) * 4;
    if (noteY + estimatedH > 280) {
      noteY = startConceptPage("Concept Notes (Continued)");
    }

    const blockH = drawSplitConceptResultCard(
      pdf,
      ML,
      noteY,
      CW,
      note.title,
      note.lines,
      note.color,
      (rx, ry, rw, rh) => {
        const centerX = rx + rw / 2;
        const donutY = ry + 10;

        if (note.resultType === "trait" && note.traitKey) {
          const score = Math.round(traitScores[note.traitKey]);
          const col: [number, number, number] = score >= 75 ? [16, 185, 129] : score >= 50 ? [245, 158, 11] : [239, 68, 68];
          drawArcGauge(pdf, centerX, donutY, 6.5, score, 100, col, note.traitKey);
          setTxt(pdf, 30, 41, 59);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.2);
          pdf.text(score >= 75 ? "Strong" : score >= 50 ? "Developing" : "Focus", centerX, ry + rh - 2, { align: "center" });
          return;
        }

        if (note.resultType === "overall") {
          const overall = Math.round((cognitivePct + aptitudePct) / 2);
          drawArcGauge(pdf, centerX, donutY, 6.8, overall, 100, [30, 58, 138], "Overall");
          setTxt(pdf, 30, 41, 59);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.2);
          pdf.text((top10[0]?.career || "—").slice(0, 18), centerX, ry + 25, { align: "center" });
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(6.8);
          pdf.text(`Top Match ${Math.round(top10[0]?.capabilityScore || 0)}/100`, centerX, ry + 29, { align: "center" });
          return;
        }

        if (note.resultType === "cognitive_overview") {
          drawArcGauge(pdf, centerX, donutY, 6.8, cognitivePct, 100, [59, 130, 246], "Cognitive");
          let sy = ry + 23;
          cognitiveRows.forEach((row) => {
            const val = Math.round(traitScores[row.key]);
            setTxt(pdf, 71, 85, 105);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(6.5);
            pdf.text(row.key, rx + 1.5, sy + 2.5);
            drawMiniBar(rx + 8, sy, rw - 12, 2.8, val, [59, 130, 246]);
            sy += 4.4;
          });
          return;
        }

        if (note.resultType === "aptitude_overview") {
          drawArcGauge(pdf, centerX, donutY, 6.8, aptitudePct, 100, [8, 145, 178], "Aptitude");
          let sy = ry + 23;
          aptitudeRows.forEach((row) => {
            const val = Math.round(traitScores[row.key]);
            setTxt(pdf, 71, 85, 105);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(6.5);
            pdf.text(row.key, rx + 1.5, sy + 2.5);
            drawMiniBar(rx + 8, sy, rw - 12, 2.8, val, [8, 145, 178]);
            sy += 4.4;
          });
          return;
        }

        if (note.resultType === "career_matches") {
          setTxt(pdf, 30, 41, 59);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.2);
          pdf.text("Top 3 Matches", centerX, ry + 4.8, { align: "center" });
          let sy = ry + 8;
          top10.slice(0, 3).forEach((c, i) => {
            const short = c.career.length > 13 ? `${c.career.slice(0, 12)}…` : c.career;
            setTxt(pdf, 71, 85, 105);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(6.4);
            pdf.text(`${i + 1}. ${short}`, rx + 1.3, sy + 2.3);
            drawMiniBar(rx + 1.3, sy + 2.9, rw - 2.6, 2.7, c.capabilityScore, c.band.color);
            sy += 8.1;
          });
          return;
        }

        if (note.resultType === "capability_band") {
          setTxt(pdf, 30, 41, 59);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.1);
          pdf.text("Band Distribution", centerX, ry + 4.8, { align: "center" });
          let sy = ry + 7.5;
          BANDS.forEach((b) => {
            setFill(pdf, b.color[0], b.color[1], b.color[2]);
            pdf.roundedRect(rx + 1.3, sy, rw - 2.6, 3.2, 0.8, 0.8, "F");
            setTxt(pdf, 255, 255, 255);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(6);
            pdf.text(b.label.replace(" Capability", ""), centerX, sy + 2.3, { align: "center" });
            sy += 4.2;
          });
          return;
        }

        if (note.resultType === "gap_analysis") {
          setTxt(pdf, 30, 41, 59);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.1);
          pdf.text("Top Development Gaps", centerX, ry + 4.8, { align: "center" });
          let sy = ry + 9;
          if (!developmentTraits.length) {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(6.6);
            pdf.text("No major gaps", centerX, sy + 4, { align: "center" });
          } else {
            developmentTraits.forEach((d) => {
              setTxt(pdf, 71, 85, 105);
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(6.5);
              pdf.text(d.key, rx + 1.3, sy + 2.5);
              const severity = Math.min(100, Math.abs(d.avg) * 4);
              drawMiniBar(rx + 8, sy, rw - 12, 2.8, severity, [239, 68, 68]);
              sy += 4.6;
            });
          }
          return;
        }

        if (note.resultType === "learning_style") {
          const ranked = getLearningStyleRankedNames(learningSection);
          setTxt(pdf, 30, 41, 59);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.1);
          pdf.text("Primary / Secondary", centerX, ry + 4.8, { align: "center" });
          pdf.setFontSize(6.8);
          pdf.text(ranked[0] || "—", centerX, ry + 10, { align: "center" });
          pdf.text(ranked[1] || "—", centerX, ry + 14.5, { align: "center" });
          const parts = Array.isArray(learningSection?.parts) ? learningSection.parts : [];
          let sy = ry + 18;
          parts.slice(0, 3).forEach((part: any) => {
            const pct = Math.round(Number(part?.percentage ?? 0));
            const code = getLearningStyleCodeFromName(String(part?.partName || "")) || "V";
            const col = code === "V" ? [59, 130, 246] : code === "A" ? [8, 145, 178] : [245, 158, 11];
            drawMiniBar(rx + 1.3, sy, rw - 2.6, 3.1, pct, col as [number, number, number]);
            sy += 5.3;
          });
          return;
        }

        if (note.resultType === "stress_resilience") {
          const pct = getSectionPct(stressSection, 160);
          drawArcGauge(pdf, centerX, donutY, 6.8, pct, 100, [239, 68, 68], "Resilience");
          const parts = Array.isArray(stressSection?.parts) ? stressSection.parts : [];
          const topPart = [...parts].sort((a: any, b: any) => Number(b?.percentage || 0) - Number(a?.percentage || 0))[0];
          setTxt(pdf, 71, 85, 105);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(6.4);
          const topName = String(topPart?.partName || "").slice(0, 20);
          pdf.text(topName || "No part data", centerX, ry + 24.5, { align: "center" });
          return;
        }

        if (note.resultType === "final_guidance") {
          setTxt(pdf, 30, 41, 59);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.1);
          pdf.text("Action Snapshot", centerX, ry + 4.8, { align: "center" });
          setTxt(pdf, 71, 85, 105);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(6.5);
          pdf.text(`Strengths: ${topStrengths.join(", ")}`, rx + 1.3, ry + 10);
          const dev = developmentTraits.map((d) => d.key).join(", ") || "—";
          pdf.text(`Focus: ${dev}`, rx + 1.3, ry + 14.2);
          pdf.text("Re-evaluate after practice", rx + 1.3, ry + 18.4);
          return;
        }
      }
    );

    noteY += blockH + 3;

    if (noteIndex === conceptNotes.length - 1) {
      const discLines = pdf.splitTextToSize(DISCLAIMER, CW - 6);
      if (noteY + 21 > 280) {
        noteY = startConceptPage("Guidance Disclaimer");
      }
      setFill(pdf, 254, 242, 242);
      setDraw(pdf, 220, 38, 38);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(ML, noteY, CW, 20, 1.5, 1.5, "FD");
      setFill(pdf, 220, 38, 38);
      pdf.roundedRect(ML, noteY, CW, 5.8, 1.5, 1.5, "F");
      pdf.rect(ML, noteY + 3, CW, 2.8, "F");
      setTxt(pdf, 255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.2);
      pdf.text("DISCLAIMER", ML + CW / 2, noteY + 4.4, { align: "center" });
      setTxt(pdf, 127, 29, 29);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.4);
      discLines.slice(0, 4).forEach((line: string, i: number) => {
        pdf.text(line, ML + 3, noteY + 9 + i * 3.1);
      });
    }
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
