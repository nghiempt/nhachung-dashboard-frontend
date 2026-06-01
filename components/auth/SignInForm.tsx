"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./auth.module.css";
import { BrandLogo } from "./BrandLogo";
import { SupportBox } from "./SupportBox";
import { PasswordField, SubmitArrowIcon } from "./PasswordField";
import { signIn } from "@/lib/auth";
import { hasSession, ApiError } from "@/lib/api";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in (token + cookie agree, matching the middleware) → dashboard.
  useEffect(() => {
    if (hasSession()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      const from = new URLSearchParams(window.location.search).get("from");
      router.replace(from && from.startsWith("/") ? from : "/dashboard");
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
              footer={
                <div className={styles.fieldFooter}>
                  <a href="#" className={styles.forgotLink}>
                    Quên mật khẩu?
                  </a>
                </div>
              }
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
