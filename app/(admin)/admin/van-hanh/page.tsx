"use client";

import { useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useAdminList, inputStyle, labelStyle } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AdminPagination } from "@/components/admin/Pagination";
import { AdminModal, StatCard } from "@/components/admin/ui";

interface WorkOrder {
  id: string;
  code: string;
  name: string;
  category: string;
  status: string;
  priority: string;
  requesterName: string | null;
  overdueDays: number | null;
  occurredAt: string;
}
interface OpsOverview {
  processing: number;
  completed: number;
  overdue: number;
  systems: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  electricity: "Điện",
  water: "Nước",
  elevator: "Thang máy",
  fire_safety: "PCCC",
  common_area: "Khu chung",
  other: "Khác",
};
const CATEGORIES = Object.entries(CATEGORY_LABEL);
const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  processing: { label: "Đang xử lý", cls: "s-blue" },
  completed: { label: "Hoàn thành", cls: "s-green" },
  overdue: { label: "Quá hạn", cls: "s-red" },
};
const PRIORITY_PILL: Record<string, { label: string; cls: string }> = {
  high: { label: "Khẩn cấp", cls: "s-red" },
  medium: { label: "Trung bình", cls: "s-amber" },
  low: { label: "Thấp", cls: "s-gray" },
};

interface WoForm {
  name: string;
  category: string;
  priority: string;
  requesterName: string;
}
const EMPTY: WoForm = { name: "", category: "electricity", priority: "medium", requesterName: "" };

export default function AdminVanHanhPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { items, meta, loading, refetch } = useAdminList<WorkOrder>("/admin/operations/work-orders", {
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
  });
  const { data: ov, refetch: refetchOv } = useApiData<OpsOverview>("/admin/operations/overview");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<WoForm>(EMPTY);

  const save = useAction(() =>
    apiPost("/admin/operations/work-orders", {
      name: form.name.trim(),
      category: form.category,
      priority: form.priority,
      requesterName: form.requesterName.trim() || undefined,
    }),
  );
  const setStatusAction = useAction((id: string, st: string) => apiPatch(`/admin/operations/work-orders/${id}`, { status: st }));
  const remove = useAction((id: string) => apiDelete(`/admin/operations/work-orders/${id}`));

  function refetchAll() {
    refetch();
    refetchOv();
  }
  function openAdd() {
    setForm(EMPTY);
    save.setError(null);
    setOpen(true);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      save.setError("Vui lòng nhập tên công việc");
      return;
    }
    const res = await save.run();
    if (res !== undefined) {
      setOpen(false);
      toast.success("Đã tạo lệnh công việc");
      refetchAll();
    } else if (save.error) toast.error(save.error);
  }
  async function complete(w: WorkOrder) {
    const res = await setStatusAction.run(w.id, "completed");
    if (res !== undefined) {
      toast.success("Đã hoàn thành công việc");
      refetchAll();
    }
  }
  async function handleDelete(w: WorkOrder) {
    if (typeof window !== "undefined" && !window.confirm(`Xoá lệnh "${w.name}"?`)) return;
    const res = await remove.run(w.id);
    if (res !== undefined) {
      toast.success("Đã xoá lệnh công việc");
      refetchAll();
    }
  }

  return (
    <div className="adm-r-van-hanh">
      <div className="mg-page">
        <div className="mg-hd">
          <div>
            <h1 className="mg-title">Vận hành & Bảo trì</h1>
            <p className="mg-sub">Quản lý lệnh công việc, lịch bảo trì và tình trạng thiết bị</p>
          </div>
          <button className="mg-btn" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tạo lệnh công việc
          </button>
        </div>

        <div className="mg-stats">
          <StatCard bg="#eff4ff" color="#2f7bf6" label="Đang xử lý" value={ov?.processing ?? "—"}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </StatCard>
          <StatCard bg="#e6f7f1" color="#1c9d5f" label="Hoàn thành" value={ov?.completed ?? "—"}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </StatCard>
          <StatCard bg="#ffeded" color="#f5222d" label="Quá hạn" value={ov?.overdue ?? "—"}>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </StatCard>
          <StatCard bg="#efeeff" color="#4137f9" label="Hệ thống" value={ov?.systems ?? "—"}>
            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" />
          </StatCard>
        </div>

        <div className="mg-toolbar">
          <div className="mg-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Tìm theo tên / mã..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ ...inputStyle, width: "auto", height: 40 }}>
            <option value="">Mọi trạng thái</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="overdue">Quá hạn</option>
          </select>
        </div>

        <div className="mg-card">
          <table className="mg-tbl">
            <thead>
              <tr><th>Mã</th><th>Công việc</th><th>Hạng mục</th><th>Ưu tiên</th><th>Trạng thái</th><th>Ngày</th><th>Tác vụ</th></tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, color: "#585c7b" }}>Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, color: "#585c7b" }}>Chưa có lệnh công việc nào</td></tr>
              ) : (
                items.map((w) => {
                  const sp = STATUS_PILL[w.status] ?? { label: w.status, cls: "s-gray" };
                  const pp = PRIORITY_PILL[w.priority] ?? { label: w.priority, cls: "s-gray" };
                  return (
                    <tr key={w.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-272727)" }}>{w.code}</td>
                      <td>{w.name}</td>
                      <td>{CATEGORY_LABEL[w.category] ?? w.category}</td>
                      <td><span className={`mg-pill ${pp.cls}`}>{pp.label}</span></td>
                      <td><span className={`mg-pill ${sp.cls}`}>{sp.label}</span></td>
                      <td>{formatDate(w.occurredAt)}</td>
                      <td>
                        <div className="mg-act-btns">
                          {w.status !== "completed" && (
                            <button className="mg-icon-btn" title="Hoàn thành" onClick={() => complete(w)} disabled={setStatusAction.loading}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </button>
                          )}
                          <button className="mg-icon-btn" title="Xoá" onClick={() => handleDelete(w)} disabled={remove.loading}>
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
          <AdminPagination meta={meta} page={page} onPage={setPage} unit="lệnh" loading={loading} />
        </div>
      </div>

      {open && (
        <AdminModal title="Tạo lệnh công việc" onClose={() => setOpen(false)} onSubmit={submit} submitting={save.loading} submitLabel="Tạo lệnh" error={save.error}>
          <div>
            <label style={labelStyle}>Tên công việc *</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sửa thang máy block A..." />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Hạng mục</label>
              <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Ưu tiên</label>
              <select style={inputStyle} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Khẩn cấp</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Người yêu cầu</label>
            <input style={inputStyle} value={form.requesterName} onChange={(e) => setForm({ ...form, requesterName: e.target.value })} placeholder="Tên cư dân / BQL" />
          </div>
        </AdminModal>
      )}
    </div>
  );
}
