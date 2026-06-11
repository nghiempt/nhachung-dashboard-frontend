"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./auth.module.css";
import { BrandLogo } from "./BrandLogo";
import { SupportBox } from "./SupportBox";
import { PasswordField, SubmitArrowIcon } from "./PasswordField";
import { LoadingSpinner } from "@/components/ui/Skeleton";
import { signUp } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export function SignUpForm() {
  const router = useRouter();
  const [bizName, setBizName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (!fullName.trim()) return setError("Vui lòng nhập họ và tên.");
    if (!email.trim()) return setError("Vui lòng nhập email.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError("Email không hợp lệ.");
    if (password.length < 8) return setError("Mật khẩu cần tối thiểu 8 ký tự.");
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])/.test(password))
      return setError("Mật khẩu cần có chữ hoa, chữ thường, số và ký tự đặc biệt.");
    if (!agree) return setError("Vui lòng đồng ý với điều khoản dịch vụ.");

    setLoading(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        companyName: bizName.trim() || undefined,
        referralCode: referral.trim() || undefined,
        agree,
      });
      router.replace("/dashboard");
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
      <div className={`${styles.leftPanel} ${styles.leftPanelSignup}`}>
        <BrandLogo />

        <div className={styles.formWrap}>
          <div className={styles.titleSection}>
            <h1>Tạo tài khoản miễn phí</h1>
            <p>Bắt đầu với 500 tin AI mỗi tháng</p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="biz-name">Tên doanh nghiệp / cửa hàng</label>
              <input
                type="text"
                id="biz-name"
                name="biz-name"
                placeholder="VD: Spa Mai Anh"
                autoComplete="organization"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="fullname">Họ và tên của bạn</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                placeholder=""
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder=""
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <PasswordField
              id="password"
              label="Mật khẩu (tối thiểu 8 ký tự)"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
            />

            <div className={styles.field}>
              <label htmlFor="referral">Mã giới thiệu (tùy chọn)</label>
              <input
                type="text"
                id="referral"
                name="referral"
                placeholder="VD: TRUONG2026"
                autoComplete="off"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
              />
              <p className={styles.fieldHint}>
                Bạn sẽ được giảm giá khi nâng cấp gói. Mã không hợp lệ sẽ bị bỏ qua.
              </p>
            </div>

            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label htmlFor="agree">
                Tôi đồng ý với{" "}
                <a href="https://zalo.webico.ai/terms" target="_blank" rel="noreferrer">
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="https://zalo.webico.ai/privacy" target="_blank" rel="noreferrer">
                  Chính sách bảo mật
                </a>
                .
              </label>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <span>{loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}</span>
              {loading ? <LoadingSpinner size={16} stroke={2} color="#fff" /> : <SubmitArrowIcon />}
            </button>

            {error ? <div className={styles.loginError}>{error}</div> : null}
          </form>

          <p className={styles.registerLink}>
            Đã có tài khoản? <Link href="/sign-in">Đăng nhập</Link>
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
