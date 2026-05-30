import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { AuthHtmlFrame } from "@/components/auth/AuthHtmlFrame";

export const metadata: Metadata = {
  title: "Đăng ký – Webico",
};

export default function SignUpPage() {
  const html = readFileSync(path.join(process.cwd(), "signup.html"), "utf8");

  return <AuthHtmlFrame html={html} variant="sign-up" />;
}
