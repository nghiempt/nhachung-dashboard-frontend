"use client";

import { useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useAdminList, inputStyle, labelStyle } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AdminPagination } from "@/components/admin/Pagination";
import { AdminModal, StatCard } from "@/components/admin/ui";

interface Notif {
  id: string;
  title: string;
  category: string;
  isUrgent: boolean;
  viewCount: number;
  readCount: number;
  publishedAt: string;
}
interface NotifStats {
  total: number;
  urgent: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  urgent: "Khẩn cấp",
  maintenance: "Bảo trì",
  finance: "Tài chính",
  event: "Sự kiện",
  community: "Cộng đồng",
  announcement: "Thông báo",
  security: "An ninh",
};
const CATEGORIES = Object.entries(CATEGORY_LABEL);

interface NotifForm {
  title: string;
  body: string;
  category: string;
  isUrgent: boolean;
}
const EMPTY: NotifForm = { title: "", body: "", category: "announcement", isUrgent: false };

export default function AdminThongBaoPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { items, meta, loading, refetch } = useAdminList<Notif>("/admin/notifications", {
    page,
    limit: 10,
    search: search || undefined,
    category: category || undefined,
  });
  const { data: stats, refetch: refetchStats } = useApiData<NotifStats>("/admin/notifications/stats");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NotifForm>(EMPTY);

  const save = useAction(() => {
    const body = {
      title: form.title.trim(),
      body: form.body.trim() ? form.body.split("\n").map((s) => s.trim()).filter(Boolean) : undefined,
      category: form.category,
      isUrgent: form.isUrgent,
    };
    return editingId ? apiPatch(`/admin/notifications/${editingId}`, body) : apiPost("/admin/notifications", body);
  });
  const remove = useAction((id: string) => apiDelete(`/admin/notifications/${id}`));

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
  async function openEdit(n: Notif) {
    setEditingId(n.id);
    save.setError(null);
    // Seed from the list row so the modal opens instantly, then hydrate the
    // body paragraphs from the detail endpoint (the list payload omits them).
    setForm({ title: n.title, body: "", category: n.category, isUrgent: n.isUrgent });
    setOpen(true);
    try {
      const detail = await apiGet<{ title: string; body?: string[] | null; category: string; isUrgent: boolean }>(
        `/admin/notifications/${n.id}`,
      );
      setForm({
        title: detail.title,
        body: Array.isArray(detail.body) ? detail.body.join("\n") : "",
        category: detail.category,
        isUrgent: detail.isUrgent,
      });
    } catch {
      /* keep the list-seeded values if detail fetch fails */
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      save.setError("Vui lòng nhập tiêu đề");
      return;
    }
    const res = await save.run();
    if (res !== undefined) {
      setOpen(false);
      toast.success(editingId ? "Đã cập nhật thông báo" : "Đã phát thông báo");
      refetchAll();
    } else if (save.error) toast.error(save.error);
  }
  async function handleDelete(n: Notif) {
    if (typeof window !== "undefined" && !window.confirm(`Xoá thông báo "${n.title}"?`)) return;
    const res = await remove.run(n.id);
    if (res !== undefined) {
      toast.success("Đã xoá thông báo");
      refetchAll();
    }
  }

  return (
    <div className="adm-r-thong-bao">
      <div className="mg-page">
        <div className="mg-hd">
          <div>
            <h1 className="mg-title">Thông báo & Truyền thông</h1>
            <p className="mg-sub">Tạo, phát và theo dõi hiệu quả các thông báo gửi đến cư dân</p>
          </div>
          <button className="mg-btn" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tạo thông báo
          </button>
        </div>

        <div className="mg-stats">
          <StatCard bg="#efeeff" color="#4137f9" label="Tổng thông báo" value={stats?.total ?? "—"}>
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </StatCard>
          <StatCard bg="#ffeded" color="#f5222d" label="Khẩn cấp" value={stats?.urgent ?? "—"}>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </StatCard>
        </div>

        <div className="mg-toolbar">
          <div className="mg-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Tìm theo tiêu đề..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} style={{ ...inputStyle, width: "auto", height: 40 }}>
            <option value="">Mọi loại</option>
            {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div className="mg-card">
          <table className="mg-tbl">
            <thead>
              <tr><th>Tiêu đề</th><th>Loại</th><th>Lượt xem</th><th>Đã đọc</th><th>Ngày phát</th><th>Tác vụ</th></tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24, color: "#585c7b" }}>Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24, color: "#585c7b" }}>Chưa có thông báo nào</td></tr>
              ) : (
                items.map((n) => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-272727)" }}>
                      {n.isUrgent && <span className="mg-pill s-red" style={{ marginRight: 8 }}>Khẩn</span>}
                      {n.title}
                    </td>
                    <td><span className="mg-pill s-blue">{CATEGORY_LABEL[n.category] ?? n.category}</span></td>
                    <td>{n.viewCount}</td>
                    <td>{n.readCount}</td>
                    <td>{formatDate(n.publishedAt)}</td>
                    <td>
                      <div className="mg-act-btns">
                        <button className="mg-icon-btn" title="Sửa" onClick={() => openEdit(n)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="mg-icon-btn" title="Xoá" onClick={() => handleDelete(n)} disabled={remove.loading}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <AdminPagination meta={meta} page={page} onPage={setPage} unit="thông báo" loading={loading} />
        </div>
      </div>

      {open && (
        <AdminModal title={editingId ? "Cập nhật thông báo" : "Tạo thông báo"} onClose={() => setOpen(false)} onSubmit={submit} submitting={save.loading} submitLabel={editingId ? "Lưu thay đổi" : "Phát thông báo"} error={save.error}>
          <div>
            <label style={labelStyle}>Tiêu đề *</label>
            <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Thông báo bảo trì thang máy..." />
          </div>
          <div>
            <label style={labelStyle}>Nội dung (mỗi dòng là một đoạn)</label>
            <textarea style={{ ...inputStyle, height: "auto", minHeight: 110, padding: "10px 13px", resize: "vertical" }} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Nội dung thông báo..." />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Loại</label>
              <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, height: 42, fontSize: 14, color: "#3e4265" }}>
              <input type="checkbox" checked={form.isUrgent} onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })} />
              Khẩn cấp
            </label>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
