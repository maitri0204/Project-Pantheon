const SESSION_SYNC_PATH = "/api/auth/session";

type SessionStatusResponse = { ok?: boolean };

export const checkSessionCookie = async (): Promise<boolean> => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const response = await fetch(SESSION_SYNC_PATH, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as SessionStatusResponse;
    return payload.ok === true;
  } catch {
    return false;
  }
};

export const syncSessionCookie = async (token: string): Promise<void> => {
  if (typeof window === "undefined" || !token.trim()) {
    return;
  }

  const response = await fetch(SESSION_SYNC_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to establish session. Please try again.");
  }

  const verified = await checkSessionCookie();
  if (!verified) {
    throw new Error("Session verification failed. Check that JWT_SECRET matches on frontend and backend.");
  }
};

export const clearSessionCookie = async (): Promise<void> => {
  if (typeof window === "undefined") {
    return;
  }

  await fetch(SESSION_SYNC_PATH, {
    method: "DELETE",
    credentials: "same-origin",
  });
};
