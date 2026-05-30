"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./auth.module.css";
import { BrandLogo } from "./BrandLogo";
import { SupportBox } from "./SupportBox";
import { PasswordField, SubmitArrowIcon } from "./PasswordField";

const AUTH_COOKIE = "nc_auth";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Already signed in → go straight to the dashboard.
  useEffect(() => {
    if (document.cookie.split("; ").some((c) => c === `${AUTH_COOKIE}=1`)) {
      router.replace("/dashboard");
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email === "default@gmail.com" && password === "Default@123") {
      document.cookie = `${AUTH_COOKIE}=1; path=/; SameSite=Lax`;
      const from = new URLSearchParams(window.location.search).get("from");
      router.replace(from && from.startsWith("/") ? from : "/dashboard");
    } else {
      setError("Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.");
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

            <button type="submit" className={styles.submitBtn}>
              <span>Đăng nhập</span>
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
