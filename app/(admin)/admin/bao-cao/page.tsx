"use client";

import { useState } from "react";
import { useAction } from "@/lib/hooks";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useAdminList, inputStyle, labelStyle } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AdminModal } from "@/components/admin/ui";

interface Report {
  id: string;
  title: string;
  periodType: string;
  periodLabel: string;
  status: string;
  category: string | null;
  url: string | null;
  responsibleName: string | null;
  createdAt: string;
}

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  draft: { label: "Chưa soạn", cls: "s-gray" },
  pending: { label: "Chờ duyệt", cls: "s-amber" },
  published: { label: "Đã phát hành", cls: "s-green" },
};

interface ReportForm {
  title: string;
  periodType: string;
  periodLabel: string;
  category: string;
  responsibleName: string;
}
const EMPTY: ReportForm = { title: "", periodType: "month", periodLabel: "", category: "finance", responsibleName: "" };

export default function AdminBaoCaoPage() {
  const toast = useToast();
  const { items, loading, refetch } = useAdminList<Report>("/admin/reports", { page: 1, limit: 50 });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ReportForm>(EMPTY);

  const save = useAction(() =>
    apiPost("/admin/reports", {
      title: form.title.trim(),
      periodType: form.periodType,
      periodLabel: form.periodLabel.trim(),
      category: form.category || undefined,
      responsibleName: form.responsibleName.trim() || undefined,
    }),
  );
  const publish = useAction((id: string) => apiPatch(`/admin/reports/${id}`, { status: "published" }));
  const remove = useAction((id: string) => apiDelete(`/admin/reports/${id}`));

  function openAdd() {
    setForm(EMPTY);
    save.setError(null);
    setOpen(true);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.periodLabel.trim()) {
      save.setError("Vui lòng nhập tiêu đề và kỳ báo cáo");
      return;
    }
    const res = await save.run();
    if (res !== undefined) {
      setOpen(false);
      toast.success("Đã tạo báo cáo");
      refetch();
    } else if (save.error) toast.error(save.error);
  }
  async function handlePublish(r: Report) {
    const res = await publish.run(r.id);
    if (res !== undefined) {
      toast.success("Đã phát hành báo cáo");
      refetch();
    }
  }
  async function handleDelete(r: Report) {
    if (typeof window !== "undefined" && !window.confirm(`Xoá báo cáo "${r.title}"?`)) return;
    const res = await remove.run(r.id);
    if (res !== undefined) {
      toast.success("Đã xoá báo cáo");
      refetch();
    }
  }

  return (
    <div className="adm-r-bao-cao">
      <div className="bc-page">
        <div className="bc-hd">
          <div>
            <h1 className="bc-title">Báo cáo & Thống kê</h1>
            <p className="bc-sub">Tạo, xem và xuất các báo cáo định kỳ về hoạt động tòa nhà</p>
          </div>
          <div className="bc-period" onClick={openAdd} style={{ cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Tạo báo cáo
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div style={{ padding: 24, color: "#585c7b" }}>Đang tải...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 24, color: "#585c7b" }}>Chưa có báo cáo nào. Bấm “Tạo báo cáo” để bắt đầu.</div>
        ) : (
          <div className="bc-grid">
            {items.map((r) => {
              const sp = STATUS_PILL[r.status] ?? { label: r.status, cls: "s-gray" };
              return (
                <div className="bc-card" key={r.id}>
                  <div className="bc-top">
                    <div className="bc-ic" style={{ background: "#efeeff" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
                    </div>
                    <div>
                      <div className="bc-name">{r.title}</div>
                      <div className="bc-meta">{r.periodLabel} • <span className={`mg-pill ${sp.cls}`}>{sp.label}</span></div>
                    </div>
                  </div>
                  <div className="bc-desc">
                    {r.responsibleName ? `Phụ trách: ${r.responsibleName} • ` : ""}Tạo {formatDate(r.createdAt)}
                  </div>
                  <div className="bc-actions">
                    {r.url ? (
                      <a className="bc-a" href={r.url} target="_blank" rel="noreferrer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> Xem
                      </a>
                    ) : (
                      <span className="bc-a" style={{ opacity: 0.5 }}>Chưa có tệp</span>
                    )}
                    {r.status !== "published" && (
                      <a className="bc-a primary" onClick={() => handlePublish(r)} style={{ cursor: "pointer" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Phát hành
                      </a>
                    )}
                    <a className="bc-a" onClick={() => handleDelete(r)} style={{ cursor: "pointer", color: "#ef4444" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg> Xoá
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {open && (
        <AdminModal title="Tạo báo cáo" onClose={() => setOpen(false)} onSubmit={submit} submitting={save.loading} submitLabel="Tạo báo cáo" error={save.error}>
          <div>
            <label style={labelStyle}>Tiêu đề *</label>
            <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Báo cáo tài chính tháng 5/2026" />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Loại kỳ</label>
              <select style={inputStyle} value={form.periodType} onChange={(e) => setForm({ ...form, periodType: e.target.value })}>
                <option value="month">Tháng</option>
                <option value="quarter">Quý</option>
                <option value="year">Năm</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Kỳ báo cáo *</label>
              <input style={inputStyle} value={form.periodLabel} onChange={(e) => setForm({ ...form, periodLabel: e.target.value })} placeholder="Tháng 5/2026" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Danh mục</label>
              <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="finance">Tài chính</option>
                <option value="operations">Vận hành</option>
                <option value="security">An ninh</option>
                <option value="board">Ban quản trị</option>
                <option value="maintenance">Bảo trì</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Người phụ trách</label>
              <input style={inputStyle} value={form.responsibleName} onChange={(e) => setForm({ ...form, responsibleName: e.target.value })} />
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
