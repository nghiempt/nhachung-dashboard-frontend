"use client";

import { useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useAdminList, inputStyle, labelStyle } from "@/lib/admin";
import { useToast } from "@/components/ui/Toast";
import { AdminPagination } from "@/components/admin/Pagination";
import { AdminModal, StatCard } from "@/components/admin/ui";

interface Apt {
  id: string;
  code: string;
  block: string | null;
  floor: number | null;
  areaSqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  status: string;
  residentCount: number;
  familyCount: number;
}
interface AptStats {
  total: number;
  occupied: number;
  vacant: number;
}

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  active: { label: "Đang ở", cls: "s-green" },
  vacant: { label: "Trống", cls: "s-gray" },
  maintenance: { label: "Bảo trì", cls: "s-amber" },
};

interface AptForm {
  code: string;
  block: string;
  floor: string;
  areaSqm: string;
  bedrooms: string;
  bathrooms: string;
  status: string;
}
const EMPTY: AptForm = { code: "", block: "", floor: "", areaSqm: "", bedrooms: "", bathrooms: "", status: "active" };

export default function AdminCanHoPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { items, meta, loading, refetch } = useAdminList<Apt>("/admin/apartments", {
    page,
    limit: 10,
    search: search || undefined,
  });
  const { data: stats, refetch: refetchStats } = useApiData<AptStats>("/admin/apartments/stats");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AptForm>(EMPTY);

  const save = useAction(() => {
    const body = {
      code: form.code.trim(),
      block: form.block.trim() || undefined,
      floor: form.floor ? Number(form.floor) : undefined,
      areaSqm: form.areaSqm ? Number(form.areaSqm) : undefined,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      status: form.status,
    };
    return editingId ? apiPatch(`/admin/apartments/${editingId}`, body) : apiPost("/admin/apartments", body);
  });
  const remove = useAction((id: string) => apiDelete(`/admin/apartments/${id}`));

  function refetchAll() {
    refetch();
    refetchStats();
  }
  function openAdd() {
    setEditingId(null);
    setForm(EMPTY);
    save.setError(null);
    setOpen(true);
  }
  function openEdit(a: Apt) {
    setEditingId(a.id);
    setForm({
      code: a.code,
      block: a.block ?? "",
      floor: a.floor?.toString() ?? "",
      areaSqm: a.areaSqm?.toString() ?? "",
      bedrooms: a.bedrooms?.toString() ?? "",
      bathrooms: a.bathrooms?.toString() ?? "",
      status: a.status,
    });
    save.setError(null);
    setOpen(true);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) {
      save.setError("Vui lòng nhập mã căn hộ");
      return;
    }
    const res = await save.run();
    if (res !== undefined) {
      setOpen(false);
      toast.success(editingId ? "Đã cập nhật căn hộ" : "Đã thêm căn hộ");
      refetchAll();
    } else if (save.error) toast.error(save.error);
  }
  async function handleDelete(a: Apt) {
    if (typeof window !== "undefined" && !window.confirm(`Xoá căn hộ ${a.code}?`)) return;
    const res = await remove.run(a.id);
    if (res !== undefined) {
      toast.success("Đã xoá căn hộ");
      refetchAll();
    }
  }

  return (
    <div className="adm-r-can-ho">
      <div className="mg-page">
        <div className="mg-hd">
          <div>
            <h1 className="mg-title">Quản lý căn hộ</h1>
            <p className="mg-sub">Theo dõi tình trạng, chủ hộ và thông tin các căn hộ trong tòa nhà</p>
          </div>
          <button className="mg-btn" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Thêm căn hộ
          </button>
        </div>

        <div className="mg-stats">
          <StatCard bg="#efeeff" color="#4137f9" label="Tổng căn hộ" value={stats?.total ?? "—"}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </StatCard>
          <StatCard bg="#e6f7f1" color="#1c9d5f" label="Đang ở" value={stats?.occupied ?? "—"}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          </StatCard>
          <StatCard bg="#fff3da" color="#c8761b" label="Còn trống" value={stats?.vacant ?? "—"}>
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
          </StatCard>
        </div>

        <div className="mg-toolbar">
          <div className="mg-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Tìm theo mã căn hộ..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="mg-card">
          <table className="mg-tbl">
            <thead>
              <tr><th>Căn hộ</th><th>Tháp</th><th>Tầng</th><th>Diện tích</th><th>PN/WC</th><th>Cư dân</th><th>Trạng thái</th><th>Tác vụ</th></tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 24, color: "#585c7b" }}>Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 24, color: "#585c7b" }}>Chưa có căn hộ nào</td></tr>
              ) : (
                items.map((a) => {
                  const sp = STATUS_PILL[a.status] ?? { label: a.status, cls: "s-gray" };
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-272727)" }}>{a.code}</td>
                      <td>{a.block ?? "—"}</td>
                      <td>{a.floor ?? "—"}</td>
                      <td>{a.areaSqm != null ? `${a.areaSqm} m²` : "—"}</td>
                      <td>{a.bedrooms ?? "—"}/{a.bathrooms ?? "—"}</td>
                      <td>{a.residentCount}</td>
                      <td><span className={`mg-pill ${sp.cls}`}>{sp.label}</span></td>
                      <td>
                        <div className="mg-act-btns">
                          <button className="mg-icon-btn" title="Sửa" onClick={() => openEdit(a)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="mg-icon-btn" title="Xoá" onClick={() => handleDelete(a)} disabled={remove.loading}>
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
          <AdminPagination meta={meta} page={page} onPage={setPage} unit="căn hộ" loading={loading} />
        </div>
      </div>

      {open && (
        <AdminModal title={editingId ? "Chỉnh sửa căn hộ" : "Thêm căn hộ"} onClose={() => setOpen(false)} onSubmit={submit} submitting={save.loading} submitLabel={editingId ? "Lưu thay đổi" : "Thêm căn hộ"} error={save.error}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Mã căn hộ *</label>
              <input style={inputStyle} value={form.code} disabled={!!editingId} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="A-12.05" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Tháp / Block</label>
              <input style={inputStyle} value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} placeholder="Tháp A" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Tầng</label>
              <input type="number" style={inputStyle} value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Diện tích (m²)</label>
              <input type="number" style={inputStyle} value={form.areaSqm} onChange={(e) => setForm({ ...form, areaSqm: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Phòng ngủ</label>
              <input type="number" style={inputStyle} value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Phòng tắm</label>
              <input type="number" style={inputStyle} value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Trạng thái</label>
              <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Đang ở</option>
                <option value="vacant">Trống</option>
                <option value="maintenance">Bảo trì</option>
              </select>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
