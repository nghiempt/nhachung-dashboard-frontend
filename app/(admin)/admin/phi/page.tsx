"use client";

import { useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useAdminList, inputStyle, labelStyle } from "@/lib/admin";
import { formatVnd, formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AdminPagination } from "@/components/admin/Pagination";
import { AdminModal, StatCard } from "@/components/admin/ui";

interface Fee {
  id: string;
  apartmentCode: string;
  ownerName: string | null;
  period: string;
  name: string;
  amount: number;
  status: string;
  dueDate: string | null;
}
interface FeeStats {
  totalReceivable: number;
  collected: number;
  outstanding: number;
  unitsUnpaid: number;
  collectionRate: number;
}

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  paid: { label: "Đã thu", cls: "s-green" },
  unpaid: { label: "Chưa nộp", cls: "s-amber" },
  overdue: { label: "Quá hạn", cls: "s-red" },
};

interface FeeForm {
  apartmentCode: string;
  period: string;
  name: string;
  amount: string;
  dueDate: string;
}
const EMPTY: FeeForm = { apartmentCode: "", period: "", name: "Phí dịch vụ", amount: "", dueDate: "" };

export default function AdminPhiPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { items, meta, loading, refetch } = useAdminList<Fee>("/admin/fees", {
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
  });
  const { data: stats, refetch: refetchStats } = useApiData<FeeStats>("/admin/fees/stats");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FeeForm>(EMPTY);

  const save = useAction(() =>
    apiPost("/admin/fees", {
      apartmentCode: form.apartmentCode.trim(),
      period: form.period.trim(),
      name: form.name.trim(),
      amount: Number(form.amount),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
    }),
  );
  const pay = useAction((id: string) => apiPost(`/admin/fees/${id}/mark-paid`, {}));
  const remove = useAction((id: string) => apiDelete(`/admin/fees/${id}`));

  function refetchAll() {
    refetch();
    refetchStats();
  }
  function openAdd() {
    setForm(EMPTY);
    save.setError(null);
    setOpen(true);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.apartmentCode.trim() || !form.period.trim() || !form.amount) {
      save.setError("Vui lòng nhập căn hộ, kỳ phí và số tiền");
      return;
    }
    const res = await save.run();
    if (res !== undefined) {
      setOpen(false);
      toast.success("Đã lập hóa đơn");
      refetchAll();
    } else if (save.error) toast.error(save.error);
  }
  async function handlePay(f: Fee) {
    const res = await pay.run(f.id);
    if (res !== undefined) {
      toast.success(`Đã thu phí căn ${f.apartmentCode}`);
      refetchAll();
    }
  }
  async function handleDelete(f: Fee) {
    if (typeof window !== "undefined" && !window.confirm(`Xoá hóa đơn căn ${f.apartmentCode} (${f.period})?`)) return;
    const res = await remove.run(f.id);
    if (res !== undefined) {
      toast.success("Đã xoá hóa đơn");
      refetchAll();
    }
  }

  return (
    <div className="adm-r-phi">
      <div className="mg-page">
        <div className="mg-hd">
          <div>
            <h1 className="mg-title">Quản lý phí dịch vụ</h1>
            <p className="mg-sub">Lập hóa đơn, theo dõi và đối soát thu phí dịch vụ hàng tháng</p>
          </div>
          <button className="mg-btn" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Lập hóa đơn
          </button>
        </div>

        <div className="mg-stats">
          <StatCard bg="#efeeff" color="#4137f9" label="Tổng phải thu" value={formatVnd(stats?.totalReceivable)}>
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </StatCard>
          <StatCard bg="#e6f7f1" color="#1c9d5f" label={`Đã thu (${stats?.collectionRate ?? 0}%)`} value={formatVnd(stats?.collected)}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </StatCard>
          <StatCard bg="#fff3da" color="#c8761b" label="Còn nợ" value={formatVnd(stats?.outstanding)}>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </StatCard>
          <StatCard bg="#ffeded" color="#f5222d" label="Hộ chưa nộp" value={stats?.unitsUnpaid ?? "—"}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </StatCard>
        </div>

        <div className="mg-toolbar">
          <div className="mg-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Tìm theo mã căn hộ..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ ...inputStyle, width: "auto", height: 40 }}>
            <option value="">Mọi trạng thái</option>
            <option value="paid">Đã thu</option>
            <option value="unpaid">Chưa nộp</option>
            <option value="overdue">Quá hạn</option>
          </select>
        </div>

        <div className="mg-card">
          <table className="mg-tbl">
            <thead>
              <tr><th>Căn hộ</th><th>Chủ hộ</th><th>Kỳ phí</th><th>Số tiền</th><th>Hạn nộp</th><th>Trạng thái</th><th>Tác vụ</th></tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, color: "#585c7b" }}>Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, color: "#585c7b" }}>Chưa có hóa đơn nào</td></tr>
              ) : (
                items.map((f) => {
                  const pill = STATUS_PILL[f.status] ?? { label: f.status, cls: "s-gray" };
                  return (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-272727)" }}>{f.apartmentCode}</td>
                      <td>{f.ownerName ?? "—"}</td>
                      <td>{f.period}</td>
                      <td style={{ fontWeight: 600, color: "var(--text-272727)" }}>{formatVnd(f.amount)}</td>
                      <td>{f.dueDate ? formatDate(f.dueDate) : "—"}</td>
                      <td><span className={`mg-pill ${pill.cls}`}>{pill.label}</span></td>
                      <td>
                        <div className="mg-act-btns">
                          {f.status !== "paid" && (
                            <button className="mg-icon-btn" title="Đánh dấu đã thu" onClick={() => handlePay(f)} disabled={pay.loading}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </button>
                          )}
                          <button className="mg-icon-btn" title="Xoá" onClick={() => handleDelete(f)} disabled={remove.loading}>
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
          <AdminPagination meta={meta} page={page} onPage={setPage} unit="hóa đơn" loading={loading} />
        </div>
      </div>

      {open && (
        <AdminModal title="Lập hóa đơn phí" onClose={() => setOpen(false)} onSubmit={submit} submitting={save.loading} submitLabel="Lập hóa đơn" error={save.error}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Mã căn hộ *</label>
              <input style={inputStyle} value={form.apartmentCode} onChange={(e) => setForm({ ...form, apartmentCode: e.target.value })} placeholder="A-12.05" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Kỳ phí *</label>
              <input style={inputStyle} value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="2026-05" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Tên khoản phí</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Số tiền (VND) *</label>
              <input type="number" style={inputStyle} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="2850000" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Hạn nộp</label>
              <input type="date" style={inputStyle} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
