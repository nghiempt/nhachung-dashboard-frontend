"use client";

import { useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useAdminList, inputStyle, labelStyle, btnPrimary, btnGhost } from "@/lib/admin";
import { useToast } from "@/components/ui/Toast";
import { AdminPagination } from "@/components/admin/Pagination";

interface Resident {
  id: string;
  accountId: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  apartmentCode: string | null;
  role: string;
  isOwner: boolean;
  displayRole: string;
  verified: boolean;
  status: "verified" | "pending";
}
interface ResidentStats {
  total: number;
  owners: number;
  verified: number;
  pending: number;
}

const ROLE_PILL: Record<string, { label: string; cls: string }> = {
  owner: { label: "Chủ hộ", cls: "s-violet" },
  member: { label: "Thành viên", cls: "s-blue" },
  admin: { label: "Quản trị", cls: "s-violet" },
  manager: { label: "Ban quản lý", cls: "s-violet" },
};

const PALETTE = ["#4137f9", "#e8736d", "#41c69c", "#c8761b", "#5a3ad9", "#2f7bf6", "#1c9d5f"];
function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[p.length - 2]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase() || name.slice(0, 2).toUpperCase();
}

interface ResidentForm {
  email: string;
  fullName: string;
  phoneNumber: string;
  apartmentCode: string;
  role: string;
  isOwner: boolean;
}
const EMPTY: ResidentForm = { email: "", fullName: "", phoneNumber: "", apartmentCode: "", role: "resident", isOwner: false };

