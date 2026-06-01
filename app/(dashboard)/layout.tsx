import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { UserProvider } from "@/components/providers/UserProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", minWidth: 0 }}>
          <Header />
          <main
            className="nc-scroll"
            style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: "#fafafa" }}
          >
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
