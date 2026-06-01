"use client";

import { useState } from "react";
import { useApiData } from "@/lib/hooks";
import { apiPost } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { REPORT_STATUS, REPORT_PERIOD } from "@/lib/ui-maps";

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

type FileType = "pdf" | "doc" | "xls";

// Map API file types (pdf/docx/xlsx/...) onto the three icon variants.
function iconType(fileType?: string | null): FileType {
  const ft = (fileType ?? "").toLowerCase();
  if (ft.startsWith("xls")) return "xls";
  if (ft.startsWith("doc")) return "doc";
  return "pdf";
}

const FileIcon = ({ type }: { type: FileType }) => {
  const color = type === "pdf" ? "#f5222d" : type === "doc" ? "#1870c4" : "#1c9d5f";
  const bg = type === "pdf" ? "#fff1f0" : type === "doc" ? "#e8f0fe" : "#e8f8ee";
  return (
    <div className={`rc-file-icon file-${type}`}>
      <svg width="22" height="26" viewBox="0 0 24 28" fill="none">
        <rect x="2" y="0" width="20" height="28" rx="3" fill={bg} />
        <path d="M14 0v6h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 0l6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div className="rc-file-ext" style={{ color }}>{(type === "doc" ? "DOCX" : type === "xls" ? "XLSX" : "PDF")}</div>
    </div>
  );
};

interface Summary {
  total: number;
  published: number;
  pending: number;
  dueSoon: number;
}

interface ReportTab {
  key: string;
  label: string;
  count: number;
}

interface ReportItem {
  id: string;
  title: string;
  periodType: string;
  periodLabel: string;
  status: string;
  category: string;
  fileType: string | null;
  sizeBytes: number | null;
  sizeLabel: string;
  url: string | null;
  responsibleName: string | null;
  dueDate: string | null;
  publishedAt: string | null;
  viewCount: number;
  downloadCount: number;
}

interface ReportsResponse {
  tabs: ReportTab[];
  items: ReportItem[];
}

interface UpcomingItem {
  id: string;
  title: string;
  periodLabel: string;
  status: string;
  responsibleName: string | null;
  dueDate: string | null;
}

// Map REPORT_STATUS color -> existing badge utility class.
function badgeClassFor(status: string): string {
  if (status === "published") return "badge badge-green";
  if (status === "pending") return "badge badge-orange";
  return "badge badge-gray";
}

function ReportCard({ r }: { r: ReportItem }) {
  const st = REPORT_STATUS[r.status] ?? REPORT_STATUS.draft;
  const isPublished = r.status === "published";
  const dateText = isPublished
    ? `Phát hành: ${formatDate(r.publishedAt)}${r.sizeLabel ? ` · ${r.sizeLabel}` : ""}`
    : `Hạn nộp: ${formatDate(r.dueDate)}`;
  const rightText = isPublished
    ? `${r.viewCount} lượt xem`
    : r.responsibleName ?? "";

  const openReport = async () => {
    try {
      await apiPost(`/reports/${r.id}/view`, {});
    } catch {
      /* ignore view-count failures */
    }
    if (r.url) window.open(r.url, "_blank");
  };

  return (
    <div className="report-card">
      <div className="rc-top">
        <FileIcon type={iconType(r.fileType)} />
        <div className="rc-meta">
          <div className="rc-period">{REPORT_PERIOD[r.periodType] ?? "Báo cáo"}</div>
          <div className="rc-title">{r.title}</div>
          <div className="rc-date">{dateText}</div>
        </div>
      </div>
      <div className="rc-divider"></div>
      <div className="rc-bottom">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={badgeClassFor(r.status)}>{st.label}</span>
          <span style={{ fontSize: 11, color: "#585c7b" }}>{rightText}</span>
        </div>
        <div className="rc-actions">
          <button className="rc-btn" title="Xem" onClick={openReport}><EyeIcon /></button>
          <button className="rc-btn" title="Tải xuống" onClick={openReport}><DownloadIcon /></button>
        </div>
      </div>
    </div>
  );
}

