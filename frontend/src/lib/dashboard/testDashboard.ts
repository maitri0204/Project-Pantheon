import { normalizeAssessmentCode } from "@/lib/assessmentAccess";

export type TestDashboardMeta = {
  code: string;
  title: string;
  subtitle: string;
  gradient: string;
  accent: string;
  enabled: boolean;
};

const TEST_DASHBOARD_META: Record<string, Omit<TestDashboardMeta, "code">> = {
  STUDY_ABROAD: {
    title: "Study Abroad Readiness",
    subtitle: "Readiness dimensions, bands, and student reports",
    gradient: "from-blue-600 to-cyan-500",
    accent: "bg-blue-50 text-blue-700 border-blue-100",
    enabled: true,
  },
  RESILIENCE_TEST: {
    title: "Resilience Quotient (RQ)",
    subtitle: "Resilience levels and CORE dimension analytics",
    gradient: "from-orange-600 to-amber-500",
    accent: "bg-orange-50 text-orange-700 border-orange-100",
    enabled: true,
  },
  ACADEMIC_CAREER: {
    title: "Academic Career & Interest",
    subtitle: "Interest codes, streams, and career alignment",
    gradient: "from-violet-600 to-purple-500",
    accent: "bg-violet-50 text-violet-700 border-violet-100",
    enabled: true,
  },
  CAREER_COMPASS: {
    title: "Career Compass",
    subtitle: "Personality type distribution across your students",
    gradient: "from-emerald-600 to-teal-500",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
    enabled: true,
  },
  JOHARI_WINDOW: {
    title: "CLEAR",
    subtitle: "Self-awareness quadrant patterns",
    gradient: "from-indigo-600 to-blue-500",
    accent: "bg-indigo-50 text-indigo-700 border-indigo-100",
    enabled: true,
  },
  LITMUS_TEST: {
    title: "Litmus Test",
    subtitle: "Parenting style distribution for parent respondents",
    gradient: "from-rose-600 to-pink-500",
    accent: "bg-rose-50 text-rose-700 border-rose-100",
    enabled: true,
  },
  METACOGNITION_TEST: {
    title: "Thinking & Expression Skills Test",
    subtitle: "Domain score patterns across completed tests",
    gradient: "from-cyan-600 to-sky-500",
    accent: "bg-cyan-50 text-cyan-700 border-cyan-100",
    enabled: true,
  },
  CAREER_DNA: {
    title: "Career DNA Profiler",
    subtitle: "Multi-section profile strengths and completion",
    gradient: "from-fuchsia-600 to-violet-500",
    accent: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
    enabled: true,
  },
};

export function getTestDashboardMeta(code: string): TestDashboardMeta | null {
  const normalized = normalizeAssessmentCode(code);
  const meta = TEST_DASHBOARD_META[normalized];
  if (!meta?.enabled) {
    return null;
  }
  return { code: normalized, ...meta };
}

export function getTestDashboardBasePath(orgDashboardBasePath: string, code: string): string {
  return `${orgDashboardBasePath}/tests/${encodeURIComponent(normalizeAssessmentCode(code))}`;
}

export function isTestDashboardPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return /\/dashboard\/tests\/[^/]+/.test(pathname);
}

export function parseTestCodeFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const match = pathname.match(/\/dashboard\/tests\/([^/]+)/);
  return match?.[1] ? normalizeAssessmentCode(decodeURIComponent(match[1])) : null;
}
