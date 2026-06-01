"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { formatDate } from "@/lib/format";
import {
  GENDER_LABEL,
  VERIFICATION_LABEL,
  ID_TYPE_LABEL,
  VEHICLE_TYPE_LABEL,
} from "@/lib/ui-maps";

const CheckMini = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CarMini = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 5v3h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const BikeMini = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <path d="M15 6h2l2 6H5l3-6h2" />
    <path d="M12 6V3" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ── Types ────────────────────────────────────────────────────
interface FamilyDocument {
  id: string;
  type: string;
  number: string | null;
  status: string;
  fileUrl: string | null;
}

interface FamilyVehicle {
  id: string;
  licensePlate: string;
  vehicleType: string;
  vehicleName: string | null;
  parkingLocation: string | null;
}

interface FamilyMember {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  age: number | null;
  isOwner: boolean;
  phoneNumber: string | null;
  phoneVerified: boolean;
  contactType: string | null;
  verificationStatus: string;
  notes: string | null;
  documents: FamilyDocument[];
  vehicles: FamilyVehicle[];
}

interface FamilyStats {
  totalMembers: number;
  totalSlots: number;
  emptySlots: number;
  verifiedCount: number;
  pendingCount: number;
}

interface FamilyResponse {
  stats: FamilyStats;
  members: FamilyMember[];
}

// Avatar gradient palette for members without an avatar image.
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#f9a8d4,#ec4899)",
  "linear-gradient(135deg,#93c5fd,#3b82f6)",
  "linear-gradient(135deg,#86efac,#22c55e)",
  "linear-gradient(135deg,#fcd34d,#f59e0b)",
  "linear-gradient(135deg,#c4b5fd,#8b5cf6)",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Member form state ────────────────────────────────────────
interface MemberForm {
  name: string;
  role: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  notes: string;
  docType: string;
  docNumber: string;
}

const EMPTY_FORM: MemberForm = {
  name: "",
  role: "",
  gender: "",
  dateOfBirth: "",
  phoneNumber: "",
  notes: "",
  docType: "",
  docNumber: "",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "42px",
  border: "1px solid #d4d7e5",
  borderRadius: "10px",
  padding: "0 13px",
  fontSize: "14px",
  color: "#272727",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 600,
  color: "#3e4265",
  marginBottom: "6px",
  display: "block",
};

