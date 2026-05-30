import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Đăng ký – Nhà Chung",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
