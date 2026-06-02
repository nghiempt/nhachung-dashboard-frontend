"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiData } from "@/lib/hooks";
import { formatDate, formatDateTime, formatTime, timeAgo } from "@/lib/format";
import {
  WORKORDER_STATUS,
  WORKORDER_PRIORITY,
  WORKORDER_CATEGORY,
  SYSTEM_STATUS,
} from "@/lib/ui-maps";
import { Modal, ModalField, ModalBadge } from "@/components/ui/Modal";
import { exportCsv } from "@/lib/export-csv";

const ArrowUp = () => (
  <svg className="arrow-up" viewBox="0 0 12 12" fill="none">
    <path d="M6 10V2M2 6l4-4 4 4" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowDown = () => (
  <svg className="arrow-down" viewBox="0 0 12 12" fill="none">
    <path d="M6 2v8M2 6l4 4 4-4" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Types ──────────────────────────────────────────────
interface OverviewStats {
  total: number;
  processing: number;
  completed: number;
  overdue: number;
}
interface CategoryDist {
  category: string;
  count: number;
}
interface Overview {
  stats: OverviewStats;
  categoryDistribution: CategoryDist[];
}
interface WorkOrderItem {
  id: string;
  code: string;
  name: string;
  category: string;
  status: string;
  priority: string;
  requesterName: string;
  requesterInitials: string;
  overdueDays: number | null;
  occurredAt: string;
}
interface WorkOrdersResponse {
  items: WorkOrderItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
interface SystemItem {
  id: string;
  name: string;
  detail: string;
  status: string;
  metric: string;
  lastCheckedAt: string;
}
interface ScheduleItem {
  id: string;
  name: string;
  contractor: string;
  category: string;
  scheduledAt: string;
  scheduledPeriod: string;
  status: string;
}

// Category accent colors that mirror the original hardcoded palette.
const CAT_COLOR: Record<string, string> = {
  electricity: "#f5a623",
  water: "#1870c4",
  elevator: "#5a3ad9",
  fire_safety: "#f5222d",
  common_area: "#1c9d5f",
  other: "#585c7b",
};

// Category badge style mirroring original inline styles.
const CAT_BADGE_STYLE: Record<string, React.CSSProperties> = {
  electricity: { background: "#fff1de", color: "#c8761b" },
  water: { background: "#e4f1ff", color: "#1870c4" },
  elevator: { background: "#efeaff", color: "#5a3ad9" },
  fire_safety: { background: "#ffeded", color: "#f5222d" },
  common_area: { background: "#f0f0f5", color: "#585c7b" },
  other: { background: "#f0f0f5", color: "#585c7b" },
};

// System icon presentation reused from original markup, indexed by position.
const SYS_ICONS = [
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>,
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="#1870c4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="#5a3ad9" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <polyline points="9 10 12 7 15 10" />
    <polyline points="9 14 12 17 15 14" />
  </svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="#f5222d" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c0 1.38-.5 2-1 3-.5.94-.5 1.5-.5 2" />
    <path d="M12 2C6.5 7 5 10.5 7 15c.9 1.8 2.5 2.5 4.5 2.5 3 0 4.5-2 4.5-5 0-1.5-.5-2.5-1.5-3.5-1-1-1.5-2-1.5-3.5z" />
  </svg>,
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="#585c7b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>,
  <svg key="5" viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
  </svg>,
];
const SYS_ICON_BG = ["#fff9e0", "#e4f1ff", "#efeeff", "#ffeded", "#f0f0f5", "#e3fbed"];

// Pill class per system status (matches original status-pill variants).
function sysPillClass(status: string): string {
  if (status === "normal") return "status-pill status-ok";
  return "status-pill status-warn";
}

// Schedule dot colors cycling the original palette.
const SCHED_DOT = ["#5a3ad9", "#1870c4", "#f5a623", "#f5222d", "#1c9d5f", "#585c7b"];
const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

type StatusTab = "all" | "processing" | "completed" | "overdue";

export default function VanHanhPage() {
  const router = useRouter();
  const [tab, setTab] = useState<StatusTab>("all");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedWO, setSelectedWO] = useState<WorkOrderItem | null>(null);

  // debounce the search box → server-side filter
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: overview } = useApiData<Overview>("/operations/overview");
  const searchQs = search ? `&search=${encodeURIComponent(search)}` : "";
  const woPath =
    tab === "all"
      ? `/operations/work-orders?page=${page}&limit=8${searchQs}`
      : `/operations/work-orders?status=${tab}&page=${page}&limit=8${searchQs}`;
  const { data: woData } = useApiData<WorkOrdersResponse>(woPath, [tab, page, search]);
  const { data: systems } = useApiData<SystemItem[]>("/operations/systems");
  const { data: schedule } = useApiData<ScheduleItem[]>("/operations/schedule");

  const stats = overview?.stats;
  const items = woData?.items ?? [];
  const meta = woData?.meta;
  const sysList = systems ?? [];

  // ── Category distribution ──
  const catDist = overview?.categoryDistribution ?? [];
  const catTotal = catDist.reduce((s, c) => s + c.count, 0);
  const catMax = catDist.reduce((m, c) => Math.max(m, c.count), 0) || 1;

  // ── Completion rate ──
  const completionPct =
    stats && stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  // ── Schedule grouped by day ──
  const schedGroups = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const s of schedule ?? []) {
      const d = new Date(s.scheduledAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    const todayKey = (() => {
      const n = new Date();
      return `${n.getFullYear()}-${n.getMonth()}-${n.getDate()}`;
    })();
    return Array.from(map.entries())
      .map(([key, list]) => {
        const d = new Date(list[0].scheduledAt);
        return {
          key,
          isToday: key === todayKey,
          weekday: WEEKDAYS[d.getDay()],
          dayNum: d.getDate(),
          list,
        };
      })
      .sort((a, b) => new Date(a.list[0].scheduledAt).getTime() - new Date(b.list[0].scheduledAt).getTime())
      .slice(0, 4);
  }, [schedule]);

  const periodLabel = (schedule ?? [])[0]?.scheduledPeriod ?? "";

  const rangeStart = meta ? (meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1) : 0;
  const rangeEnd = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;
  const totalPages = meta?.totalPages ?? 1;

  function changeTab(t: StatusTab) {
    setTab(t);
    setPage(1);
  }

  const handleExport = () => {
    const rows = items.map((w) => [
      w.code,
      w.name,
      WORKORDER_CATEGORY[w.category] ?? w.category,
      WORKORDER_STATUS[w.status]?.label ?? w.status,
      WORKORDER_PRIORITY[w.priority]?.label ?? w.priority,
      w.requesterName,
      formatDate(w.occurredAt),
    ]);
    exportCsv(
      "yeu-cau-bao-tri",
      ["Mã", "Yêu cầu", "Hạng mục", "Trạng thái", "Ưu tiên", "Người yêu cầu", "Ngày tạo"],
      rows,
    );
  };

  return (
    <div className="vhbt-page">
      {/* ── Page Header ── */}
      <div className="page-hd">
        <div>
          <h1 className="page-title">Vận hành &amp; Bảo trì</h1>
          <p className="page-sub">Quản lý yêu cầu bảo trì và tình trạng hệ thống tòa nhà</p>
        </div>
        <div className="page-actions">
          <span className="btn-outline" style={{ cursor: "default" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Tháng này
          </span>
          <button className="btn-outline" onClick={handleExport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Xuất báo cáo
          </button>
          <button className="btn-primary" onClick={() => router.push("/gop-y")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tạo yêu cầu mới
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#e4f1ff" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1870c4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <div className="kpi-label">Tổng yêu cầu tháng này</div>
            <div className="kpi-value">{stats ? stats.total : "—"}</div>
            <div className="kpi-trend">
              <ArrowUp />
              <span className="kpi-pct up">+15.2%</span>
              <span className="kpi-tlabel">so với tháng trước</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#fff1de" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div className="kpi-label">Đang xử lý</div>
            <div className="kpi-value warning">{stats ? stats.processing : "—"}</div>
            <div className="kpi-trend">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="3" fill="#c8761b" /></svg>
              <span className="kpi-pct neutral" style={{ color: "#c8761b" }}>Đang tiến hành</span>
              <span className="kpi-tlabel">— cần theo dõi</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#e3fbed" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div className="kpi-label">Hoàn thành tháng này</div>
            <div className="kpi-value">{stats ? stats.completed : "—"}</div>
            <div className="kpi-trend">
              <ArrowUp />
              <span className="kpi-pct up">+8.3%</span>
              <span className="kpi-tlabel">so với tháng trước</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#ffeded" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#f5222d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div className="kpi-label">Quá hạn xử lý</div>
            <div className="kpi-value danger">{stats ? stats.overdue : "—"}</div>
            <div className="kpi-trend">
              <ArrowDown />
              <span className="kpi-pct up">−2</span>
              <span className="kpi-tlabel">so với tháng trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle Row ── */}
      <div className="mid-row">
        <div className="cat-card">
          <div className="card-hd">
            <div className="card-title">Yêu cầu theo hạng mục</div>
            <span className="card-sub">Tháng 5/2024 · {catTotal} yêu cầu</span>
          </div>
          <div className="cat-list">
            {catDist.map((c) => {
              const color = CAT_COLOR[c.category] ?? CAT_COLOR.other;
              const pct = catTotal > 0 ? Math.round((c.count / catTotal) * 100) : 0;
              const width = `${(c.count / catMax) * 100}%`;
              return (
                <div className="cat-row" key={c.category}>
                  <div className="cat-row-hd">
                    <div className="cat-name">
                      <span className="cat-dot" style={{ background: color }}></span>
                      {WORKORDER_CATEGORY[c.category] ?? c.category}
                    </div>
                    <div className="cat-right">
                      <span className="cat-count">{c.count}</span>
                      <span className="cat-pct">{pct}%</span>
                    </div>
                  </div>
                  <div className="cat-track">
                    <div className="cat-fill" style={{ width, background: color }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 4, padding: "14px 16px", background: "#fafafa", borderRadius: 12, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#585c7b", fontWeight: 500 }}>Tỉ lệ hoàn thành tháng này</span>
                <span style={{ fontFamily: '"Manrope","Inter",sans-serif', fontSize: 13, fontWeight: 700, color: "#1c9d5f" }}>{completionPct.toFixed(1)}%</span>
              </div>
              <div style={{ height: 8, background: "#f0f0f5", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${completionPct}%`, borderRadius: 4, background: "linear-gradient(90deg,#22c08a,#1c9d5f)" }}></div>
              </div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontFamily: '"Manrope","Inter",sans-serif', fontSize: 18, fontWeight: 700, color: "#272727", lineHeight: "22px" }}>
                {stats ? stats.completed : 0}<span style={{ fontSize: 13, color: "#585c7b", fontWeight: 500 }}>/{stats ? stats.total : 0}</span>
              </div>
              <div style={{ fontSize: 12, color: "#585c7b", marginTop: 2 }}>yêu cầu</div>
            </div>
          </div>
        </div>

        {/* System status */}
        <div className="sys-card">
          <div className="card-hd">
            <div className="card-title">Tình trạng hệ thống</div>
            <span className="card-sub" style={{ fontSize: 11 }}>Cập nhật {sysList[0] ? timeAgo(sysList[0].lastCheckedAt) : "—"}</span>
          </div>
          <div className="sys-grid">
            {sysList.map((s, i) => {
              const ss = SYSTEM_STATUS[s.status] ?? SYSTEM_STATUS.normal;
              const last = i === sysList.length - 1;
              return (
                <div className="sys-row" key={s.id} style={last ? { paddingBottom: 0, borderBottom: 0 } : undefined}>
                  <div className="sys-icon-bg" style={{ background: SYS_ICON_BG[i % SYS_ICON_BG.length] }}>
                    {SYS_ICONS[i % SYS_ICONS.length]}
                  </div>
                  <div className="sys-body">
                    <div className="sys-name">{s.name}</div>
                    <div className="sys-detail">{s.detail} · {timeAgo(s.lastCheckedAt)}</div>
                  </div>
                  <div className="sys-status">
                    <span className={sysPillClass(s.status)} style={{ background: ss.bg, color: ss.color }}>
                      <span className="status-dot" style={{ background: ss.color }}></span>
                      {s.metric || ss.label}
                    </span>
                  </div>
                </div>
              );
            })}
            {sysList.length === 0 && (
              <div className="sys-row" style={{ paddingBottom: 0, borderBottom: 0 }}>
                <div className="sys-body"><div className="sys-detail">Đang tải...</div></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Work Orders Table ── */}
      <div className="wo-card">
        <div className="card-hd">
          <div className="card-title">Danh sách yêu cầu bảo trì</div>
          <span className="card-link" onClick={() => { changeTab("all"); setSearchInput(""); }} style={{ cursor: "pointer" }}>Xem tất cả →</span>
        </div>

        <div className="wo-filters">
          <button className={`filter-tab${tab === "all" ? " active" : ""}`} onClick={() => changeTab("all")}>
            Tất cả ({stats ? stats.total : 0})
          </button>
          <button className={`filter-tab${tab === "processing" ? " active" : ""}`} onClick={() => changeTab("processing")}>
            Đang xử lý ({stats ? stats.processing : 0})
          </button>
          <button className={`filter-tab${tab === "completed" ? " active" : ""}`} onClick={() => changeTab("completed")}>
            Hoàn thành ({stats ? stats.completed : 0})
          </button>
          <button className={`filter-tab${tab === "overdue" ? " active" : ""}`} onClick={() => changeTab("overdue")}>
            Quá hạn ({stats ? stats.overdue : 0})
          </button>
          <div className="filter-spacer"></div>
          <div className="search-mini" style={{ gap: "6px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Lọc & Tìm kiếm"
              style={{ border: 0, outline: 0, background: "transparent", fontSize: "13px", color: "#272727", width: "150px" }}
            />
          </div>
        </div>

        <div className="wo-table">
          <div className="wo-hd">
            <span>Yêu cầu</span>
            <span>Ngày tạo</span>
            <span>Người yêu cầu</span>
            <span style={{ textAlign: "center" }}>Hạng mục</span>
            <span style={{ textAlign: "center" }}>Trạng thái</span>
            <span style={{ textAlign: "right" }}>Ưu tiên</span>
          </div>

          {items.length === 0 && (
            <div className="wo-row">
              <div className="wo-info">
                <div className="wo-name">Đang tải...</div>
              </div>
            </div>
          )}

          {items.map((w) => {
            const isOverdue = w.status === "overdue" || (w.overdueDays != null && w.overdueDays > 0);
            const ss = WORKORDER_STATUS[w.status] ?? WORKORDER_STATUS.processing;
            const pri = WORKORDER_PRIORITY[w.priority] ?? WORKORDER_PRIORITY.medium;
            const catStyle = CAT_BADGE_STYLE[w.category] ?? CAT_BADGE_STYLE.other;
            const idText =
              isOverdue && w.overdueDays != null
                ? `${w.code} · Quá hạn ${w.overdueDays} ngày`
                : w.code;
            const priClass =
              w.priority === "high"
                ? "pri-dot pri-high"
                : w.priority === "low"
                ? "pri-dot pri-low"
                : "pri-dot pri-medium";
            return (
              <div className="wo-row" key={w.id} onClick={() => setSelectedWO(w)} style={{ cursor: "pointer", ...(isOverdue ? { background: "#fff8f8" } : {}) }}>
                <div className="wo-info">
                  <div className="wo-id" style={isOverdue ? { color: "#f5222d" } : undefined}>{idText}</div>
                  <div className="wo-name">{w.name}</div>
                </div>
                <div className="wo-date" style={isOverdue ? { color: "#f5222d" } : undefined}>{formatDate(w.occurredAt)}</div>
                <div className="wo-requester">
                  <div className="wo-avatar">{w.requesterInitials}</div>
                  <span className="wo-req-name">{w.requesterName}</span>
                </div>
                <div className="wo-cat-wrap">
                  <span className="badge" style={catStyle}>{WORKORDER_CATEGORY[w.category] ?? w.category}</span>
                </div>
                <div className="wo-stat-wrap">
                  <span className="badge" style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
                </div>
                <div className="wo-pri-wrap"><span className={priClass}>{pri.label}</span></div>
              </div>
            );
          })}
        </div>

        <div className="table-foot">
          <span className="table-count">Hiển thị {rangeStart}–{rangeEnd} / {meta?.total ?? 0} yêu cầu</span>
          <div className="pagination">
            <button className="pg-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`pg-btn${p === page ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="pg-btn" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Upcoming Maintenance Schedule ── */}
      <div className="sched-card">
        <div className="card-hd">
          <div className="card-title">Lịch bảo trì sắp tới</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="card-sub">{periodLabel}</span>
          </div>
        </div>
        <div className="sched-grid">
          {schedGroups.map((g) => (
            <div className={`sched-col${g.isToday ? " today" : ""}`} key={g.key}>
              <div className="sched-col-hd">
                <div>
                  <div className="sched-day">{g.weekday}</div>
                  <div className="sched-date">{g.dayNum}</div>
                </div>
                {g.isToday && (
                  <span className="sched-badge badge badge-blue" style={{ background: "#efeaff", color: "#5a3ad9" }}>Hôm nay</span>
                )}
              </div>
              <div className="sched-items">
                {g.list.map((it, idx) => (
                  <div className="sched-item" key={it.id}>
                    <div className="sched-item-dot" style={{ background: SCHED_DOT[idx % SCHED_DOT.length] }}></div>
                    <div className="sched-item-body">
                      <div className="sched-item-name">{it.name}</div>
                      <div className="sched-item-time">{formatTime(it.scheduledAt)} · {it.contractor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {schedGroups.length === 0 && (
            <div className="sched-col">
              <div className="sched-items">
                <div className="sched-item"><div className="sched-item-body"><div className="sched-item-name">Đang tải...</div></div></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedWO && (
        <WorkOrderDetailModal wo={selectedWO} onClose={() => setSelectedWO(null)} />
      )}
    </div>
  );
}

// ── Work order detail popup ────────────────────────────────────
function WorkOrderDetailModal({ wo, onClose }: { wo: WorkOrderItem; onClose: () => void }) {
  const ss = WORKORDER_STATUS[wo.status] ?? WORKORDER_STATUS.processing;
  const pri = WORKORDER_PRIORITY[wo.priority] ?? WORKORDER_PRIORITY.medium;
  const isOverdue = wo.status === "overdue" || (wo.overdueDays != null && wo.overdueDays > 0);
  return (
    <Modal
      onClose={onClose}
      width={520}
      title={wo.name}
      headerAccent={<ModalBadge label={ss.label} bg={ss.bg} color={ss.color} />}
    >
      <div style={{ padding: "16px 24px 24px" }}>
        <ModalField label="Mã yêu cầu" value={wo.code} />
        <ModalField label="Hạng mục" value={WORKORDER_CATEGORY[wo.category] ?? wo.category} />
        <ModalField label="Mức ưu tiên" value={pri.label} valueColor={pri.color} />
        <ModalField label="Người yêu cầu" value={wo.requesterName} />
        <ModalField label="Ngày tạo" value={formatDateTime(wo.occurredAt)} />
        {isOverdue && wo.overdueDays != null && (
          <ModalField label="Quá hạn" value={`${wo.overdueDays} ngày`} valueColor="#f5222d" />
        )}
      </div>
    </Modal>
  );
}
