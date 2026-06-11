import { PERSONALITY_NAMES } from "@/lib/reports/reportConstants";

const PERSONALITY_TYPE_RE = /^[EI][SN][TF][JP]$/i;

const RIASEC_NAMES: Record<string, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

export function isPersonalityTypeCode(value: string): boolean {
  return PERSONALITY_TYPE_RE.test(String(value || "").trim());
}

/** Full personality profile title (e.g. ENTP → The Entrepreneur). */
export function formatPersonalityType(code: string): string {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return "-";
  return PERSONALITY_NAMES[normalized] ?? normalized;
}

/** RIASEC letters → readable interest blend (e.g. IAS → Investigative · Artistic · Social). */
export function formatCareerInterestCode(code: string): string {
  const normalized = String(code || "").toUpperCase().replace(/[^RIASEC]/g, "");
  if (!normalized) return "-";
  const names = normalized.split("").map((char) => RIASEC_NAMES[char]).filter(Boolean);
  return names.length ? names.join(" · ") : code;
}

/** Career DNA / mixed result strings - expand embedded type codes when present. */
export function formatCareerDnaResultLabel(label: string): string {
  const raw = String(label || "").trim();
  if (!raw) return "-";
  if (isPersonalityTypeCode(raw)) return formatPersonalityType(raw);
  if (/^[RIASEC]{2,6}$/i.test(raw.replace(/[^RIASEC]/gi, "")) && raw.length <= 8) {
    return formatCareerInterestCode(raw);
  }
  return raw;
}
