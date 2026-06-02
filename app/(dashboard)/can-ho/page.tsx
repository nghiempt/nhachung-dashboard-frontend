"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useApiData } from "@/lib/hooks";
import { useUser } from "@/components/providers/UserProvider";
import { formatDate, formatVnd } from "@/lib/format";
import { PAYMENT_STATUS } from "@/lib/ui-maps";
import { exportCsv } from "@/lib/export-csv";

interface Contract {
  contractNumber: string;
  ownershipType: string;
  contractDate: string | null;
  handoverDate: string | null;
  ownerName: string;
  registrationStatus: string;
}

interface Apartment {
  code: string;
  block: string;
  floor: number;
  totalFloors: number;
  areaSqm: number;
  totalAreaSqm: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  orientation: string;
  furnishingStatus: string;
  ownershipType: string;
  parkingLocations: string;
  status: string;
  moveInDate: string | null;
  buildingName: string;
  isOwner: boolean;
  contract: Contract | null;
}

interface FeeItem {
  id: string;
  name: string;
  amount: number;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
}

interface Fees {
  period: string | null;
  items: FeeItem[];
  totalAmount: number;
  unpaidCount: number;
}

function residenceYears(moveInDate?: string | null): number | null {
  if (!moveInDate) return null;
  const d = new Date(moveInDate);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years--;
  return years;
}

