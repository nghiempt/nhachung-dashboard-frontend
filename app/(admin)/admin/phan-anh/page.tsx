"use client";

import { useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPost, apiPatch } from "@/lib/api";
import { useAdminList, inputStyle, labelStyle } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AdminPagination } from "@/components/admin/Pagination";
import { AdminModal, StatCard } from "@/components/admin/ui";

interface Feedback {
  id: string;
  code: string;
  category: string;
  title: string;
  reporterName: string | null;
  location: string | null;
  status: string;
  priority: string;
  imageCount: number;
  createdAt: string;
}
interface FeedbackSummary {
  all: number;
  processing: number;
  awaiting: number;
  completed: number;
  rejected: number;
}

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  processing: { label: "Đang xử lý", cls: "s-blue" },
  awaiting: { label: "Chờ phản hồi", cls: "s-amber" },
  completed: { label: "Hoàn thành", cls: "s-green" },
  rejected: { label: "Từ chối", cls: "s-red" },
};
const PRIORITY_PILL: Record<string, { label: string; cls: string }> = {
  low: { label: "Thấp", cls: "s-gray" },
  medium: { label: "Trung bình", cls: "s-blue" },
  high: { label: "Cao", cls: "s-amber" },
  urgent: { label: "Khẩn", cls: "s-red" },
};
const TABS = [
  { key: "", label: "Tất cả" },
  { key: "processing", label: "Đang xử lý" },
  { key: "awaiting", label: "Chờ phản hồi" },
  { key: "completed", label: "Hoàn thành" },
  { key: "rejected", label: "Từ chối" },
];

export default function AdminPhanAnhPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { items, meta, loading, refetch } = useAdminList<Feedback>("/admin/feedbacks", {
    page,
    limit: 10,
    status: status || undefined,
  });
  const { data: summary, refetch: refetchSummary } = useApiData<FeedbackSummary>("/admin/feedbacks/summary");

  const [active, setActive] = useState<Feedback | null>(null);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const reply = useAction(() =>
    apiPost(`/admin/feedbacks/${active!.id}/reply`, {
      label: label.trim(),
      description: description.trim() || undefined,
      status: newStatus || undefined,
    }),
  );

  function refetchAll() {
    refetch();
    refetchSummary();
  }
  function openReply(f: Feedback) {
    setActive(f);
    setLabel("");
    setDescription("");
    setNewStatus(f.status);
    reply.setError(null);
  }
  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      reply.setError("Vui lòng nhập nội dung xử lý");
      return;
    }
    const res = await reply.run();
    if (res !== undefined) {
      setActive(null);
      toast.success("Đã cập nhật xử lý phản ánh");
      refetchAll();
    } else if (reply.error) toast.error(reply.error);
  }

  return (
    <div className="adm-r-phan-anh">
      <div className="mg-page">
        <div className="mg-hd">
          <div>
            <h1 className="mg-title">Xử lý phản ánh</h1>
            <p className="mg-sub">Tiếp nhận, phân công và theo dõi tiến độ xử lý phản ánh từ cư dân</p>
          </div>
        </div>

        <div className="mg-stats">
          <StatCard bg="#efeeff" color="#4137f9" label="Tổng phản ánh" value={summary?.all ?? "—"}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </StatCard>
          <StatCard bg="#eff4ff" color="#2f7bf6" label="Đang xử lý" value={summary?.processing ?? "—"}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </StatCard>
          <StatCard bg="#fff3da" color="#c8761b" label="Chờ phản hồi" value={summary?.awaiting ?? "—"}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          </StatCard>
          <StatCard bg="#e6f7f1" color="#1c9d5f" label="Hoàn thành" value={summary?.completed ?? "—"}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </StatCard>
        </div>

        <div className="mg-toolbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              className="mg-filter"
              onClick={() => { setStatus(t.key); setPage(1); }}
              style={{
                cursor: "pointer",
                background: status === t.key ? "#4137f9" : undefined,
                color: status === t.key ? "#fff" : undefined,
                borderColor: status === t.key ? "#4137f9" : undefined,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mg-card">
          <table className="mg-tbl">
            <thead>
              <tr><th>Mã</th><th>Tiêu đề</th><th>Người gửi</th><th>Mức độ</th><th>Trạng thái</th><th>Ngày gửi</th><th>Tác vụ</th></tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, color: "#585c7b" }}>Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, color: "#585c7b" }}>Không có phản ánh nào</td></tr>
              ) : (
                items.map((f) => {
                  const sp = STATUS_PILL[f.status] ?? { label: f.status, cls: "s-gray" };
                  const pp = PRIORITY_PILL[f.priority] ?? { label: f.priority, cls: "s-gray" };
                  return (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-272727)" }}>{f.code}</td>
                      <td>{f.title}</td>
                      <td>{f.reporterName ?? "—"}</td>
                      <td><span className={`mg-pill ${pp.cls}`}>{pp.label}</span></td>
                      <td><span className={`mg-pill ${sp.cls}`}>{sp.label}</span></td>
                      <td>{formatDate(f.createdAt)}</td>
                      <td>
                        <div className="mg-act-btns">
                          <button className="mg-icon-btn" title="Xử lý" onClick={() => openReply(f)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
          <AdminPagination meta={meta} page={page} onPage={setPage} unit="phản ánh" loading={loading} />
        </div>
      </div>

      {active && (
        <AdminModal title={`Xử lý: ${active.code}`} onClose={() => setActive(null)} onSubmit={submitReply} submitting={reply.loading} submitLabel="Cập nhật" error={reply.error}>
          <div style={{ background: "#f7f8fc", borderRadius: 12, padding: "12px 14px", fontSize: 13.5, color: "#3e4265" }}>
            <div style={{ fontWeight: 700, color: "#272727", marginBottom: 4 }}>{active.title}</div>
            <div>Người gửi: {active.reporterName ?? "—"}{active.location ? ` · ${active.location}` : ""}</div>
          </div>
          <div>
            <label style={labelStyle}>Nội dung xử lý *</label>
            <input style={inputStyle} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Đã phân công kỹ thuật..." />
          </div>
          <div>
            <label style={labelStyle}>Chi tiết</label>
            <textarea style={{ ...inputStyle, height: "auto", minHeight: 80, padding: "10px 13px", resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Cập nhật trạng thái</label>
            <select style={inputStyle} value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="processing">Đang xử lý</option>
              <option value="awaiting">Chờ phản hồi</option>
              <option value="completed">Hoàn thành</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
