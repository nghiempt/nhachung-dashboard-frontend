"use client";

import { useState } from "react";
import { useApiData } from "@/lib/hooks";
import { formatVnd, formatDate, formatNumber } from "@/lib/format";
import { trendDir, MAINTENANCE_STATUS } from "@/lib/ui-maps";
import { Modal, ModalField, ModalBadge } from "@/components/ui/Modal";
import { exportCsv } from "@/lib/export-csv";

interface FundOverview {
  balance: number;
  totalCollected: number;
  totalSpent: number;
  interestIncome: number;
  balanceChangePct: number;
  collectedChangePct: number;
  spentChangePct: number;
  bankName: string;
  accountNoMasked: string;
  interestRate: number;
  contributionRate: string;
  collectionRate: number;
  unitsPaid: number;
  unitsTotal: number;
  unitsUnpaid: number;
  updatedAt: string;
}

interface FundMovement {
  period: string;
  cumulativeBalance: number;
  maintenanceCost: number;
}

interface FundBlock {
  block: string;
  unitsPaid: number;
  unitsTotal: number;
  rate: number;
  unitsUnpaid: number;
}

interface FundJob {
  id: string;
  name: string;
  contractor: string;
  status: string;
  amount: number | null;
  estimatedCost: number | null;
  scheduledPeriod: string | null;
  actualDate: string | null;
}