export default function CanHoPage() {
  const router = useRouter();
  const { profile } = useUser();
  const { data: apt, loading: aptLoading, error: aptError } =
    useApiData<Apartment>("/apartment/me");
  const { data: fees } = useApiData<Fees>("/apartment/fees");

  // New accounts without an apartment get a 404 — show it gracefully.
  if (aptError) {
    return (
      <div className="canho-page">
        <div className="page-header">
          <div>
            <div className="page-title">Căn hộ của tôi</div>
            <div className="page-subtitle">{aptError}</div>
          </div>
        </div>
      </div>
    );
  }

  if (aptLoading || !apt) {
    return (
      <div className="canho-page">
        <div className="page-header">
          <div>
            <div className="page-title">Căn hộ của tôi</div>
            <div className="page-subtitle">Đang tải...</div>
          </div>
        </div>
      </div>
    );
  }

  const contract = apt.contract;
  const years = residenceYears(apt.moveInDate);
  const isActive = apt.status === "active";
  const feeItems = fees?.items ?? [];

  const handleExportApt = () => {
    const rows: (string | number)[][] = [
      ["Mã căn hộ", apt.code],
      ["Tháp / Block", `${apt.block} (${apt.buildingName})`],
      ["Tầng", `${apt.floor}/${apt.totalFloors}`],
      ["Diện tích", `${apt.areaSqm} m²`],
      ["Phòng ngủ", apt.bedrooms],
      ["Phòng tắm", apt.bathrooms],
      ["Hướng", apt.orientation],
      ["Nội thất", apt.furnishingStatus],
      ["Hình thức sở hữu", apt.ownershipType],
    ];
    if (contract) {
      rows.push(["Số hợp đồng", contract.contractNumber], ["Chủ sở hữu", contract.ownerName]);
    }
    exportCsv(`ho-so-can-ho-${apt.code}`, ["Thông tin", "Giá trị"], rows);
  };

  return (
    <div className="canho-page">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Căn hộ của tôi</div>
          <div className="page-subtitle">
            Thông tin chi tiết căn hộ {apt.code} · {apt.block} · Tầng {apt.floor} · {apt.buildingName}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-primary" onClick={handleExportApt}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Tải hồ sơ căn hộ
          </button>
        </div>
      </div>

      {/* ── Apartment Hero Banner ── */}
      <div className="apt-hero">
        <div className="apt-hero-left">
          <div className="apt-code">{apt.buildingName} · {apt.block} · Floor {apt.floor}</div>
          <div className="apt-name">{apt.code}</div>
          <div className="apt-building">{profile?.location ?? apt.buildingName}</div>
          <div className="apt-tags">
            <div className="apt-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
              {apt.areaSqm} m²
            </div>
            <div className="apt-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22v-7l9-5 9 5v7" /><path d="M3 11V5l9-3 9 3v6" /></svg>
              {apt.bedrooms} Phòng ngủ · {apt.bathrooms} WC
            </div>
            <div className="apt-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 0 20" /><path d="M2 12h20" /></svg>
              Hướng {apt.orientation}
            </div>
            <div className="apt-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              {apt.ownershipType}
            </div>
          </div>
        </div>
        <div className="apt-hero-right">
          <div className="apt-status-chip"><span className="apt-status-dot" /> {isActive ? "Đang hoạt động" : apt.status}</div>
          <div className="apt-hero-actions" style={{ marginTop: "auto" }}>
            <button className="btn-hero-outline" onClick={handleExportApt}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Tải hồ sơ
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: "#efeeff" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
          </div>
          <div>
            <div className="stat-lbl">Diện tích thông thủy</div>
            <div className="stat-val">{apt.areaSqm} m²</div>
            <div className="stat-sub">Tim tường {apt.totalAreaSqm} m²</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: "#e4f1ff" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1870c4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22v-7l9-5 9 5v7" /><path d="M3 11V5l9-3 9 3v6" /></svg>
          </div>
          <div>
            <div className="stat-lbl">Vị trí</div>
            <div className="stat-val">Tầng {apt.floor}</div>
            <div className="stat-sub">{apt.block} · Căn số {apt.code.split(".").pop()}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: "#e3fbed" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          </div>
          <div>
            <div className="stat-lbl">Loại căn hộ</div>
            <div className="stat-val">{apt.bedrooms} PN</div>
            <div className="stat-sub">{apt.bathrooms} WC · {apt.balconies} ban công</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: "#fff8ec" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </div>
          <div>
            <div className="stat-lbl">Thời gian cư trú</div>
            <div className="stat-val">{years != null ? `${years} năm` : "—"}</div>
            <div className="stat-sub">{apt.moveInDate ? `Từ tháng ${formatDate(apt.moveInDate).slice(3)}` : ""}</div>
          </div>
        </div>
      </div>

      {/* ── Body layout ── */}
      <div className="body-layout">
        {/* Left: main info */}
        <div className="body-main">
          {/* Chi tiết căn hộ */}
          <div className="section-card">
            <div className="section-hd">
              <div className="section-title">
                <div className="section-title-icon" style={{ background: "#efeeff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg></div>
                Chi tiết căn hộ
              </div>
            </div>
            <div className="section-body">
              <div className="info-grid">
                <div className="info-item"><div className="info-label">Mã căn hộ</div><div className="info-value">{apt.code}</div></div>
                <div className="info-item"><div className="info-label">Tháp / Block</div><div className="info-value">{apt.block} ({apt.buildingName})</div></div>
                <div className="info-item"><div className="info-label">Tầng</div><div className="info-value">{apt.floor} / {apt.totalFloors} tầng</div></div>
                <div className="info-item"><div className="info-label">Hướng căn hộ</div><div className="info-value">{apt.orientation}</div></div>
                <div className="info-item"><div className="info-label">Nội thất</div><div className="info-value">{apt.furnishingStatus}</div></div>
                <div className="info-item"><div className="info-label">Tình trạng</div><div className="info-value" style={{ color: "#1c9d5f", fontWeight: 600 }}>{isActive ? "Đang sử dụng" : apt.status}</div></div>
                <div className="info-item"><div className="info-label">Ban công</div><div className="info-value">{apt.balconies} ban công</div></div>
                <div className="info-item"><div className="info-label">Chỗ đậu xe</div><div className="info-value">{apt.parkingLocations}</div></div>
              </div>
            </div>
          </div>

          {/* Hợp đồng */}
          <div className="section-card">
            <div className="section-hd">
              <div className="section-title">
                <div className="section-title-icon" style={{ background: "#e4f1ff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#1870c4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg></div>
                Hợp đồng &amp; Sở hữu
              </div>
              <button className="section-edit" onClick={handleExportApt}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>Tải HĐ</button>
            </div>
            <div className="section-body">
              {contract ? (
                <div className="info-grid">
                  <div className="info-item"><div className="info-label">Số hợp đồng</div><div className="info-value">{contract.contractNumber}</div></div>
                  <div className="info-item"><div className="info-label">Loại hình sở hữu</div><div className="info-value">{contract.ownershipType}</div></div>
                  <div className="info-item"><div className="info-label">Ngày ký hợp đồng</div><div className="info-value">{formatDate(contract.contractDate)}</div></div>
                  <div className="info-item"><div className="info-label">Ngày bàn giao</div><div className="info-value">{formatDate(contract.handoverDate)}</div></div>
                  <div className="info-item"><div className="info-label">Chủ sở hữu</div><div className="info-value">{contract.ownerName}</div></div>
                  <div className="info-item"><div className="info-label">Giấy chứng nhận</div><div className="info-value" style={{ color: "#1c9d5f", fontWeight: 600 }}>{contract.registrationStatus}</div></div>
                </div>
              ) : (
                <div className="info-value" style={{ color: "#737373" }}>Chưa có thông tin hợp đồng</div>
              )}
            </div>
          </div>

          {/* Phí hàng tháng */}
          <div className="section-card">
            <div className="section-hd">
              <div className="section-title">
                <div className="section-title-icon" style={{ background: "#fff8ec" }}><svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                Phí dịch vụ{fees?.period ? ` tháng ${fees.period}` : ""}
              </div>
              <button className="section-edit" onClick={() => router.push("/thu-chi")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                Lịch sử thanh toán
              </button>
            </div>
            <div className="section-body" style={{ paddingTop: 0, paddingBottom: 0 }}>
              <div className="fee-table">
                <div className="fee-row fee-hd">
                  <span className="fee-cell">Khoản phí</span>
                  <span className="fee-cell" style={{ textAlign: "right" }}>Số tiền</span>
                  <span className="fee-cell" style={{ textAlign: "right" }}>Trạng thái</span>
                </div>
                {feeItems.map((item) => {
                  const st = PAYMENT_STATUS[item.status] ?? PAYMENT_STATUS.unpaid;
                  return (
                    <div className="fee-row" key={item.id}>
                      <span className="fee-cell name">{item.name}</span>
                      <span className="fee-cell amount">{formatVnd(item.amount)}</span>
                      <span className="fee-cell status">
                        <span className={`fee-status ${item.status === "paid" ? "fee-paid" : "fee-due"}`}>{st.label}</span>
                      </span>
                    </div>
                  );
                })}
                <div className="fee-row" style={{ background: "#f7f7f7" }}>
                  <span className="fee-cell" style={{ fontWeight: 700 }}>Tổng cộng</span>
                  <span className="fee-cell amount" style={{ color: "#4137f9" }}>{formatVnd(fees?.totalAmount ?? 0)}</span>
                  <span className="fee-cell status" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="body-sidebar">
          {/* Resident card */}
          <div className="resident-card">
            <div className="rc-top">
              {profile?.avatarUrl ? (
                <img className="rc-avatar" src={profile.avatarUrl} alt={profile.fullName} width={44} height={44} />
              ) : (
                <div className="rc-avatar" style={{ width: 44, height: 44 }} />
              )}
              <div>
                <div className="rc-name">{profile?.displayName ?? profile?.fullName ?? ""}</div>
                <div className="rc-meta">Căn hộ {apt.code} · {apt.buildingName}</div>
              </div>
              <div className="rc-apt-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
              </div>
            </div>
            <div className="rc-code-label">Mã căn hộ</div>
            <div className="rc-code">{apt.code}</div>
            <div className="rc-building-label">Toà nhà</div>
            <div className="rc-building">{profile?.location ?? apt.buildingName}</div>
            <div className="rc-bottom">
              <div className="rc-active"><span className="rc-active-dot" />{isActive ? "Đang hoạt động" : apt.status}</div>
              <div className="rc-since">{apt.moveInDate ? `Từ ${formatDate(apt.moveInDate).slice(3)}` : ""}</div>
            </div>
          </div>

          {/* Quick links */}
          <div className="quick-links">
            <div className="ql-hd">Thao tác nhanh</div>
            <div className="ql-item">
              <div className="ql-icon" style={{ background: "#efeeff" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <div className="ql-text">
                <div className="ql-name">Thanh toán phí</div>
                <div className="ql-sub">Còn {fees?.unpaidCount ?? 0} khoản chưa TT</div>
              </div>
              <div className="ql-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></div>
            </div>
            <div className="ql-item">
              <div className="ql-icon" style={{ background: "#fff8ec" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
              </div>
              <div className="ql-text">
                <div className="ql-name">Yêu cầu bảo trì</div>
                <div className="ql-sub">Gửi yêu cầu sửa chữa</div>
              </div>
              <div className="ql-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></div>
            </div>
            <div className="ql-item">
              <div className="ql-icon" style={{ background: "#e3fbed" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              </div>
              <div className="ql-text">
                <div className="ql-name">Tải hồ sơ căn hộ</div>
                <div className="ql-sub">PDF · Cập nhật 05/2024</div>
              </div>
              <div className="ql-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></div>
            </div>
            <div className="ql-item">
              <div className="ql-icon" style={{ background: "#f7f5ff" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#5a3ad9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <div className="ql-text">
                <div className="ql-name">Vị trí &amp; Sơ đồ</div>
                <div className="ql-sub">{apt.block} · Tầng {apt.floor} · Căn {apt.code.split(".").pop()}</div>
              </div>
              <div className="ql-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
