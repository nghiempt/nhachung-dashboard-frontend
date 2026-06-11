"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./auth.module.css";
import { BrandLogo } from "./BrandLogo";
import { SupportBox } from "./SupportBox";
import { PasswordField, SubmitArrowIcon } from "./PasswordField";
import { signIn } from "@/lib/auth";
import { hasSession, ApiError, api } from "@/lib/api";
import { isAdminRole, type BuildingsResponse } from "@/components/providers/UserProvider";

/** Decide where to land after auth based on the active building's role. */
async function resolveLanding(from: string | null): Promise<string> {
  let isAdmin = false;
  try {
    const buildings = await api<BuildingsResponse>("/buildings");
    isAdmin = isAdminRole(buildings.active?.role);
  } catch {
    /* fall back to resident on any error */
  }
  const safeFrom = from && from.startsWith("/") ? from : null;
  if (isAdmin) {
    return safeFrom && safeFrom.startsWith("/admin") ? safeFrom : "/admin/dashboard";
  }
  return safeFrom && !safeFrom.startsWith("/admin") ? safeFrom : "/dashboard";
}

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in → send to the right area for their role.
  useEffect(() => {
    if (hasSession()) {
      resolveLanding(null).then((to) => router.replace(to));
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    // Client-side validation before hitting the API.
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Email không hợp lệ");
      return;
    }
    setLoading(true);
    try {
      await signIn(trimmedEmail, password);
      const from = new URLSearchParams(window.location.search).get("from");
      router.replace(await resolveLanding(from));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Không kết nối được máy chủ. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.leftPanel}>
        <BrandLogo />

        <div className={styles.formWrap}>
          <div className={styles.titleSection}>
            <h1>Đăng nhập</h1>
            <p>Đăng nhập để vào dashboard quản lý</p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Nhập địa chỉ email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <PasswordField
              id="password"
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
            />

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <span>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
              <SubmitArrowIcon />
            </button>

            {error ? <div className={styles.loginError}>{error}</div> : null}
          </form>

          <p className={styles.registerLink}>
            Chưa có tài khoản? <Link href="/sign-up">Đăng ký miễn phí</Link>
          </p>

          <SupportBox />
        </div>
      </div>

      <div className={styles.rightPanel}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/auth/preview.png" alt="Webico dashboard preview" />
      </div>
    </div>
  );
}
