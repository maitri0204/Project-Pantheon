const SESSION_SYNC_PATH = "/api/auth/session";

export const syncSessionCookie = async (token: string): Promise<void> => {
  if (typeof window === "undefined" || !token.trim()) {
    return;
  }

  await fetch(SESSION_SYNC_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "same-origin",
  });
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
