"use client";

import { useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { inputStyle, labelStyle } from "@/lib/admin";
import { formatVnd } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AdminModal, StatCard } from "@/components/admin/ui";

interface Fund {
  balance: number;
  totalCollected: number;
  totalSpent: number;
  interestIncome: number;
  bankName: string | null;
  interestRate: number | null;
}
interface Job {
  id: string;
  name: string;
  contractor: string | null;
  status: string;
  amount: number | null;
  estimatedCost: number | null;
  scheduledPeriod: string | null;
}

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  completed: { label: "Hoàn thành", cls: "s-green" },
  in_progress: { label: "Đang thực hiện", cls: "s-blue" },
  planned: { label: "Đã lên KH", cls: "s-amber" },
  tentative: { label: "Dự kiến", cls: "s-gray" },
};

interface JobForm {
  name: string;
  status: string;
  contractor: string;
  amount: string;
  estimatedCost: string;
  scheduledPeriod: string;
}
const EMPTY: JobForm = { name: "", status: "planned", contractor: "", amount: "", estimatedCost: "", scheduledPeriod: "" };

export default function AdminQuyBaoTriPage() {
  const toast = useToast();
  const { data: fund, refetch: refetchFund } = useApiData<Fund>("/admin/fund/overview");
  const { data: jobs, loading, refetch } = useApiData<Job[]>("/admin/fund/jobs");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<JobForm>(EMPTY);

  const save = useAction(() =>
    apiPost("/admin/fund/jobs", {
      name: form.name.trim(),
      status: form.status,
      contractor: form.contractor.trim() || undefined,
      amount: form.amount ? Number(form.amount) : undefined,
      estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
      scheduledPeriod: form.scheduledPeriod.trim() || undefined,
    }),
  );
  const remove = useAction((id: string) => apiDelete(`/admin/fund/jobs/${id}`));

  function openAdd() {
    setForm(EMPTY);
    save.setError(null);
    setOpen(true);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      save.setError("Vui lòng nhập tên hạng mục");
      return;
    }
    const res = await save.run();
    if (res !== undefined) {
      setOpen(false);
      toast.success("Đã ghi nhận hạng mục");
      refetch();
      refetchFund();
    } else if (save.error) toast.error(save.error);
  }
  async function handleDelete(j: Job) {
    if (typeof window !== "undefined" && !window.confirm(`Xoá hạng mục "${j.name}"?`)) return;
    const res = await remove.run(j.id);
    if (res !== undefined) {
      toast.success("Đã xoá hạng mục");
      refetch();
    }
  }

  const list = jobs ?? [];

  return (
    <div className="adm-r-quy-bao-tri">
      <div className="mg-page">
        <div className="mg-hd">
          <div>
            <h1 className="mg-title">Quỹ bảo trì</h1>
            <p className="mg-sub">Quản lý số dư, thu chi và các hạng mục bảo trì tòa nhà</p>
          </div>
          <button className="mg-btn" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ghi nhận hạng mục
          </button>
        </div>

        <div className="mg-stats">
          <StatCard bg="#efeeff" color="#4137f9" label="Số dư quỹ" value={formatVnd(fund?.balance)}>
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </StatCard>
          <StatCard bg="#e6f7f1" color="#1c9d5f" label="Đã thu" value={formatVnd(fund?.totalCollected)}>
            <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
          </StatCard>
          <StatCard bg="#ffeded" color="#f5222d" label="Đã chi" value={formatVnd(fund?.totalSpent)}>
            <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
          </StatCard>
          <StatCard bg="#fff3da" color="#c8761b" label="Lãi tích lũy" value={formatVnd(fund?.interestIncome)}>
            <path d="M23 6l-9.5 9.5-5-5L1 18" /><polyline points="17 6 23 6 23 12" />
          </StatCard>
        </div>

        <div className="mg-card">
          <table className="mg-tbl">
            <thead>
              <tr><th>Hạng mục</th><th>Nhà thầu</th><th>Kỳ</th><th>Dự toán</th><th>Thực chi</th><th>Trạng thái</th><th>Tác vụ</th></tr>
            </thead>
            <tbody>
              {loading && list.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, color: "#585c7b" }}>Đang tải...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, color: "#585c7b" }}>Chưa có hạng mục nào</td></tr>
              ) : (
                list.map((j) => {
                  const sp = STATUS_PILL[j.status] ?? { label: j.status, cls: "s-gray" };
                  return (
                    <tr key={j.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-272727)" }}>{j.name}</td>
                      <td>{j.contractor ?? "—"}</td>
                      <td>{j.scheduledPeriod ?? "—"}</td>
                      <td>{j.estimatedCost != null ? formatVnd(j.estimatedCost) : "—"}</td>
                      <td>{j.amount != null ? formatVnd(j.amount) : "—"}</td>
                      <td><span className={`mg-pill ${sp.cls}`}>{sp.label}</span></td>
                      <td>
                        <div className="mg-act-btns">
                          <button className="mg-icon-btn" title="Xoá" onClick={() => handleDelete(j)} disabled={remove.loading}>
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
        </div>
      </div>

      {open && (
        <AdminModal title="Ghi nhận hạng mục bảo trì" onClose={() => setOpen(false)} onSubmit={submit} submitting={save.loading} submitLabel="Lưu" error={save.error}>
          <div>
            <label style={labelStyle}>Tên hạng mục *</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sơn lại mặt tiền block B..." />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Trạng thái</label>
              <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="tentative">Dự kiến</option>
                <option value="planned">Đã lên KH</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Kỳ</label>
              <input style={inputStyle} value={form.scheduledPeriod} onChange={(e) => setForm({ ...form, scheduledPeriod: e.target.value })} placeholder="Q3/2026" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Nhà thầu</label>
            <input style={inputStyle} value={form.contractor} onChange={(e) => setForm({ ...form, contractor: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Dự toán (VND)</label>
              <input type="number" style={inputStyle} value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Thực chi (VND)</label>
              <input type="number" style={inputStyle} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
