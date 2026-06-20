const SESSION_SYNC_PATH = "/session";

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

  try {
    const response = await fetch(SESSION_SYNC_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.ok) {
      return;
    }
  } catch {
    // fall through — login may have already set the cookie via backend Set-Cookie
  }

  if (await checkSessionCookie()) {
    return;
  }

  throw new Error("Unable to establish session. Please try again.");
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
