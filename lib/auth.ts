// Auth flows wired to the backend /auth/* endpoints.
import {
  api,
  apiPost,
  saveSession,
  clearSession,
  getAccessToken,
  type AuthResult,
} from "./api";

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
  referralCode?: string;
  agree?: boolean;
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const result = await apiPost<AuthResult>(
    "/auth/sign-in",
    { email, password },
    { auth: false },
  );
  saveSession(result);
  return result;
}

export async function signUp(payload: SignUpPayload): Promise<AuthResult> {
  const result = await apiPost<AuthResult>("/auth/sign-up", payload, { auth: false });
  saveSession(result);
  return result;
}

export async function signOut(): Promise<void> {
  try {
    if (getAccessToken()) {
      await api("/auth/logout", { method: "POST" });
    }
  } catch {
    // ignore network/expiry errors — we clear locally regardless
  } finally {
    clearSession();
  }
}
