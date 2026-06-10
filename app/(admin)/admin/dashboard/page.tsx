"use client";

import { useApiData } from "@/lib/hooks";
import { useAdminList } from "@/lib/admin";
import { formatVnd } from "@/lib/format";

interface Overview {
  residents: number;
  apartments: number;
  openFeedbacks: number;
  openWorkOrders: number;
  outstandingFees: number;
  unpaidUnits: number;
  fundBalance: number;
}
interface FeedbackRow {
  id: string;
  code: string;
  title: string;
  category: string;
  priority: string;
  status: string;
}

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  processing: { label: "Đang xử lý", cls: "p-amber" },
  awaiting: { label: "Chờ phản hồi", cls: "p-blue" },
  completed: { label: "Hoàn thành", cls: "p-green" },
  rejected: { label: "Từ chối", cls: "p-gray" },
};
const PRIO: Record<string, { label: string; color: string }> = {
  urgent: { label: "Khẩn", color: "#f5222d" },
  high: { label: "Cao", color: "#f5222d" },
  medium: { label: "TB", color: "#c8761b" },
  low: { label: "Thấp", color: "#959595" },
};

export default function AdminDashboardPage() {
  const { data: ov, loading } = useApiData<Overview>("/admin/dashboard/overview");
  const { items: feedbacks } = useAdminList<FeedbackRow>("/admin/feedbacks", { page: 1, limit: 5, status: "processing" });
  const v = (n?: number) => (loading || n == null ? "—" : n.toLocaleString("vi-VN"));

  return (
    <div className="adm-r-dashboard">
      <div className="adm-page">
        <div className="adm-hd">
          <div>
            <h1 className="adm-title">Tổng quan điều hành</h1>
            <p className="adm-sub">Toàn cảnh vận hành tòa nhà — cập nhật theo thời gian thực</p>
          </div>
        </div>

        <div className="adm-kpis">
          <div className="adm-kpi">
            <div className="adm-kpi-top">
              <div className="adm-kpi-ic" style={{ background: "#efeeff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></svg></div>
            </div>
            <div className="adm-kpi-val">{v(ov?.residents)}</div>
            <div className="adm-kpi-lbl">Tổng cư dân</div>
          </div>
          <div className="adm-kpi">
            <div className="adm-kpi-top">
              <div className="adm-kpi-ic" style={{ background: "#e6f7f1" }}><svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg></div>
            </div>
            <div className="adm-kpi-val">{v(ov?.apartments)}</div>
            <div className="adm-kpi-lbl">Tổng căn hộ</div>
          </div>
          <div className="adm-kpi">
            <div className="adm-kpi-top">
              <div className="adm-kpi-ic" style={{ background: "#fff1de" }}><svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
            </div>
            <div className="adm-kpi-val">{v(ov?.openFeedbacks)}</div>
            <div className="adm-kpi-lbl">Phản ánh chờ xử lý</div>
          </div>
          <div className="adm-kpi">
            <div className="adm-kpi-top">
              <div className="adm-kpi-ic" style={{ background: "#ffeded" }}><svg viewBox="0 0 24 24" fill="none" stroke="#f5222d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
            </div>
            <div className="adm-kpi-val">{v(ov?.openWorkOrders)}</div>
            <div className="adm-kpi-lbl">Công việc đang mở</div>
          </div>
        </div>

        <div className="adm-row c2">
          <div className="adm-card">
            <div className="adm-card-hd">
              <div className="adm-card-title">Công nợ phí dịch vụ</div>
              <a className="adm-card-link" href="/admin/phi">Chi tiết <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></a>
            </div>
            <div style={{ padding: "20px 6px" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#f5222d" }}>{formatVnd(ov?.outstandingFees)}</div>
              <div style={{ color: "#585c7b", marginTop: 6 }}>{v(ov?.unpaidUnits)} căn hộ chưa nộp phí</div>
            </div>
          </div>
          <div className="adm-card">
            <div className="adm-card-hd">
              <div className="adm-card-title">Số dư quỹ bảo trì</div>
              <a className="adm-card-link" href="/admin/quy-bao-tri">Chi tiết <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></a>
            </div>
            <div style={{ padding: "20px 6px" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#4137f9" }}>{formatVnd(ov?.fundBalance)}</div>
              <div style={{ color: "#585c7b", marginTop: 6 }}>Quỹ bảo trì hiện có</div>
            </div>
          </div>
        </div>

        <div className="adm-row c2b">
          <div className="adm-card">
            <div className="adm-card-hd">
              <div className="adm-card-title">Phản ánh cần xử lý</div>
              <a className="adm-card-link" href="/admin/phan-anh">Xem tất cả <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></a>
            </div>
            <table className="adm-tbl">
              <thead><tr><th>Mã</th><th>Nội dung</th><th>Danh mục</th><th>Ưu tiên</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {feedbacks.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 18, color: "#585c7b" }}>Không có phản ánh đang xử lý</td></tr>
                ) : (
                  feedbacks.map((f) => {
                    const sp = STATUS_PILL[f.status] ?? { label: f.status, cls: "p-gray" };
                    const pr = PRIO[f.priority] ?? { label: f.priority, color: "#959595" };
                    return (
                      <tr key={f.id}>
                        <td className="adm-code">{f.code}</td>
                        <td>{f.title}</td>
                        <td>{f.category}</td>
                        <td><span className="adm-prio"><i style={{ background: pr.color }}></i>{pr.label}</span></td>
                        <td><span className={`adm-pill ${sp.cls}`}>{sp.label}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="adm-card">
            <div className="adm-card-hd"><div className="adm-card-title">Lối tắt quản trị</div></div>
            <div className="adm-act">
              <a className="adm-act-item" href="/admin/cu-dan" style={{ textDecoration: "none" }}>
                <div className="adm-act-dot" style={{ background: "#efeeff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg></div>
                <div className="adm-act-body"><div className="adm-act-txt"><b>Quản lý cư dân</b></div><div className="adm-act-time">Thêm, xác minh, phân vai trò</div></div>
              </a>
              <a className="adm-act-item" href="/admin/phi" style={{ textDecoration: "none" }}>
                <div className="adm-act-dot" style={{ background: "#e6f7f1" }}><svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                <div className="adm-act-body"><div className="adm-act-txt"><b>Lập hóa đơn phí</b></div><div className="adm-act-time">Thu phí, đối soát công nợ</div></div>
              </a>
              <a className="adm-act-item" href="/admin/thong-bao" style={{ textDecoration: "none" }}>
                <div className="adm-act-dot" style={{ background: "#eaf1ff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#2f7bf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg></div>
                <div className="adm-act-body"><div className="adm-act-txt"><b>Phát thông báo</b></div><div className="adm-act-time">Gửi thông báo tới cư dân</div></div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
