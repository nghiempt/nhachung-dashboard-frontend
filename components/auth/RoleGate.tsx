"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, isAdminRole } from "@/components/providers/UserProvider";

/**
 * Keeps each role inside its own UI:
 *  - require="admin"    → non-admins are sent to the resident dashboard
 *  - require="resident" → admins are sent to the admin dashboard
 * Must be rendered inside <UserProvider>. Returns null while a mismatch
 * redirect is pending so the wrong UI never flashes.
 */
export function RoleGate({
  require,
  children,
}: {
  require: "admin" | "resident";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { buildings, loading } = useUser();

  const admin = isAdminRole(buildings?.active?.role ?? buildings?.mine?.find((b) => b.isActive)?.role);
  const resolved = !loading && !!buildings;
  const mismatch = resolved && (require === "admin" ? !admin : admin);

  useEffect(() => {
    if (mismatch) {
      router.replace(require === "admin" ? "/dashboard" : "/admin/dashboard");
    }
  }, [mismatch, require, router]);

  if (mismatch) return null;
  return <>{children}</>;
}
