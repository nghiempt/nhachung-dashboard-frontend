import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Đăng nhập – Webico",
};

export default function SignInPage() {
  return <SignInForm />;
}
