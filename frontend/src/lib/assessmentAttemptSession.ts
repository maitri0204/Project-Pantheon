const ATTEMPT_PREFIX = "pantheon-attempt:";

const normalizeCode = (assessmentCode: string): string => assessmentCode.trim().toUpperCase();

export const storeAttemptId = (assessmentCode: string, attemptId: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const code = normalizeCode(assessmentCode);
  const id = attemptId.trim();
  if (!code || !id) {
    return;
  }

  window.sessionStorage.setItem(`${ATTEMPT_PREFIX}${code}`, id);
};

export const getAttemptId = (assessmentCode: string): string | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const code = normalizeCode(assessmentCode);
  if (!code) {
    return undefined;
  }

  const value = window.sessionStorage.getItem(`${ATTEMPT_PREFIX}${code}`);
  return value?.trim() || undefined;
};

export const clearAttemptId = (assessmentCode: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const code = normalizeCode(assessmentCode);
  if (!code) {
    return;
  }

  window.sessionStorage.removeItem(`${ATTEMPT_PREFIX}${code}`);
};
