import "./admin.css";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { UserProvider } from "@/components/providers/UserProvider";
import { RoleGate } from "@/components/auth/RoleGate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <RoleGate require="admin">
        <div className="adm-shell">
          <AdminSidebar />
          <div className="main">
            <AdminHeader />
            <div className="content-scroll nc-scroll">{children}</div>
          </div>
        </div>
      </RoleGate>
    </UserProvider>
  );
}