const ArrowUp = () => (
  <svg className="arrow-up" viewBox="0 0 12 12" fill="none">
    <path d="M6 10V2M2 6l4-4 4 4" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowDown = () => (
  <svg className="arrow-down" viewBox="0 0 12 12" fill="none">
    <path d="M6 2v8M2 6l4 4 4-4" stroke="#f5222d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Short period label for the x-axis: "2024-Q3" -> "Q3/24", "2026-05" -> "T5/26"
function periodLabel(period: string): string {
  const [year, part] = period.split("-");
  const yy = year.slice(-2);
  if (part?.startsWith("Q")) return `${part}/${yy}`;
  return `T${Number(part)}/${yy}`;
}

export default function QuyBaoTriPage() {
  const [selectedJob, setSelectedJob] = useState<FundJob | null>(null);
  const { data: overview } = useApiData<FundOverview>("/fund/overview");
  const { data: movements } = useApiData<FundMovement[]>("/fund/movements");
  const { data: blocks } = useApiData<FundBlock[]>("/fund/blocks");
  const { data: completed } = useApiData<FundJob[]>("/fund/jobs?status=completed");
  const { data: planned } = useApiData<FundJob[]>("/fund/jobs?status=planned");
  const { data: tentative } = useApiData<FundJob[]>("/fund/jobs?status=tentative");

  const balanceTrend = trendDir(overview?.balanceChangePct);
  const collectedTrend = trendDir(overview?.collectedChangePct);
  // "Tổng đã chi" — more spending is a negative trend; show as down (red).
  const spentTrend = trendDir(overview ? -(overview.spentChangePct ?? 0) : null);

  // ── Chart geometry (viewBox 640x260) ──
  const mv = movements ?? [];
  const n = mv.length;
  // Y axis labels are 10B (top, y=8) and 0 (bottom, y=248).
  const chartTop = 8;
  const chartBottom = 248;
  const chartMaxVal = 10_000_000_000; // 10B matches the y-axis scale
  const valToY = (v: number) =>
    chartBottom - (v / chartMaxVal) * (chartBottom - chartTop);
  const xAt = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * 640);

  const linePoints = mv
    .map((m, i) => `${xAt(i)},${valToY(m.cumulativeBalance)}`)
    .join(" ");
  const areaPath =
    n > 0
      ? `M ${linePoints.split(" ").join(" L ")} L ${xAt(n - 1)},${chartBottom} L ${xAt(0)},${chartBottom} Z`
      : "";

  // Bars: maintenanceCost, centered around each x, width 28.
  const barW = 28;
  const barMax = mv.length ? Math.max(...mv.map((m) => m.maintenanceCost)) : 0;
  const barMaxH = chartBottom - 160; // keep bars in lower band, like the design

  const planRows: { job: FundJob }[] = [
    ...(planned ?? []),
    ...(tentative ?? []),
  ].map((job) => ({ job }));

  const lastUpdated = overview ? formatDate(overview.updatedAt) : "—";

  const handleExport = () => {
    const all = [...(completed ?? []), ...(planned ?? []), ...(tentative ?? [])];
    const rows = all.map((j) => [
      j.name,
      j.contractor,
      MAINTENANCE_STATUS[j.status]?.label ?? j.status,
      j.amount ?? j.estimatedCost ?? "",
      j.scheduledPeriod ?? "",
      j.actualDate ? formatDate(j.actualDate) : "",
    ]);
    exportCsv(
      "quy-bao-tri-hang-muc",
      ["Hạng mục", "Nhà thầu", "Trạng thái", "Số tiền (VND)", "Kỳ kế hoạch", "Ngày thực hiện"],
      rows,
    );
  };

  return (
    <div className="qbt-page">
      {/* ── Page Header ── */}
      <div className="page-hd">
        <div>
          <h1 className="page-title">Quỹ bảo trì</h1>
          <p className="page-sub">Thông tin quỹ bảo trì tòa nhà và kế hoạch sử dụng</p>
        </div>
        <div className="page-actions">
          <span className="btn-outline" style={{ cursor: "default" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Cập nhật: {lastUpdated}
          </span>
          <button className="btn-primary" onClick={handleExport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#efeeff" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="16" />
              <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
          </div>
          <div>
            <div className="kpi-label">Số dư quỹ hiện tại</div>
            <div className="kpi-value">{overview ? formatVnd(overview.balance) : "Đang tải..."}</div>
            <div className="kpi-trend">
              {(overview?.balanceChangePct ?? 0) >= 0 ? <ArrowUp /> : <ArrowDown />}
              <span className="kpi-pct up" style={{ color: balanceTrend.color }}>
                {(overview?.balanceChangePct ?? 0) >= 0 ? "+" : ""}{overview?.balanceChangePct ?? 0}%
              </span>
              <span className="kpi-tlabel">so với tháng trước</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#e3fbed" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div className="kpi-label">Tổng đã thu</div>
            <div className="kpi-value">{overview ? formatVnd(overview.totalCollected) : "Đang tải..."}</div>
            <div className="kpi-trend">
              {(overview?.collectedChangePct ?? 0) >= 0 ? <ArrowUp /> : <ArrowDown />}
              <span className="kpi-pct up" style={{ color: collectedTrend.color }}>
                {(overview?.collectedChangePct ?? 0) >= 0 ? "+" : ""}{overview?.collectedChangePct ?? 0}%
              </span>
              <span className="kpi-tlabel">so với năm ngoái</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#ffeded" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#f5222d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8l-8 8M8 8l8 8" />
            </svg>
          </div>
          <div>
            <div className="kpi-label">Tổng đã chi</div>
            <div className="kpi-value">{overview ? formatVnd(overview.totalSpent) : "Đang tải..."}</div>
            <div className="kpi-trend">
              <ArrowDown />
              <span className="kpi-pct down" style={{ color: spentTrend.color }}>
                {(overview?.spentChangePct ?? 0) >= 0 ? "+" : ""}{overview?.spentChangePct ?? 0}%
              </span>
              <span className="kpi-tlabel">so với năm ngoái</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#e4f1ff" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1f6dd4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <div className="kpi-label">Lãi tiền gửi 2024</div>
            <div className="kpi-value">{overview ? formatVnd(overview.interestIncome) : "Đang tải..."}</div>
            <div className="kpi-trend">
              <ArrowUp />
              <span className="kpi-pct up">+{overview?.interestRate ?? 0}%</span>
              <span className="kpi-tlabel">lãi suất / năm</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart Row ── */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="chart-hd">
            <div className="chart-title">Biến động số dư quỹ</div>
            <div className="chart-period">
              2 năm gần nhất
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="chart-svg-wrap" style={{ position: "relative", minHeight: "260px" }}>
            <span className="chart-y-lbl" style={{ top: "8px" }}>10B</span>
            <span className="chart-y-lbl" style={{ top: "68px" }}>8B</span>
            <span className="chart-y-lbl" style={{ top: "128px" }}>6B</span>
            <span className="chart-y-lbl" style={{ top: "188px" }}>4B</span>
            <span className="chart-y-lbl" style={{ top: "248px" }}>0</span>

            <svg
              viewBox="0 0 640 260"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: "absolute", left: "44px", right: 0, top: 0, bottom: 0, width: "calc(100% - 44px)", height: "260px" }}
            >
              <line x1="0" y1="8" x2="640" y2="8" stroke="#f0f0f5" strokeWidth="1" />
              <line x1="0" y1="68" x2="640" y2="68" stroke="#f0f0f5" strokeWidth="1" />
              <line x1="0" y1="128" x2="640" y2="128" stroke="#f0f0f5" strokeWidth="1" />
              <line x1="0" y1="188" x2="640" y2="188" stroke="#f0f0f5" strokeWidth="1" />
              <line x1="0" y1="248" x2="640" y2="248" stroke="#e8e8f0" strokeWidth="1" />

              {mv.map((m, i) => {
                const h = barMax > 0 ? (m.maintenanceCost / barMax) * barMaxH : 0;
                const x = Math.min(Math.max(xAt(i) - barW / 2, 0), 640 - barW);
                return (
                  <rect
                    key={`bar-${m.period}`}
                    x={x}
                    y={chartBottom - h}
                    width={barW}
                    height={h}
                    rx="3"
                    fill="#ef6b7c"
                    opacity="0.7"
                  />
                );
              })}

              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4137f9" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#4137f9" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
              {linePoints && (
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#4137f9"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {mv.map((m, i) => (
                <circle
                  key={`pt-${m.period}`}
                  cx={xAt(i)}
                  cy={valToY(m.cumulativeBalance)}
                  r={i === n - 1 ? 6 : 4}
                  fill="#4137f9"
                  stroke="#fff"
                  strokeWidth={i === n - 1 ? 2.5 : 2}
                />
              ))}

              {mv.map((m, i) => (
                <text
                  key={`lbl-${m.period}`}
                  x={xAt(i)}
                  y="260"
                  textAnchor="middle"
                  fontSize="11.5"
                  fill={i === n - 1 ? "#4137f9" : "#585c7b"}
                  fontWeight={i === n - 1 ? 600 : undefined}
                  fontFamily="Inter,sans-serif"
                >
                  {periodLabel(m.period)}
                </text>
              ))}
            </svg>
          </div>

          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-line" style={{ background: "#4137f9" }}></div>
              <span className="legend-lbl">Số dư tích lũy</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: "#ef6b7c" }}></div>
              <span className="legend-lbl">Chi phí bảo trì</span>
            </div>
          </div>
        </div>

        {/* Fund info card */}
        <div className="fund-info-card">
          <div className="fund-info-title">Thông tin quỹ</div>

          <div className="fund-info-list">
            {[
              { k: "Ngân hàng", v: overview?.bankName ?? "—" },
              { k: "Số tài khoản", v: overview?.accountNoMasked ?? "—" },
              { k: "Lãi suất tiền gửi", v: overview ? `${overview.interestRate}% / năm` : "—", cls: "green" },
              { k: "Mức đóng quỹ", v: overview?.contributionRate ?? "—" },
              { k: "Cập nhật lần cuối", v: lastUpdated },
            ].map((r) => (
              <div className="fund-info-row" key={r.k}>
                <span className="fund-info-key">{r.k}</span>
                <span className={`fund-info-val ${r.cls ?? ""}`}>{r.v}</span>
              </div>
            ))}
          </div>

          <div className="collect-rate-wrap">
            <div className="collect-rate-hd">
              <span className="collect-rate-label">Tỉ lệ thu quỹ</span>
              <span className="collect-rate-val">{overview?.collectionRate ?? 0}%</span>
            </div>
            <div className="collect-bar-track">
              <div className="collect-bar-fill" style={{ width: `${overview?.collectionRate ?? 0}%` }}></div>
            </div>
            <span className="collect-sub">
              {formatNumber(overview?.unitsPaid)} / {formatNumber(overview?.unitsTotal)} căn hộ đã đóng quỹ — còn {formatNumber(overview?.unitsUnpaid)} căn chưa đóng
            </span>
          </div>
        </div>
      </div>

      {/* ── Two tables ── */}
      <div className="two-table-row">
        <div className="table-card">
          <div className="table-hd">
            <div className="table-title">Chi phí bảo trì gần đây</div>
            <span className="table-link" onClick={handleExport} style={{ cursor: "pointer" }}>Xuất CSV →</span>
          </div>
          <div className="exp-table">
            <div className="exp-hd">
              <span>Hạng mục</span>
              <span>Nhà thầu</span>
              <span>Số tiền</span>
              <span style={{ textAlign: "center" }}>Trạng thái</span>
            </div>
            {(completed ?? []).map((r) => {
              const st = MAINTENANCE_STATUS[r.status] ?? MAINTENANCE_STATUS.completed;
              return (
                <div className="exp-row" key={r.id} onClick={() => setSelectedJob(r)} style={{ cursor: "pointer" }}>
                  <div>
                    <div className="exp-name">{r.name}</div>
                    <div style={{ fontSize: "11px", color: "#585c7b" }}>{formatDate(r.actualDate)}</div>
                  </div>
                  <div className="exp-contractor">{r.contractor}</div>
                  <div className="exp-amount">{formatVnd(r.amount)}</div>
                  <div className="exp-status-wrap">
                    <span className="badge badge-green" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="table-card">
          <div className="table-hd">
            <div className="table-title">Kế hoạch bảo trì sắp tới</div>
          </div>
          <div className="plan-list">
            {planRows.map(({ job }) => {
              const st = MAINTENANCE_STATUS[job.status] ?? MAINTENANCE_STATUS.planned;
              const dot = job.status === "tentative" ? "tentative" : "planned";
              const badge = job.status === "tentative" ? "gray" : "blue";
              const metaPrefix = job.status === "tentative" ? "Đang chọn nhà thầu" : job.contractor;
              return (
                <div className="plan-row" key={job.id} onClick={() => setSelectedJob(job)} style={{ cursor: "pointer" }}>
                  <div className="plan-dot-col"><div className={`plan-dot ${dot}`}></div></div>
                  <div className="plan-body">
                    <div className="plan-name">{job.name}</div>
                    <div className="plan-meta">{metaPrefix} • {job.scheduledPeriod}</div>
                  </div>
                  <div className="plan-right">
                    <div className="plan-amount">{formatVnd(job.estimatedCost)}</div>
                    <div className="plan-period">
                      <span className={`badge badge-${badge}`} style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tình hình thu quỹ theo Block ── */}
      <div className="block-card">
        <div className="block-card-hd">
          <div className="block-card-title">Tình hình thu quỹ theo Block</div>
          <span className="block-card-meta">
            Cập nhật: {lastUpdated} • Tổng {formatNumber(overview?.unitsPaid)} / {formatNumber(overview?.unitsTotal)} căn hộ
          </span>
        </div>
        <div className="block-grid">
          {(blocks ?? []).map((b) => (
            <div className="block-item" key={b.block}>
              <div className="block-item-hd">
                <span className="block-name">{b.block}</span>
                <span className="block-count">{formatNumber(b.unitsPaid)} / {formatNumber(b.unitsTotal)} căn hộ</span>
              </div>
              <div className="block-track">
                <div className="block-fill" style={{ width: `${b.rate}%`, background: "linear-gradient(90deg,#22c08a,#1c9d5f)" }}></div>
              </div>
              <div className="block-foot">
                <span className="block-pct">{b.rate}%</span>
                <span className="block-missing">Còn {formatNumber(b.unitsUnpaid)} căn chưa đóng</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}

// ── Maintenance job detail popup ───────────────────────────────
function JobDetailModal({ job, onClose }: { job: FundJob; onClose: () => void }) {
  const st = MAINTENANCE_STATUS[job.status] ?? MAINTENANCE_STATUS.planned;
  const isTentative = job.status === "tentative";
  return (
    <Modal
      onClose={onClose}
      width={500}
      title={job.name}
      headerAccent={<ModalBadge label={st.label} bg={st.bg} color={st.color} />}
    >
      <div style={{ padding: "16px 24px 24px" }}>
        <ModalField label="Nhà thầu" value={isTentative ? "Đang chọn nhà thầu" : (job.contractor || "—")} />
        {job.amount != null && <ModalField label="Số tiền đã chi" value={formatVnd(job.amount)} valueColor="#f5222d" />}
        {job.estimatedCost != null && <ModalField label="Chi phí dự kiến" value={formatVnd(job.estimatedCost)} />}
        {job.scheduledPeriod && <ModalField label="Kỳ kế hoạch" value={job.scheduledPeriod} />}
        {job.actualDate && <ModalField label="Ngày thực hiện" value={formatDate(job.actualDate)} />}
      </div>
    </Modal>
  );
}
