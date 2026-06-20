const PAYMENT_SESSION_PREFIX = "pantheon-payment-session:";

export const storePaymentSessionId = (assessmentCode: string, paymentSessionId: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const code = assessmentCode.trim().toUpperCase();
  if (!code || !paymentSessionId.trim()) {
    return;
  }

  window.sessionStorage.setItem(`${PAYMENT_SESSION_PREFIX}${code}`, paymentSessionId.trim());
};

export const consumePaymentSessionId = (assessmentCode: string): string | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const code = assessmentCode.trim().toUpperCase();
  if (!code) {
    return undefined;
  }

  const key = `${PAYMENT_SESSION_PREFIX}${code}`;
  const value = window.sessionStorage.getItem(key);
  if (value) {
    window.sessionStorage.removeItem(key);
  }

  return value || undefined;
};