export default function AdminCuDanPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { items, meta, loading, refetch } = useAdminList<Resident>("/admin/residents", {
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
  });
  const { data: stats, refetch: refetchStats } = useApiData<ResidentStats>("/admin/residents/stats");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ResidentForm>(EMPTY);

  const save = useAction(async () => {
    if (editingId) {
      await apiPatch(`/admin/residents/${editingId}`, {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        apartmentCode: form.apartmentCode.trim() || undefined,
        role: form.role,
        isOwner: form.isOwner,
      });
    } else {
      await apiPost("/admin/residents", {
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        apartmentCode: form.apartmentCode.trim() || undefined,
        role: form.role,
        isOwner: form.isOwner,
      });
    }
  });
  const verify = useAction((id: string) => apiPost(`/admin/residents/${id}/verify`, {}));
  const remove = useAction((id: string) => apiDelete(`/admin/residents/${id}`));

  function refetchAll() {
    refetch();
    refetchStats();
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY);
    save.setError(null);
    setFormOpen(true);
  }
  function openEdit(r: Resident) {
    setEditingId(r.id);
    setForm({
      email: r.email,
      fullName: r.fullName,
      phoneNumber: r.phoneNumber ?? "",
      apartmentCode: r.apartmentCode ?? "",
      role: r.role,
      isOwner: r.isOwner,
    });
    save.setError(null);
    setFormOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim() || (!editingId && !form.email.trim())) {
      save.setError("Vui lòng nhập email và họ tên");
      return;
    }
    const res = await save.run();
    if (res !== undefined) {
      setFormOpen(false);
      toast.success(editingId ? "Đã cập nhật cư dân" : "Đã thêm cư dân");
      refetchAll();
    } else if (save.error) {
      toast.error(save.error);
    }
  }
  async function handleVerify(r: Resident) {
    const res = await verify.run(r.id);
    if (res !== undefined) {
      toast.success(`Đã xác minh ${r.fullName}`);
      refetchAll();
    }
  }
  async function handleDelete(r: Resident) {
    if (typeof window !== "undefined" && !window.confirm(`Xoá cư dân "${r.fullName}" khỏi tòa nhà?`)) return;
    const res = await remove.run(r.id);
    if (res !== undefined) {
      toast.success("Đã xoá cư dân");
      refetchAll();
    }
  }

  return (
    <div className="adm-r-cu-dan">
      <div className="mg-page">
        <div className="mg-hd">
          <div>
            <h1 className="mg-title">Quản lý cư dân</h1>
            <p className="mg-sub">Quản lý thông tin, vai trò và trạng thái xác minh của cư dân tòa nhà</p>
          </div>
          <button className="mg-btn" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Thêm cư dân
          </button>
        </div>

        <div className="mg-stats">
          <Stat color="#4137f9" bg="#efeeff" label="Tổng cư dân" value={stats?.total} />
          <Stat color="#5a3ad9" bg="#efeaff" label="Chủ hộ" value={stats?.owners} />
          <Stat color="#1c9d5f" bg="#e6f7f1" label="Đã xác minh" value={stats?.verified} />
          <Stat color="#c8761b" bg="#fff3da" label="Chờ duyệt" value={stats?.pending} />
        </div>

        <div className="mg-toolbar">
          <div className="mg-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Tìm theo tên, email, SĐT, căn hộ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            style={{ ...inputStyle, width: "auto", height: 40 }}
          >
            <option value="">Mọi trạng thái</option>
            <option value="verified">Đã xác minh</option>
            <option value="pending">Chờ duyệt</option>
          </select>
        </div>

        <div className="mg-card">
          <table className="mg-tbl">
            <thead>
              <tr>
                <th>Cư dân</th><th>Căn hộ</th><th>Số điện thoại</th><th>Vai trò</th><th>Trạng thái</th><th>Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24, color: "#585c7b" }}>Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24, color: "#585c7b" }}>Không có cư dân nào</td></tr>
              ) : (
                items.map((r, i) => {
                  const pill = ROLE_PILL[r.displayRole] ?? { label: r.displayRole, cls: "s-gray" };
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="mg-person">
                          <div className="mg-ava" style={{ background: PALETTE[i % PALETTE.length] }}>{initials(r.fullName)}</div>
                          <div>
                            <div className="mg-pname">{r.fullName}</div>
                            <div className="mg-pmeta">{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="mg-code" style={{ fontWeight: 600, color: "var(--text-272727)" }}>{r.apartmentCode ?? "—"}</span></td>
                      <td>{r.phoneNumber ?? "—"}</td>
                      <td><span className={`mg-pill ${pill.cls}`}>{pill.label}</span></td>
                      <td><span className={`mg-pill ${r.verified ? "s-green" : "s-amber"}`}>{r.verified ? "Đã xác minh" : "Chờ duyệt"}</span></td>
                      <td>
                        <div className="mg-act-btns">
                          {!r.verified && (
                            <button className="mg-icon-btn" title="Duyệt xác minh" onClick={() => handleVerify(r)} disabled={verify.loading}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </button>
                          )}
                          <button className="mg-icon-btn" title="Sửa" onClick={() => openEdit(r)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="mg-icon-btn" title="Xoá" onClick={() => handleDelete(r)} disabled={remove.loading}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <AdminPagination meta={meta} page={page} onPage={setPage} unit="cư dân" loading={loading} />
        </div>
      </div>

      {formOpen && (
        <div style={overlay} onMouseDown={(e) => { if (e.target === e.currentTarget && !save.loading) setFormOpen(false); }}>
          <form onSubmit={submit} style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#272727" }}>{editingId ? "Chỉnh sửa cư dân" : "Thêm cư dân"}</div>
              <button type="button" onClick={() => setFormOpen(false)} style={closeBtn} aria-label="Đóng">×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} value={form.email} disabled={!!editingId} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="cudan@email.com" />
              </div>
              <div>
                <label style={labelStyle}>Họ và tên *</label>
                <input style={inputStyle} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Nguyễn Văn A" />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Số điện thoại</label>
                  <input style={inputStyle} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="0901 234 567" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Mã căn hộ</label>
                  <input style={inputStyle} value={form.apartmentCode} onChange={(e) => setForm({ ...form, apartmentCode: e.target.value })} placeholder="A-12.05" />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Vai trò</label>
                  <select style={inputStyle} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="resident">Cư dân</option>
                    <option value="manager">Ban quản lý</option>
                    <option value="admin">Quản trị</option>
                  </select>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, height: 42, fontSize: 14, color: "#3e4265" }}>
                  <input type="checkbox" checked={form.isOwner} onChange={(e) => setForm({ ...form, isOwner: e.target.checked })} />
                  Là chủ hộ
                </label>
              </div>
              {save.error && <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 500 }}>{save.error}</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button type="button" onClick={() => setFormOpen(false)} disabled={save.loading} style={btnGhost}>Huỷ</button>
              <button type="submit" disabled={save.loading} style={{ ...btnPrimary, opacity: save.loading ? 0.7 : 1 }}>
                {save.loading ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm cư dân"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Stat({ color, bg, label, value }: { color: string; bg: string; label: string; value?: number }) {
  return (
    <div className="mg-stat">
      <div className="mg-stat-ic" style={{ background: bg }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        </svg>
      </div>
      <div>
        <div className="mg-stat-val">{value == null ? "—" : value.toLocaleString("vi-VN")}</div>
        <div className="mg-stat-lbl">{label}</div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,18,40,.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 20,
};
const modalCard: React.CSSProperties = {
  width: "min(540px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 20px 60px rgba(15,18,40,.25)",
};
const closeBtn: React.CSSProperties = { background: "none", border: 0, cursor: "pointer", fontSize: 22, color: "#585c7b", lineHeight: 1 };
