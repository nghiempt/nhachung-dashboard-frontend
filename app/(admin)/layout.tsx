import "./admin.css";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { UserProvider } from "@/components/providers/UserProvider";
import { RoleGate } from "@/components/auth/RoleGate";
import { ToastProvider } from "@/components/ui/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <RoleGate require="admin">
        <ToastProvider>
          <div className="adm-shell">
            <AdminSidebar />
            <div className="main">
              <AdminHeader />
              <div className="content-scroll nc-scroll">{children}</div>
            </div>
          </div>
        </ToastProvider>
      </RoleGate>
    </UserProvider>
  );
}