export default function BaoCaoPage() {
  const [periodType, setPeriodType] = useState<string>("all");

  const { data: summary } = useApiData<Summary>("/reports/summary");
  const { data: reports } = useApiData<ReportsResponse>(
    periodType === "all" ? "/reports" : `/reports?periodType=${periodType}`,
    [periodType],
  );
  const { data: upcoming } = useApiData<UpcomingItem[]>("/reports/upcoming");

  const tabs = reports?.tabs ?? [];
  const items = reports?.items ?? [];

  const monthlyReports = items.filter((r) => r.periodType === "month");
  // Quarterly section groups quarter + year reports together (mirrors original layout).
  const otherReports = items.filter((r) => r.periodType === "quarter" || r.periodType === "year");

  return (
    <div className="bcdk-page">
      {/* ── Page Header ── */}
      <div className="page-hd">
        <div>
          <h1 className="page-title">Báo cáo định kỳ</h1>
          <p className="page-sub">Hệ thống báo cáo tháng, quý và năm của Ban quản trị</p>
        </div>
        <div className="page-actions">
          <button className="btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Năm 2024
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tạo báo cáo mới
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e4f1ff" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1870c4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="stat-val">{summary?.total ?? 0}</div>
          <div className="stat-lbl">Tổng báo cáo năm 2024</div>
          <div className="stat-trend">
            <span style={{ color: "#1c9d5f" }}>↑ +4</span>
            <span className="trend-neu"> so với 2023</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e3fbed" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-val green">{summary?.published ?? 0}</div>
          <div className="stat-lbl">Đã phát hành</div>
          <div className="stat-trend"><span className="trend-neu">5 tháng đầu năm</span></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fff1de" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-val orange">{summary?.pending ?? 0}</div>
          <div className="stat-lbl">Chờ phê duyệt</div>
          <div className="stat-trend"><span style={{ color: "#c8761b" }}>● Cần xem xét</span></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ffeded" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#f5222d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="stat-val red">{summary?.dueSoon ?? 0}</div>
          <div className="stat-lbl">Sắp đến hạn nộp</div>
          <div className="stat-trend"><span style={{ color: "#f5222d" }}>Trong 7 ngày tới</span></div>
        </div>
      </div>

      {/* ── Filter ── */}
      <div className="filter-bar">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`filter-tab${periodType === t.key ? " active" : ""}`}
            onClick={() => setPeriodType(t.key)}
          >
            {t.label} ({t.count})
          </button>
        ))}
        <div className="filter-spacer"></div>
        <div className="search-mini">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Lọc &amp; Tìm kiếm
        </div>
      </div>

      {/* ── Báo cáo tháng ── */}
      {monthlyReports.length > 0 && (
        <div className="report-section">
          <div className="section-label">Báo cáo tháng — 2024</div>
          <div className="report-grid">
            {monthlyReports.map((r) => <ReportCard key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* ── Báo cáo quý / năm ── */}
      {otherReports.length > 0 && (
        <div className="report-section">
          <div className="section-label">Báo cáo quý — 2024</div>
          <div className="report-grid">
            {otherReports.map((r) => <ReportCard key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* ── Upcoming ── */}
      <div className="upcoming-card">
        <div className="card-hd">
          <div className="card-title">Lịch nộp báo cáo sắp tới</div>
          <span className="card-link">Xem lịch đầy đủ →</span>
        </div>
        <div className="upcoming-list">
          <div className="up-row up-hd">
            <span>Tên báo cáo</span>
            <span>Hạn nộp</span>
            <span>Người phụ trách</span>
            <span>Trạng thái</span>
            <span style={{ textAlign: "right" }}>Thao tác</span>
          </div>
          {(upcoming ?? []).map((u) => {
            const st = REPORT_STATUS[u.status] ?? REPORT_STATUS.draft;
            return (
              <div className="up-row" key={u.id}>
                <div>
                  <div className="up-title">{u.title}</div>
                  <div className="up-sub">{u.periodLabel}</div>
                </div>
                <div className="up-date">{formatDate(u.dueDate)}</div>
                <div className="up-person">{u.responsibleName ?? "—"}</div>
                <div className="badge-cell"><span className={badgeClassFor(u.status)}>{st.label}</span></div>
                <div className="action-cell">
                  <button className="rc-btn"><EditIcon /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
