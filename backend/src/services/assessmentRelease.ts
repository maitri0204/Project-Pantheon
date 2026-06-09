const IST_TIMEZONE = "Asia/Kolkata";

export function getIstDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Assessment is available from the start of its release date (IST). */
export function isAssessmentReleased(releaseDate?: Date | string | null): boolean {
  if (!releaseDate) return true;

  const release = releaseDate instanceof Date ? releaseDate : new Date(releaseDate);
  if (Number.isNaN(release.getTime())) return true;

  return getIstDateKey(new Date()) >= getIstDateKey(release);
}

export function formatAssessmentReleaseLabel(releaseDate: Date | string): string {
  const release = releaseDate instanceof Date ? releaseDate : new Date(releaseDate);
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(release);

  const day = parts.find((part) => part.type === "day")?.value || "";
  const month = parts.find((part) => part.type === "month")?.value || "";
  const year = parts.find((part) => part.type === "year")?.value || "";
  const currentYear = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
  }).format(new Date());

  if (year === currentYear) {
    return `Releasing on ${day} ${month}`;
  }

  return `Releasing on ${day} ${month} ${year}`;
}

export function buildAssessmentReleaseMeta(releaseDate?: Date | string | null): {
  isReleased: boolean;
  releaseDate: string | null;
  releaseLabel: string | null;
} {
  if (!releaseDate) {
    return { isReleased: true, releaseDate: null, releaseLabel: null };
  }

  const release = releaseDate instanceof Date ? releaseDate : new Date(releaseDate);
  if (Number.isNaN(release.getTime())) {
    return { isReleased: true, releaseDate: null, releaseLabel: null };
  }

  const released = isAssessmentReleased(release);

  return {
    isReleased: released,
    releaseDate: release.toISOString(),
    releaseLabel: released ? null : formatAssessmentReleaseLabel(release),
  };
}

/** Parse YYYY-MM-DD from superadmin date input as IST midnight. */
export function parseReleaseDateInput(value: string): Date {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Release date must be in YYYY-MM-DD format");
  }

  return new Date(`${trimmed}T00:00:00+05:30`);
}

export function formatReleaseDateInputValue(releaseDate?: Date | string | null): string {
  if (!releaseDate) return "";

  const release = releaseDate instanceof Date ? releaseDate : new Date(releaseDate);
  if (Number.isNaN(release.getTime())) return "";

  return getIstDateKey(release);
}
