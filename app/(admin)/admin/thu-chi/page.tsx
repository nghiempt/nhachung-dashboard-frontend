"use client";

import { useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPost, apiDelete } from "@/lib/api";
import { useAdminList, inputStyle, labelStyle } from "@/lib/admin";
import { formatVnd, formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AdminPagination } from "@/components/admin/Pagination";
import { AdminModal, StatCard } from "@/components/admin/ui";

interface Txn {
  id: string;
  code: string;
  type: string;
  category: string;
  description: string;
  vendorName: string | null;
  paymentMethod: string | null;
  amount: number;
  occurredAt: string;
}
interface TxnStats {
  income: number;
  expense: number;
  balance: number;
}

interface TxnForm {
  type: string;
  category: string;
  description: string;
  amount: string;
  vendorName: string;
  paymentMethod: string;
  occurredAt: string;
}
const EMPTY: TxnForm = { type: "income", category: "", description: "", amount: "", vendorName: "", paymentMethod: "Chuyển khoản", occurredAt: "" };

export default function AdminThuChiPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  const { items, meta, loading, refetch } = useAdminList<Txn>("/admin/transactions", {
    page,
    limit: 10,
    search: search || undefined,
    type: type || undefined,
  });
  const { data: stats, refetch: refetchStats } = useApiData<TxnStats>("/admin/transactions/stats");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TxnForm>(EMPTY);

  const save = useAction(() =>
    apiPost("/admin/transactions", {
      type: form.type,
      category: form.category.trim(),
      description: form.description.trim(),
      amount: Number(form.amount),
      vendorName: form.vendorName.trim() || undefined,
      paymentMethod: form.paymentMethod.trim() || undefined,
      occurredAt: form.occurredAt ? new Date(form.occurredAt).toISOString() : undefined,
    }),
  );
  const remove = useAction((id: string) => apiDelete(`/admin/transactions/${id}`));

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
    if (!form.category.trim() || !form.description.trim() || !form.amount) {
      save.setError("Vui lòng nhập danh mục, mô tả và số tiền");
      return;
    }
    const res = await save.run();
    if (res !== undefined) {
      setOpen(false);
      toast.success("Đã ghi nhận giao dịch");
      refetchAll();
    } else if (save.error) toast.error(save.error);
  }
  async function handleDelete(t: Txn) {
    if (typeof window !== "undefined" && !window.confirm(`Xoá giao dịch ${t.code}?`)) return;
    const res = await remove.run(t.id);
    if (res !== undefined) {
      toast.success("Đã xoá giao dịch");
      refetchAll();
    }
  }

  return (
    <div className="adm-r-thu-chi">
      <div className="mg-page">
        <div className="mg-hd">
          <div>
            <h1 className="mg-title">Quản lý thu chi</h1>
            <p className="mg-sub">Ghi nhận, phân loại và duyệt các khoản thu chi của tòa nhà</p>
          </div>
          <button className="mg-btn" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Thêm giao dịch
          </button>
        </div>

        <div className="mg-stats">
          <StatCard bg="#e6f7f1" color="#1c9d5f" label="Tổng thu" value={formatVnd(stats?.income)}>
            <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
          </StatCard>
          <StatCard bg="#ffeded" color="#f5222d" label="Tổng chi" value={formatVnd(stats?.expense)}>
            <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
          </StatCard>
          <StatCard bg="#efeeff" color="#4137f9" label="Số dư" value={formatVnd(stats?.balance)}>
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </StatCard>
        </div>

        <div className="mg-toolbar">
          <div className="mg-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Tìm theo mô tả / mã..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} style={{ ...inputStyle, width: "auto", height: 40 }}>
            <option value="">Tất cả</option>
            <option value="income">Khoản thu</option>
            <option value="expense">Khoản chi</option>
          </select>
        </div>

        <div className="mg-card">
          <table className="mg-tbl">
            <thead>
              <tr><th>Mã</th><th>Loại</th><th>Danh mục</th><th>Mô tả</th><th>Số tiền</th><th>Ngày</th><th>Tác vụ</th></tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, color: "#585c7b" }}>Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, color: "#585c7b" }}>Chưa có giao dịch nào</td></tr>
              ) : (
                items.map((t) => {
                  const isIncome = t.type === "income";
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-272727)" }}>{t.code}</td>
                      <td><span className={`mg-pill ${isIncome ? "s-green" : "s-red"}`}>{isIncome ? "Thu" : "Chi"}</span></td>
                      <td>{t.category}</td>
                      <td>{t.description}</td>
                      <td style={{ fontWeight: 600, color: isIncome ? "#1c9d5f" : "#f5222d" }}>{isIncome ? "+" : "−"}{formatVnd(t.amount)}</td>
                      <td>{formatDate(t.occurredAt)}</td>
                      <td>
                        <div className="mg-act-btns">
                          <button className="mg-icon-btn" title="Xoá" onClick={() => handleDelete(t)} disabled={remove.loading}>
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
          <AdminPagination meta={meta} page={page} onPage={setPage} unit="giao dịch" loading={loading} />
        </div>
      </div>

      {open && (
        <AdminModal title="Thêm giao dịch" onClose={() => setOpen(false)} onSubmit={submit} submitting={save.loading} submitLabel="Ghi nhận" error={save.error}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Loại *</label>
              <select style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="income">Khoản thu</option>
                <option value="expense">Khoản chi</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Danh mục *</label>
              <input style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Phí quản lý / Bảo trì..." />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Mô tả *</label>
            <input style={inputStyle} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Thu phí dịch vụ tháng 5..." />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Số tiền (VND) *</label>
              <input type="number" style={inputStyle} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="2850000" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Ngày</label>
              <input type="date" style={inputStyle} value={form.occurredAt} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Đối tác</label>
              <input style={inputStyle} value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} placeholder="Nhà thầu / cư dân" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Phương thức</label>
              <input style={inputStyle} value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} placeholder="Chuyển khoản" />
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
