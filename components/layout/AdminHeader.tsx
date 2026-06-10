"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

const IC = "/icons/admin";

export function AdminHeader() {
  const router = useRouter();
  const [buildingOpen, setBuildingOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const closeAll = () => { setBuildingOpen(false); setNotifOpen(false); setUserOpen(false); };

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await signOut(); // clears nc_auth cookie + tokens, so /sign-in won't bounce back
    router.replace("/sign-in");
  }

  return (
    <>
      {(buildingOpen || notifOpen || userOpen) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }} onClick={closeAll} />
      )}

      <header className="header">
        {/* Building selector */}
        <div className="building-selector" onClick={() => { setBuildingOpen((v) => !v); setNotifOpen(false); setUserOpen(false); }}>
          <img src={`${IC}/building.svg`} alt="" width={20} height={20} />
          <span className="label">Landmark 1</span>
          <img src={`${IC}/building-chevron.svg`} alt="" width={18} height={18} />
          {buildingOpen && (
            <div className="dd dd-building" onClick={(e) => e.stopPropagation()}>
              <div className="dd-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Tìm kiếm tòa nhà..." />
              </div>
              <div className="dd-sep-label">Của tôi</div>
              <div className="dd-bld-item active">
                <div className="dd-bld-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="15" y1="6" x2="15" y2="2"/><line x1="15" y1="10" x2="19" y2="10"/><line x1="15" y1="14" x2="19" y2="14"/></svg></div>
                <div className="dd-bld-info">
                  <div className="dd-bld-name">Landmark 1</div>
                  <div className="dd-bld-meta">Trưởng Ban Quản Trị · Vinhomes Central Park</div>
                </div>
                <div className="dd-bld-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
              </div>
              <div className="dd-divider" />
              <div className="dd-sep-label">Khám phá</div>
              <div className="dd-bld-item">
                <div className="dd-bld-ico muted"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="22" x2="9" y2="2"/></svg></div>
                <div className="dd-bld-info">
                  <div className="dd-bld-name">Landmark 2</div>
                  <div className="dd-bld-meta">Vinhomes Central Park</div>
                </div>
              </div>
              <div className="dd-bld-item">
                <div className="dd-bld-ico muted"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="22" x2="9" y2="2"/></svg></div>
                <div className="dd-bld-info">
                  <div className="dd-bld-name">The Grand Marina</div>
                  <div className="dd-bld-meta">Quận 1, TP. Hồ Chí Minh</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="search-bar">
          <img src={`${IC}/search.svg`} alt="" width={20} height={20} style={{ flex: "0 0 20px" }} />
          <input placeholder="Tìm kiếm yêu cầu bảo trì, hạng mục, nhà thầu..." />
        </div>

        <div className="header-right">
          {/* Notifications */}
          <button className="notif-btn" onClick={() => { setNotifOpen((v) => !v); setBuildingOpen(false); setUserOpen(false); }}>
            <img src={`${IC}/bell.svg`} alt="" width={24} height={24} />
            <img className="notif-dot" src={`${IC}/notif-dot.svg`} alt="" />
            {notifOpen && (
              <div className="dd dd-notif" onClick={(e) => e.stopPropagation()}>
                <div className="dd-nt-hd">
                  <span className="dd-nt-hd-title">Thông báo</span>
                  <span className="dd-nt-mark">Đánh dấu đã đọc</span>
                </div>
                <div className="dd-nt-grp">Hôm nay</div>
                <div className="dd-nt-item unread">
                  <div className="dd-nt-ico" style={{ background: "#fff3e0" }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="#c8761b" strokeWidth="1.5"><path d="M8 2L2 13h12L8 2z" strokeLinejoin="round"/><path d="M8 6v4M8 11.5v.5" strokeLinecap="round"/></svg>
                  </div>
                  <div className="dd-nt-body">
                    <div className="dd-nt-title">Bảo trì hệ thống PCCC định kỳ — Tầng B1 &amp; B2</div>
                    <div className="dd-nt-meta">Ban quản trị · 10:30 sáng</div>
                  </div>
                </div>
                <div className="dd-nt-item unread">
                  <div className="dd-nt-ico" style={{ background: "#e8f4fd" }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="#1890ff" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 7v5M8 5.5v.5" strokeLinecap="round"/></svg>
                  </div>
                  <div className="dd-nt-body">
                    <div className="dd-nt-title">Điều chỉnh phí gửi xe ô tô từ tháng 6/2026</div>
                    <div className="dd-nt-meta">Ban quản trị · 09:15 sáng</div>
                  </div>
                </div>
                <div className="dd-nt-grp">Hôm qua</div>
                <div className="dd-nt-item">
                  <div className="dd-nt-ico" style={{ background: "#e6f9f1" }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="#1c9d5f" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1"/><path d="M5 3V1.5M11 3V1.5M2 7h12" strokeLinecap="round"/></svg>
                  </div>
                  <div className="dd-nt-body">
                    <div className="dd-nt-title">Sự kiện: Ngày hội cư dân 1/6/2026 — Đăng ký tham gia</div>
                    <div className="dd-nt-meta">Ban quản trị · Hôm qua</div>
                  </div>
                </div>
                <Link href="/admin/thong-bao" className="dd-nt-footer">Xem tất cả thông báo →</Link>
              </div>
            )}
          </button>

          {/* User */}
          <div className="user-pill" onClick={() => { setUserOpen((v) => !v); setBuildingOpen(false); setNotifOpen(false); }}>
            <img className="avatar" src={`${IC}/avatar.png`} alt="" width={32} height={32} />
            <div className="user-info">
              <div className="user-name">Nguyễn Văn Quản</div>
              <div className="user-apt">Trưởng Ban Quản Trị</div>
            </div>
            <img src={`${IC}/user-chevron.svg`} alt="" width={10} height={10} style={{ flex: "0 0 10px" }} />
            {userOpen && (
              <div className="dd dd-user" onClick={(e) => e.stopPropagation()}>
                <div className="dd-usr-info">
                  <img className="dd-usr-avatar" src={`${IC}/avatar.png`} alt="" />
                  <div>
                    <div className="dd-usr-name">Nguyễn Văn Quản</div>
                    <div className="dd-usr-email">chris.tran@gmail.com</div>
                  </div>
                </div>
                <Link className="dd-menu-item" href="#">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Hồ sơ cá nhân
                </Link>
                <Link className="dd-menu-item" href="/admin/cai-dat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                  Cài đặt
                </Link>
                <button
                  type="button"
                  className="dd-menu-item danger"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  style={{ width: "100%", border: 0, background: "none", cursor: signingOut ? "default" : "pointer", font: "inherit", textAlign: "left" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  {signingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
