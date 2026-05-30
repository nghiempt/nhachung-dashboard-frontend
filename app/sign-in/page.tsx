import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { AuthHtmlFrame } from "@/components/auth/AuthHtmlFrame";

export const metadata: Metadata = {
  title: "Đăng nhập – Webico",
};

export default function SignInPage() {
  const html = readFileSync(path.join(process.cwd(), "signin.html"), "utf8");

  return <AuthHtmlFrame html={html} variant="sign-in" />;
}
