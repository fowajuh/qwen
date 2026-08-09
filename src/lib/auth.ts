import { API_BASE } from "./api-client";

const ACCESS_KEY = "gt.access";
const REFRESH_KEY = "gt.refresh";

export type SessionUser = { id: string; email: string };

function decodeJwt(token: string): SessionUser | null {
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return { id: json.sub, email: json.email };
  } catch {
    return null;
  }
}

export const auth = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  setTokens(accessToken: string, refreshToken: string) {
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
  currentUser(): SessionUser | null {
    const token = auth.getAccessToken();
    return token ? decodeJwt(token) : null;
  },
  isAuthenticated(): boolean {
    return !!auth.getAccessToken();
  },
};

async function parseOrThrow(res: Response) {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Request failed (${res.status})`);
  }
  return json;
}

export async function signup(input: { email: string; password: string; name: string }) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseOrThrow(res);
  auth.setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function login(input: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseOrThrow(res);
  auth.setTokens(data.accessToken, data.refreshToken);
  return data;
}

/**
 * Exchanges a verified Clerk session token for this app's own access/refresh
 * token pair, so the rest of the app (api-client, useRequireAuth, etc.) keeps
 * working exactly as it does for email/password sessions — it only ever
 * looks at auth.getAccessToken(), never at Clerk directly.
 *
 * Requires a backend endpoint that:
 *   1. Verifies the Clerk token server-side (e.g. via `@clerk/backend`'s
 *      `verifyToken` / `authenticateRequest`).
 *   2. Upserts a local User row keyed by the Clerk user id / email.
 *   3. Issues this app's normal JWT access + refresh tokens.
 * See SETUP_CLERK_AND_MAPS.md for the expected contract.
 */
export async function loginWithClerk(clerkSessionToken: string) {
  const res = await fetch(`${API_BASE}/auth/oauth/clerk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: clerkSessionToken }),
  });
  const data = await parseOrThrow(res);
  auth.setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function refreshSession(): Promise<boolean> {
  const refreshToken = auth.getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await parseOrThrow(res);
    auth.setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    auth.clear();
    return false;
  }
}

export function logout() {
  auth.clear();
}
