export type AssessmentReleaseMeta = {
  isReleased?: boolean;
  releaseDate?: string | null;
  releaseLabel?: string | null;
};

const IST_TIMEZONE = "Asia/Kolkata";

function getIstDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isAssessmentReleasedClient(releaseDate?: string | null): boolean {
  if (!releaseDate) return true;

  const release = new Date(releaseDate);
  if (Number.isNaN(release.getTime())) return true;

  return getIstDateKey(new Date()) >= getIstDateKey(release);
}

export function isAssessmentLocked(meta?: AssessmentReleaseMeta | null): boolean {
  if (!meta?.releaseDate) return false;
  if (typeof meta.isReleased === "boolean") return !meta.isReleased;
  return !isAssessmentReleasedClient(meta.releaseDate);
}

export function formatReleaseDateForInput(releaseDate?: string | null): string {
  if (!releaseDate) return "";

  const date = new Date(releaseDate);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function compareAssessmentsByAvailability(
  a: AssessmentReleaseMeta,
  b: AssessmentReleaseMeta,
): number {
  const aLocked = isAssessmentLocked(a);
  const bLocked = isAssessmentLocked(b);

  if (aLocked !== bLocked) {
    return aLocked ? 1 : -1;
  }

  const aRelease = a.releaseDate ? new Date(a.releaseDate).getTime() : Number.NaN;
  const bRelease = b.releaseDate ? new Date(b.releaseDate).getTime() : Number.NaN;

  if (!aLocked && !bLocked) {
    const aSort = Number.isFinite(aRelease) ? aRelease : 0;
    const bSort = Number.isFinite(bRelease) ? bRelease : 0;
    return aSort - bSort;
  }

  const aSort = Number.isFinite(aRelease) ? aRelease : Number.MAX_SAFE_INTEGER;
  const bSort = Number.isFinite(bRelease) ? bRelease : Number.MAX_SAFE_INTEGER;
  return aSort - bSort;
}

export function sortAssessmentsByAvailability<T extends AssessmentReleaseMeta>(
  assessments: T[],
): T[] {
  return [...assessments].sort(compareAssessmentsByAvailability);
}

export function formatReleaseStampParts(releaseDate: string): {
  day: string;
  monthYear: string;
  full: string;
} {
  const date = new Date(releaseDate);
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value || "";
  const month = parts.find((part) => part.type === "month")?.value || "";
  const year = parts.find((part) => part.type === "year")?.value || "";
  const currentYear = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
  }).format(new Date());

  const monthYear = year === currentYear ? month.toUpperCase() : `${month.toUpperCase()} ${year}`;

  return {
    day,
    monthYear,
    full: `${day} ${monthYear}`,
  };
}
