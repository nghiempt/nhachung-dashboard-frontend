"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  Building2,
  Check,
  AlertTriangle,
  Info,
  CalendarDays,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { api } from "@/lib/api";
import { useApiData } from "@/lib/hooks";
import { useUser } from "@/components/providers/UserProvider";
import { formatTime } from "@/lib/format";

interface NotifItem {
  id: string;
  title: string;
  source?: string;
  category: string;
  status: "read" | "unread";
  time: string;
}
interface NotifOverview {
  notifications: NotifItem[];
}

const FALLBACK_AVATAR =
  "https://www.figma.com/api/mcp/asset/ee21e768-a070-4e15-ad43-73a28943d4ee";

function notifIcon(category: string) {
  switch (category) {
    case "maintenance":
    case "security":
    case "urgent":
      return { bg: "#fff3e0", color: "#c8761b", el: AlertTriangle };
    case "event":
    case "community":
      return { bg: "#e6f9f1", color: "#1c9d5f", el: CalendarDays };
    default:
      return { bg: "#e8f4fd", color: "#1890ff", el: Info };
  }
}

export function Header() {
  const router = useRouter();
  const { profile, buildings, activeBuilding, activateBuilding } = useUser();
  const [buildingOpen, setBuildingOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl+K focuses the global search; Esc blurs it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { data: overview, refetch } = useApiData<NotifOverview>("/dashboard/overview");
  const recent = overview?.notifications ?? [];
  const hasUnread = recent.some((n) => n.status === "unread");

  const mine = buildings?.mine ?? [];
  const explore = buildings?.explore ?? [];

  const userName = profile?.displayName || profile?.fullName || "Cư dân";
  const userEmail = profile?.email || "";
  const userAvatar = profile?.avatarUrl || FALLBACK_AVATAR;
  const userApartment = activeBuilding?.apartment
    ? `Căn hộ ${activeBuilding.apartment}`
    : activeBuilding?.name || "";

  const closeAll = () => { setBuildingOpen(false); setNotifOpen(false); setUserOpen(false); };
  const handleLogout = async () => {
    closeAll();
    await signOut();
    router.replace("/sign-in");
    router.refresh();
  };
  const handleSwitch = async (id: string, isActive: boolean) => {
    closeAll();
    if (!isActive) await activateBuilding(id);
  };
  const markAllRead = async () => {
    try {
      await api("/notifications/read-all", { method: "POST" });
      refetch();
    } catch { /* ignore */ }
  };

  return (
    <>
      {(buildingOpen || notifOpen || userOpen) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }} onClick={closeAll} />
      )}

      <header style={{
        position: "relative",
        zIndex: 200,
        background: "#ffffff",
        borderBottom: "1px solid #eff2fc",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        flexShrink: 0,
        height: "60px",
      }}>

        {/* Building Selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setBuildingOpen(!buildingOpen); setNotifOpen(false); setUserOpen(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "1px solid #d4d7e5",
              borderRadius: "8px",
              padding: "8px 12px",
              width: "236px",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            <Building2 size={20} color="#4137f9" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "#272727", textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {activeBuilding?.name ?? "Chọn tòa nhà"}
            </span>
            <ChevronDown size={18} color="#585c7b" style={{ flexShrink: 0 }} />
          </button>

          {buildingOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              zIndex: 9999,
              background: "#fff",
              border: "1px solid #e2e5f1",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,.14)",
              minWidth: "272px",
              animation: "ddIn 0.14s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderBottom: "1px solid #e2e5f1" }}>
                <Search size={15} color="#b4b7c9" />
                <input type="text" placeholder="Tìm kiếm tòa nhà..." style={{ flex: 1, border: 0, outline: 0, fontSize: "13px", background: "transparent", color: "#222" }} />
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#b4b7c9", textTransform: "uppercase", letterSpacing: ".5px", padding: "10px 14px 3px" }}>Của tôi</div>
              {mine.map(b => (
                <div key={b.id} onClick={() => handleSwitch(b.id, b.isActive)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", cursor: "pointer", background: b.isActive ? "#f1f7ff" : "transparent" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "8px", background: "#f7f5ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Building2 size={15} color="#4137f9" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#222" }}>{b.name}</div>
                    <div style={{ fontSize: "11px", color: "#585c7b", marginTop: "1px" }}>{[b.apartment, b.location].filter(Boolean).join(" · ")}</div>
                  </div>
                  {b.isActive && <Check size={14} color="#4137f9" />}
                </div>
              ))}
              {explore.length > 0 && (
                <>
                  <div style={{ height: 1, background: "#e2e5f1", margin: "4px 0" }} />
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#b4b7c9", textTransform: "uppercase", letterSpacing: ".5px", padding: "10px 14px 3px" }}>Khám phá</div>
                  {explore.map(b => (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", cursor: "pointer" }} className="hover:bg-[#fafafa]">
                      <div style={{ width: 30, height: 30, borderRadius: "8px", background: "#f7f7f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Building2 size={15} color="#585c7b" />
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#222" }}>{b.name}</div>
                        <div style={{ fontSize: "11px", color: "#585c7b", marginTop: "1px" }}>{b.location}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "1px solid #d4d7e5",
          borderRadius: "10px",
          padding: "0 12px",
          height: "40px",
          background: "#fff",
        }}>
          <Search size={20} color="#b4b7c9" style={{ flexShrink: 0 }} />
          <input
            ref={searchRef}
            placeholder="Tìm kiếm thông báo, tài liệu, báo cáo..."
            style={{ flex: 1, border: 0, outline: 0, fontSize: "14px", color: "#222", background: "transparent" }}
          />
          <kbd
            style={{
              flexShrink: 0,
              fontSize: "11px",
              fontWeight: 600,
              color: "#9499b5",
              background: "#f3f4f9",
              border: "1px solid #e2e5f1",
              borderRadius: "6px",
              padding: "2px 7px",
              fontFamily: "inherit",
              userSelect: "none",
            }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginLeft: "auto" }}>

          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setBuildingOpen(false); setUserOpen(false); }}
              style={{
                position: "relative",
                width: "36px", height: "36px",
                background: "#f7f7f7",
                border: 0,
                borderRadius: "10px",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Bell size={24} color="#272727" />
              {hasUnread && (
                <span style={{
                  position: "absolute", top: "5px", right: "5px",
                  width: "8px", height: "8px",
                  background: "#4137f9",
                  borderRadius: "50%",
                  border: "1.5px solid #fff",
                }} />
              )}
            </button>

            {notifOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                zIndex: 9999,
                background: "#fff",
                border: "1px solid #e2e5f1",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,.14)",
                width: "348px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px 9px", borderBottom: "1px solid #e2e5f1" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#222" }}>Thông báo</span>
                  <span onClick={markAllRead} style={{ fontSize: "12px", fontWeight: 600, color: "#4137f9", cursor: "pointer" }}>Đánh dấu đã đọc</span>
                </div>
                {recent.length === 0 && (
                  <div style={{ padding: "20px 16px", fontSize: "13px", color: "#b4b7c9", textAlign: "center" }}>Chưa có thông báo</div>
                )}
                {recent.slice(0, 4).map(n => {
                  const ic = notifIcon(n.category);
                  const Icon = ic.el;
                  const isUnread = n.status === "unread";
                  return (
                    <div key={n.id} style={{
                      display: "flex", alignItems: "flex-start", gap: "10px", padding: "9px 16px",
                      cursor: "pointer", background: isUnread ? "#f1f7ff" : "transparent",
                      position: "relative",
                    }}>
                      {isUnread && <span style={{ position: "absolute", left: 5, top: "50%", transform: "translateY(-50%)", width: 5, height: 5, borderRadius: "50%", background: "#4137f9" }} />}
                      <div style={{ width: 30, height: 30, borderRadius: "8px", background: ic.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={14} color={ic.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#222", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{n.title}</div>
                        <div style={{ fontSize: "12px", color: "#b4b7c9", marginTop: 3 }}>{[n.source, formatTime(n.time)].filter(Boolean).join(" · ")}</div>
                      </div>
                    </div>
                  );
                })}
                <Link href="/thong-bao" style={{ display: "block", textAlign: "center", padding: "11px", fontSize: "12px", fontWeight: 600, color: "#4137f9", borderTop: "1px solid #e2e5f1" }}>
                  Xem tất cả thông báo →
                </Link>
              </div>
            )}
          </div>

          {/* User Pill */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setUserOpen(!userOpen); setBuildingOpen(false); setNotifOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                height: "32px",
                borderRadius: "10px",
                cursor: "pointer",
                background: "transparent",
                border: 0,
                padding: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userAvatar}
                alt={userName}
                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
                <span style={{ fontWeight: 600, fontSize: "14px", lineHeight: "16px", whiteSpace: "nowrap", color: "#272727" }}>{userName}</span>
                <span style={{ fontSize: "12px", color: "#585c7b", lineHeight: "14px", whiteSpace: "nowrap" }}>{userApartment}</span>
              </div>
              <ChevronDown size={10} color="#585c7b" style={{ flexShrink: 0 }} />
            </button>

            {userOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                zIndex: 9999,
                background: "#fff",
                border: "1px solid #e2e5f1",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,.14)",
                minWidth: "216px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "13px 16px 16px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={userAvatar} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#222" }}>{userName}</div>
                    <div style={{ fontSize: "11px", color: "#585c7b", marginTop: 1 }}>{userEmail}</div>
                  </div>
                </div>
                <div style={{ height: 1, background: "#e2e5f1" }} />
                {[
                  { href: "/ho-so",   label: "Hồ sơ cá nhân", icon: <User size={15} color="#585c7b" /> },
                  { href: "/cai-dat", label: "Cài đặt",        icon: <Settings size={15} color="#585c7b" /> },
                ].map(item => (
                  <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "9px", padding: "9px 16px", fontSize: "13px", fontWeight: 500, color: "#222", textDecoration: "none" }} className="hover:bg-[#fafafa]">
                    {item.icon}{item.label}
                  </Link>
                ))}
                <div style={{ height: 1, background: "#e2e5f1" }} />
                <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "9px", padding: "9px 16px", fontSize: "13px", fontWeight: 500, color: "#f5222d", width: "100%", background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }}>
                  <LogOut size={15} color="#f5222d" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      <style jsx global>{`
        @keyframes ddIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </>
  );
}