export default function GiaDinhPage() {
  const { data, loading, error, refetch } = useApiData<FamilyResponse>("/family");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>(EMPTY_FORM);

  const save = useAction(async () => {
    const body: Record<string, unknown> = {
      name: form.name.trim(),
      role: form.role.trim() || undefined,
      gender: form.gender || undefined,
      dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined,
      phoneNumber: form.phoneNumber.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    if (form.docType) {
      body.documents = [{ type: form.docType, number: form.docNumber.trim() || undefined }];
    }
    if (editingId) {
      await apiPatch(`/family/${editingId}`, body);
    } else {
      await apiPost("/family", body);
    }
  });

  const remove = useAction(async (id: string) => {
    await apiDelete(`/family/${id}`);
  });

  const stats = data?.stats;
  const members = data?.members ?? [];

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    save.setError(null);
    setFormOpen(true);
  }

  function openEdit(m: FamilyMember) {
    setEditingId(m.id);
    setForm({
      name: m.name ?? "",
      role: m.role ?? "",
      gender: m.gender ?? "",
      dateOfBirth: m.dateOfBirth ? m.dateOfBirth.slice(0, 10) : "",
      phoneNumber: m.phoneNumber ?? "",
      notes: m.notes ?? "",
      docType: m.documents[0]?.type ?? "",
      docNumber: m.documents[0]?.number ?? "",
    });
    save.setError(null);
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      save.setError("Vui lòng nhập họ tên");
      return;
    }
    const res = await save.run();
    if (res !== undefined) {
      setFormOpen(false);
      refetch();
    }
  }

  async function handleDelete(m: FamilyMember) {
    if (m.isOwner) return;
    if (typeof window !== "undefined" && !window.confirm(`Xoá thành viên "${m.name}"?`)) return;
    const res = await remove.run(m.id);
    if (res !== undefined) refetch();
  }

  const emptySlots = stats?.emptySlots ?? 0;
  const totalSlots = stats?.totalSlots ?? 6;
  const usedSlots = stats?.totalMembers ?? members.length;

  return (
    <div className="giadinh-page">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Thành viên gia đình</div>
          <div className="page-subtitle">Quản lý các thành viên đăng ký tại căn hộ</div>
        </div>
        <button className="btn-add-member" onClick={openAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm thành viên
        </button>
      </div>

      {/* ── Error / empty state (e.g. no apartment assigned) ── */}
      {error ? (
        <div className="policy-note" style={{ marginTop: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="policy-text">{error}</div>
        </div>
      ) : (
        <>
          {/* ── Stats ── */}
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ background: "#efeeff" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="stat-body">
                <div className="stat-lbl">Tổng thành viên</div>
                <div className="stat-val">{loading ? "—" : usedSlots}</div>
                <div className="stat-sub">Còn <b>{emptySlots} slot</b> trống</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ background: "#e3fbed" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="stat-body">
                <div className="stat-lbl">Đã xác minh</div>
                <div className="stat-val" style={{ color: "#1c9d5f" }}>{loading ? "—" : stats?.verifiedCount ?? 0}</div>
                <div className="stat-sub"><b>CCCD</b> hợp lệ</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ background: "#fff8ec" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="stat-body">
                <div className="stat-lbl">Chờ xác minh</div>
                <div className="stat-val" style={{ color: "#c8761b" }}>{loading ? "—" : stats?.pendingCount ?? 0}</div>
                <div className="stat-sub">Cần bổ sung giấy tờ</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ background: "#f7f5ff" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#5a3ad9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <div className="stat-body">
                <div className="stat-lbl">Sức chứa</div>
                <div className="stat-val" style={{ fontSize: 18 }}>{loading ? "—" : `${usedSlots}/${totalSlots}`}</div>
                <div className="stat-sub">Tối đa <b>{totalSlots} người</b></div>
              </div>
            </div>
          </div>

          {/* ── Section header ── */}
          <div className="section-hd-row">
            <div className="section-hd-title">Danh sách thành viên</div>
            <div className="section-hd-sub">Tối đa {totalSlots} người · Đang dùng {usedSlots}/{totalSlots} slot</div>
          </div>

          {/* ── Member grid ── */}
          <div className="member-grid">
            {loading && members.length === 0 ? (
              <div style={{ padding: "20px", color: "#585c7b", fontSize: 14 }}>Đang tải...</div>
            ) : null}

            {members.map((m, idx) => {
              const verStatus = m.verificationStatus === "verified" ? "ok" : "pending";
              const relationParts = [
                m.role || "Thành viên",
                m.gender ? GENDER_LABEL[m.gender] ?? m.gender : null,
                m.age != null ? `${m.age} tuổi` : null,
              ].filter(Boolean);
              return (
                <div className="member-card" key={m.id}>
                  {m.isOwner && <span className="owner-tag">Chủ hộ</span>}
                  <div className="mc-top">
                    {m.avatarUrl ? (
                      <img
                        className="mc-avatar"
                        src={m.avatarUrl}
                        alt={m.name}
                        width="56"
                        height="56"
                        style={{ borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="mc-avatar"
                        style={{ background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length], fontSize: 20 }}
                      >
                        {initials(m.name)}
                      </div>
                    )}
                    <div className="mc-info">
                      <div className="mc-name">{m.name}</div>
                      <div className="mc-relation">{relationParts.join(" · ")}</div>
                      <div className={`mc-status ${verStatus}`}>
                        <span className="mc-status-dot"></span>
                        {VERIFICATION_LABEL[m.verificationStatus] ?? m.verificationStatus}
                      </div>
                    </div>
                  </div>
                  <hr className="mc-divider" />
                  <div className="mc-fields">
                    <div className="mc-field">
                      <span className="mc-field-label">Ngày sinh</span>
                      <span className="mc-field-value">{m.dateOfBirth ? formatDate(m.dateOfBirth) : "—"}</span>
                    </div>
                    {m.phoneNumber ? (
                      <div className="mc-field">
                        <span className="mc-field-label">Số điện thoại</span>
                        <span className="mc-field-value">
                          {m.phoneNumber}{" "}
                          {m.phoneVerified && <span className="verified-badge"><CheckMini /></span>}
                        </span>
                      </div>
                    ) : (
                      <div className="mc-field">
                        <span className="mc-field-label">Liên hệ</span>
                        <span className="mc-field-value" style={{ color: "#585c7b", fontStyle: "italic" }}>
                          {m.contactType || "—"}
                        </span>
                      </div>
                    )}
                    <div className="mc-field">
                      <span className="mc-field-label">Giấy tờ</span>
                      <span className="mc-field-value">
                        {m.documents.length > 0 ? (
                          m.documents.map((d) => {
                            const cls = d.type === "birth_certificate" ? "doc-ks" : "doc-cccd";
                            const lbl = ID_TYPE_LABEL[d.type] ?? d.type;
                            return (
                              <span className={`doc-badge ${cls}`} key={d.id}>
                                {d.number ? `${lbl} · ${d.number}` : lbl}
                              </span>
                            );
                          })
                        ) : (
                          <span style={{ color: "#585c7b" }}>—</span>
                        )}
                      </span>
                    </div>
                    {m.vehicles.length > 0 ? (
                      <div className="mc-field">
                        <span className="mc-field-label">Phương tiện</span>
                        <div className="mc-vehicles">
                          {m.vehicles.map((v) => (
                            <span className="mc-veh" key={v.id} title={VEHICLE_TYPE_LABEL[v.vehicleType] ?? v.vehicleType}>
                              {v.vehicleType === "car" ? <CarMini /> : <BikeMini />}
                              {v.licensePlate}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : m.notes ? (
                      <div className="mc-field">
                        <span className="mc-field-label">Ghi chú</span>
                        <span className="mc-field-value" style={{ color: "#c8761b", fontSize: 11 }}>{m.notes}</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="mc-actions">
                    <button className="mc-btn" onClick={() => openEdit(m)}><EditIcon />Chỉnh sửa</button>
                    {m.isOwner ? (
                      <button className="mc-btn primary"><EyeIcon />Xem hồ sơ</button>
                    ) : (
                      <button
                        className="mc-btn"
                        style={{ borderColor: "#ef4444", color: "#ef4444" }}
                        onClick={() => handleDelete(m)}
                        disabled={remove.loading}
                      >
                        <UploadIcon />Xoá
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty slots */}
            {Array.from({ length: emptySlots }).map((_, i) => {
              const slotNo = usedSlots + i + 1;
              return (
                <div className="slot-card" key={`slot-${slotNo}`} onClick={openAdd} style={{ cursor: "pointer" }}>
                  <div className="slot-circle"><PlusIcon /></div>
                  <div className="slot-label">Thêm thành viên</div>
                  <div className="slot-sub">Slot {slotNo}/{totalSlots} · Còn trống</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Policy note ── */}
      <div className="policy-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div className="policy-text">
          Mỗi căn hộ được đăng ký tối đa <b>6 thành viên</b> (bao gồm chủ hộ). Thành viên đăng ký sẽ được cấp thẻ từ và quyền ra vào toà nhà. Trẻ em dưới 14 tuổi cần cung cấp giấy khai sinh, từ 14 tuổi trở lên cần CCCD/CMND. Liên hệ BQL để được hỗ trợ thêm.
        </div>
      </div>

      {/* ── Add / Edit modal ── */}
      {formOpen && (
        <div
          onClick={() => !save.loading && setFormOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,18,40,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            style={{
              width: "min(520px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(15,18,40,.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div style={{ fontSize: "19px", fontWeight: 700, color: "#272727" }}>
                {editingId ? "Chỉnh sửa thành viên" : "Thêm thành viên"}
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                style={{ background: "none", border: 0, cursor: "pointer", fontSize: 22, color: "#585c7b", lineHeight: 1 }}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Họ và tên *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Quan hệ</label>
                  <input
                    style={inputStyle}
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Vợ / Con trai..."
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Giới tính</label>
                  <select
                    style={inputStyle}
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="">— Chọn —</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Ngày sinh</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Số điện thoại</label>
                  <input
                    style={inputStyle}
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="0912 345 678"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Loại giấy tờ</label>
                  <select
                    style={inputStyle}
                    value={form.docType}
                    onChange={(e) => setForm({ ...form, docType: e.target.value })}
                  >
                    <option value="">— Không —</option>
                    <option value="cccd">CCCD</option>
                    <option value="cmnd">CMND</option>
                    <option value="passport">Hộ chiếu</option>
                    <option value="birth_certificate">Giấy khai sinh</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Số giấy tờ</label>
                  <input
                    style={inputStyle}
                    value={form.docNumber}
                    onChange={(e) => setForm({ ...form, docNumber: e.target.value })}
                    placeholder="079 190 015 820"
                    disabled={!form.docType}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Ghi chú</label>
                <textarea
                  style={{ ...inputStyle, height: "auto", minHeight: "70px", padding: "10px 13px", resize: "vertical" }}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ghi chú thêm..."
                />
              </div>

              {save.error && (
                <div style={{ fontSize: "13px", color: "#ef4444", fontWeight: 500 }}>{save.error}</div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={save.loading}
                style={{
                  padding: "11px 18px",
                  background: "#fff",
                  border: "1px solid #d4d7e5",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#3e4265",
                  cursor: "pointer",
                }}
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={save.loading}
                style={{
                  padding: "11px 18px",
                  background: "#4137f9",
                  border: 0,
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#fff",
                  cursor: save.loading ? "default" : "pointer",
                  opacity: save.loading ? 0.7 : 1,
                }}
              >
                {save.loading ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm thành viên"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
