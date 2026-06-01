// Lightweight API client for the Nhà Chung backend.
// - Stores access/refresh tokens in localStorage
// - Mirrors the `nc_auth` cookie that proxy.ts checks for route protection
// - Auto-attaches the Bearer token and transparently refreshes on 401

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const ACCESS_KEY = "nc_access_token";
const REFRESH_KEY = "nc_refresh_token";
const ACCOUNT_KEY = "nc_account";
const AUTH_COOKIE = "nc_auth";

export interface AuthAccount {
  id: string;
  email: string;
  fullName: string;
  companyName?: string | null;
  status: string;
  profileId?: string | null;
}

export interface AuthResult {
  account: AuthAccount;
  accessToken: string;
  refreshToken: string;
}

// ── Token / session storage ──────────────────────────────────

function isBrowser() {
  return typeof window !== "undefined";
}

function setAuthCookie(on: boolean) {
  if (!isBrowser()) return;
  document.cookie = on
    ? `${AUTH_COOKIE}=1; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 30}`
    : `${AUTH_COOKIE}=; path=/; SameSite=Lax; max-age=0`;
}

export function saveSession(result: AuthResult) {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_KEY, result.accessToken);
  localStorage.setItem(REFRESH_KEY, result.refreshToken);
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(result.account));
  setAuthCookie(true);
}

export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ACCOUNT_KEY);
  setAuthCookie(false);
}

export function getAccessToken(): string | null {
  return isBrowser() ? localStorage.getItem(ACCESS_KEY) : null;
}

export function getRefreshToken(): string | null {
  return isBrowser() ? localStorage.getItem(REFRESH_KEY) : null;
}

export function getStoredAccount(): AuthAccount | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(ACCOUNT_KEY);
  return raw ? (JSON.parse(raw) as AuthAccount) : null;
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/** Whether the nc_auth cookie is set — this is what proxy.ts middleware checks. */
export function hasAuthCookie(): boolean {
  if (!isBrowser()) return false;
  return document.cookie.split("; ").some((c) => c === `${AUTH_COOKIE}=1`);
}

/** Logged-in for routing purposes: token (Bearer) AND cookie (middleware) agree. */
export function hasSession(): boolean {
  return isAuthenticated() && hasAuthCookie();
}

// ── Core request helper ──────────────────────────────────────

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (Array.isArray(data?.message)) return data.message.join(", ");
    return data?.message ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

let refreshing: Promise<boolean> | null = null;
// Set once a 401 has triggered a redirect to /sign-in, so concurrent failing
// requests don't each navigate (the page is unloading anyway).
let redirecting = false;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  // de-dupe concurrent refreshes
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = (await res.json()) as { accessToken: string; refreshToken: string };
        localStorage.setItem(ACCESS_KEY, data.accessToken);
        localStorage.setItem(REFRESH_KEY, data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        // reset after settling so future 401s can refresh again
        setTimeout(() => (refreshing = null), 0);
      }
    })();
  }
  return refreshing;
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean; // default true; set false for public endpoints
  _retried?: boolean;
}

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, auth = true, headers, _retried, ...rest } = options;

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  const isFormData = isBrowser() && body instanceof FormData;
  if (body !== undefined && !isFormData) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 401 && auth && !_retried) {
    const ok = await tryRefresh();
    if (ok) {
      return api<T>(path, { ...options, _retried: true });
    }
    clearSession();
    // Single-shot redirect: concurrent 401s (profile + buildings + overview…)
    // must not each trigger a navigation, which looks like a render/redirect storm.
    if (isBrowser() && !redirecting && !window.location.pathname.startsWith("/sign-")) {
      redirecting = true;
      window.location.href = `/sign-in?from=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new ApiError("Phiên đăng nhập đã hết hạn", 401);
  }

  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// Convenience verbs
export const apiGet = <T = unknown>(path: string, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: "GET" });
export const apiPost = <T = unknown>(path: string, body?: unknown, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: "POST", body });
export const apiPatch = <T = unknown>(path: string, body?: unknown, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: "PATCH", body });
export const apiDelete = <T = unknown>(path: string, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: "DELETE" });
