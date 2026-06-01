/* eslint-disable @next/next/no-img-element */
"use client";

import { useApiData } from "@/lib/hooks";
import { formatVnd, formatNumber, formatDate } from "@/lib/format";

const UP_IMG = "https://www.figma.com/api/mcp/asset/07b679db-3ec2-4a70-acb0-a92326a51f04";
const DOWN_IMG = "https://www.figma.com/api/mcp/asset/39450053-803f-485d-803e-0750a3c14591";

interface LineItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  pctOfTotal: number;
  comparisonPct: number | null;
  comparisonDirection: string;
  subInfo: string;
  color: string | null;
}

interface FinancialOverview {
  period: string;
  totalIncome: number;
  totalExpense: number;
  surplus: number;
  incomeChangePct: number;
  expenseChangePct: number;
  surplusChangePct: number;
  ratios: {
    collectionRate: number;
    expenseRatio: number;
    fundUsageRate: number;
    collectionRateChangePct: number;
    expenseRatioChangePct: number;
  };
  unitsPaid: number;
  unitsTotal: number;
  lineItems: { income: LineItem[]; expense: LineItem[] };
  maintenanceFund: { balance: number; balanceChangePct: number };
  latestReport: {
    title: string;
    fileType: string;
    sizeBytes: number;
    sizeLabel: string;
    publishedAt: string;
    viewCount: number;
    responsibleName: string | null;
  } | null;
}

interface Period {
  period: string;
  totalIncome: number;
  totalExpense: number;
  surplus: number;
}

// "2026-05" -> { m: 5, y: 2026 }
function parsePeriod(p?: string): { m: number; y: number } {
  if (!p) return { m: 0, y: 0 };
  const [y, m] = p.split("-").map((v) => parseInt(v, 10));
  return { m, y };
}
// "2026-05" -> "tháng 5/2026"
function periodLong(p?: string): string {
  const { m, y } = parsePeriod(p);
  return m ? `tháng ${m}/${y}` : "";
}
// previous month label "so với tháng 4/2026"
function prevPeriodLong(p?: string): string {
  const { m, y } = parsePeriod(p);
  if (!m) return "";
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;
  return `tháng ${pm}/${py}`;
}
// "2026-05" -> "T5/26"
function periodShort(p?: string): string {
  const { m, y } = parsePeriod(p);
  return m ? `T${m}/${String(y).slice(2)}` : "";
}
// previous month short label e.g. "T4/26"
function prevPeriodShort(p?: string): string {
  const { m, y } = parsePeriod(p);
  if (!m) return "";
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;
  return `T${pm}/${String(py).slice(2)}`;
}

function pctLabel(pct?: number | null): string {
  if (pct == null) return "0%";
  return `${Math.abs(pct).toFixed(1)}%`;
}
function signedPct(pct?: number | null): string {
  if (pct == null) return "+0%";
  const sign = pct > 0 ? "+" : pct < 0 ? "-" : "+";
  return `${sign}${Math.abs(pct)}%`;
}
function dirClass(direction?: string, pct?: number | null): "up" | "down" | "neu" {
  if (direction === "up") return "up";
  if (direction === "down") return "down";
  if (direction === "neutral") return "neu";
  if (pct == null || pct === 0) return "neu";
  return pct > 0 ? "up" : "down";
}

export default function FinanceOverviewPage() {
  const { data } = useApiData<FinancialOverview>("/financial/overview");
  const { data: periods } = useApiData<Period[]>("/financial/periods?months=6");

  const period = data?.period;
  const longLabel = periodLong(period);
  const prevLabel = prevPeriodLong(period);
  const expenseItems = data?.lineItems?.expense ?? [];
  const list = periods ?? [];

  // ── Chart geometry (matches original viewBox 0 0 700 285) ──
  // y=8 (top) .. y=260 (baseline, value 0). Plot height = 252.
  const PLOT_TOP = 8;
  const PLOT_BOTTOM = 260;
  const PLOT_H = PLOT_BOTTOM - PLOT_TOP; // 252
  // Max scale: round up to a "nice" billion so y-axis labels stay sensible.
  const rawMax = list.reduce(
    (mx, p) => Math.max(mx, p.totalIncome, p.totalExpense),
    0,
  );
  const axisMax = rawMax > 0 ? Math.ceil(rawMax / 1e9) * 1e9 : 4e9; // e.g. 4B
  const yTicks = 4; // 4 gridlines above baseline
  const valToY = (v: number) => PLOT_BOTTOM - (v / axisMax) * PLOT_H;
  // Group x positions taken from original (income bar x, +26 for expense bar).
  const groupX = [72, 180, 288, 396, 504, 612];
  const BAR_W = 22;
  const surplusMax = list.reduce((mx, p) => Math.max(mx, p.surplus), 0) || 1;
  // Surplus line sits in lower band (original points span ~216-235 over y).
  // Map surplus proportionally into a band near the baseline for visual parity.
  const SURPLUS_TOP = 210;
  const SURPLUS_BOTTOM = 248;
  const surplusY = (v: number) =>
    SURPLUS_BOTTOM - (v / surplusMax) * (SURPLUS_BOTTOM - SURPLUS_TOP);

  const incomeTrend = dirClass(undefined, data?.incomeChangePct);
  const expenseTrend = dirClass(undefined, data?.expenseChangePct);
  const surplusTrend = dirClass(undefined, data?.surplusChangePct);
  const fundTrend = dirClass(undefined, data?.maintenanceFund?.balanceChangePct);

  const fundDelta = data
    ? Math.round((data.maintenanceFund.balance * data.maintenanceFund.balanceChangePct) /
        (100 + data.maintenanceFund.balanceChangePct))
    : 0;
  const fundStart = data ? data.maintenanceFund.balance - fundDelta : 0;

  const ratios = data?.ratios;

  return (
    <div className="fin-page">
      {/* ── Page header ── */}
      <div className="fin-page-hd">
        <div>
          <h1 className="fin-title">Tổng quan tài chính</h1>
          <p className="fin-sub">Cập nhật tình hình thu chi, quỹ và các chỉ số tài chính của tòa nhà</p>
        </div>
        <div className="fin-actions">
          <button className="fin-btn">
            <img src="https://www.figma.com/api/mcp/asset/bb824f87-1b0e-4c71-ba99-09a0e1da7f1e" alt="" width="16" height="16" />
            {longLabel ? `Tháng ${parsePeriod(period).m}/${parsePeriod(period).y}` : "Đang tải..."}
            <img src="https://www.figma.com/api/mcp/asset/68ffcd0e-3438-4ca4-9d64-847b5ccf5b79" alt="" width="14" height="14" />
          </button>
          <button className="fin-btn">
            <img src="https://www.figma.com/api/mcp/asset/690e85bc-cb14-4eb3-931b-790db95c8d26" alt="" width="16" height="16" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#efeeff" }}>
            <img src="https://www.figma.com/api/mcp/asset/76a8ace0-d7c2-4074-bf26-caa39551254e" alt="" width="22" height="22" />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Tổng thu trong tháng</div>
            <div className="kpi-value">{data ? formatVnd(data.totalIncome) : "Đang tải..."}</div>
            <div className="kpi-trend">
              <img src={incomeTrend === "down" ? DOWN_IMG : UP_IMG} alt="" width="11" height="11" />
              <span className={`kpi-pct ${incomeTrend === "neu" ? "up" : incomeTrend}`}>{pctLabel(data?.incomeChangePct)}</span>
              <span className="kpi-tlabel">so với {prevLabel}</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#ffeded" }}>
            <img src="https://www.figma.com/api/mcp/asset/3eec0cf0-a93a-4dba-b3a1-d0a31d498f64" alt="" width="22" height="22" />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Tổng chi trong tháng</div>
            <div className="kpi-value">{data ? formatVnd(data.totalExpense) : "Đang tải..."}</div>
            <div className="kpi-trend">
              <img src={expenseTrend === "down" ? DOWN_IMG : UP_IMG} alt="" width="11" height="11" />
              <span className={`kpi-pct ${expenseTrend === "neu" ? "up" : expenseTrend}`}>{pctLabel(data?.expenseChangePct)}</span>
              <span className="kpi-tlabel">so với {prevLabel}</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#efffe7" }}>
            <img src="https://www.figma.com/api/mcp/asset/1351b03a-eb8f-4a37-b663-cac5b38c302c" alt="" width="22" height="22" />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Thặng dư/thâm hụt</div>
            <div className="kpi-value">{data ? formatVnd(data.surplus) : "Đang tải..."}</div>
            <div className="kpi-trend">
              <img src={surplusTrend === "down" ? DOWN_IMG : UP_IMG} alt="" width="11" height="11" />
              <span className={`kpi-pct ${surplusTrend === "neu" ? "up" : surplusTrend}`}>{pctLabel(data?.surplusChangePct)}</span>
              <span className="kpi-tlabel">so với {prevLabel}</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#e4f1ff" }}>
            <img src="https://www.figma.com/api/mcp/asset/0daa5a59-6d8f-431c-bc64-893e8920578d" alt="" width="22" height="22" />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Quỹ bảo trì hiện tại</div>
            <div className="kpi-value">{data ? formatVnd(data.maintenanceFund.balance) : "Đang tải..."}</div>
            <div className="kpi-trend">
              <img src={fundTrend === "down" ? DOWN_IMG : UP_IMG} alt="" width="11" height="11" />
              <span className={`kpi-pct ${fundTrend === "neu" ? "up" : fundTrend}`}>{pctLabel(data?.maintenanceFund?.balanceChangePct)}</span>
              <span className="kpi-tlabel">so với {prevLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart Row ── */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="chart-hd">
            <div className="chart-title">
              Thu chi theo tháng
              <span className="chart-info">i</span>
            </div>
            <button className="chart-period">
              6 tháng gần nhất
              <img src="https://www.figma.com/api/mcp/asset/9ca275cd-9232-4f52-ae8d-87092e85d00e" alt="" width="12" height="12" />
            </button>
          </div>

          <div className="chart-svg-area">
            <svg
              viewBox="0 0 700 285"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block", width: "100%", height: "285px", overflow: "visible" }}
            >
              <line x1="42" y1="8" x2="692" y2="8" stroke="#eaecf4" strokeWidth="1" />
              <line x1="42" y1="71" x2="692" y2="71" stroke="#eaecf4" strokeWidth="1" />
              <line x1="42" y1="134" x2="692" y2="134" stroke="#eaecf4" strokeWidth="1" />
              <line x1="42" y1="197" x2="692" y2="197" stroke="#eaecf4" strokeWidth="1" />
              <line x1="42" y1="260" x2="692" y2="260" stroke="#eaecf4" strokeWidth="1" />

              {list.length > 0 && (
                <rect x={groupX[list.length - 1] - 0} y="8" width="52" height="252" rx="4" fill="#f5f4ff" opacity="0.6" />
              )}

              {list.map((p, i) => {
                const x = groupX[i];
                const incY = valToY(p.totalIncome);
                const expY = valToY(p.totalExpense);
                return (
                  <g key={p.period}>
                    <rect x={x} y={incY} width={BAR_W} height={Math.max(0, PLOT_BOTTOM - incY)} rx="3" fill="#8b80f9" />
                    <rect x={x + 26} y={expY} width={BAR_W} height={Math.max(0, PLOT_BOTTOM - expY)} rx="3" fill="#ef6b7c" />
                  </g>
                );
              })}

              {list.length > 0 && (
                <polyline
                  points={list
                    .map((p, i) => `${groupX[i] + 24},${surplusY(p.surplus).toFixed(1)}`)
                    .join(" ")}
                  fill="none"
                  stroke="#22c08a"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

              {list.map((p, i) => {
                const last = i === list.length - 1;
                return (
                  <circle
                    key={p.period}
                    cx={groupX[i] + 24}
                    cy={surplusY(p.surplus)}
                    r={last ? 5 : 4}
                    fill={last ? "#22c08a" : "white"}
                    stroke={last ? "white" : "#22c08a"}
                    strokeWidth="2"
                  />
                );
              })}
            </svg>

            <div className="chart-y-lbl" style={{ top: "8px" }}>{(axisMax / 1e9).toFixed(0)}B</div>
            <div className="chart-y-lbl" style={{ top: "71px" }}>{((axisMax * 3) / 4 / 1e9).toFixed(axisMax / 4e9 >= 1 ? 0 : 1)}B</div>
            <div className="chart-y-lbl" style={{ top: "134px" }}>{((axisMax * 2) / 4 / 1e9).toFixed(axisMax / 4e9 >= 1 ? 0 : 1)}B</div>
            <div className="chart-y-lbl" style={{ top: "197px" }}>{((axisMax * 1) / 4 / 1e9).toFixed(axisMax / 4e9 >= 1 ? 0 : 1)}B</div>
            <div className="chart-y-lbl" style={{ top: "260px" }}>0</div>

            {list.map((p, i) => (
              <div
                key={p.period}
                className="chart-x-lbl"
                style={{ left: `${13.71 + i * 15.43}%` }}
              >
                {periodShort(p.period)}
              </div>
            ))}

            <div className="chart-tooltip">
              <div className="tt-title">{longLabel ? `Tháng ${parsePeriod(period).m}/${parsePeriod(period).y}` : ""}</div>
              <div className="tt-row">
                <div className="tt-dot" style={{ background: "#8b80f9" }}></div>
                <div className="tt-name">Tổng thu</div>
                <div className="tt-val">{data ? formatVnd(data.totalIncome) : "—"}</div>
              </div>
              <div className="tt-row">
                <div className="tt-dot" style={{ background: "#ef6b7c" }}></div>
                <div className="tt-name">Tổng chi</div>
                <div className="tt-val">{data ? formatVnd(data.totalExpense) : "—"}</div>
              </div>
              <div className="tt-row">
                <div className="tt-dot" style={{ background: "#22c08a" }}></div>
                <div className="tt-name">Thặng dư</div>
                <div className="tt-val">{data ? formatVnd(data.surplus) : "—"}</div>
              </div>
            </div>
          </div>

          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: "#8b80f9" }}></div>
              <span className="legend-lbl">Tổng thu</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: "#ef6b7c" }}></div>
              <span className="legend-lbl">Tổng chi</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: "#22c08a" }}></div>
              <span className="legend-lbl">Thặng dư</span>
            </div>
          </div>
        </div>

        {/* Donut chart */}
        <div className="donut-card">
          <div className="donut-title">Cơ cấu chi phí {longLabel}</div>
          <div className="donut-wrap">
            <svg width="205" height="205" viewBox="0 0 205 205" xmlns="http://www.w3.org/2000/svg">
              {(() => {
                const cx = 102.5;
                const cy = 102.5;
                const r = 82;
                const sw = 30;
                const circ = 2 * Math.PI * r;
                let offset = 0;
                return expenseItems.map((item) => {
                  const frac = (item.pctOfTotal ?? 0) / 100;
                  const dash = frac * circ;
                  const seg = (
                    <circle
                      key={item.id}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke={item.color ?? "#c7d3ff"}
                      strokeWidth={sw}
                      strokeDasharray={`${dash} ${circ - dash}`}
                      strokeDashoffset={-offset}
                      transform={`rotate(-90 ${cx} ${cy})`}
                    />
                  );
                  offset += dash;
                  return seg;
                });
              })()}
            </svg>
            <div className="donut-center">
              <div className="donut-cval">{data ? formatVnd(data.totalExpense) : "—"}</div>
              <div className="donut-clbl">Tổng chi</div>
            </div>
          </div>
          <div className="donut-legend">
            {expenseItems.map((item) => (
              <div className="donut-row" key={item.id}>
                <div className="donut-left">
                  <div className="donut-dot" style={{ background: item.color ?? "#c7d3ff" }}></div>
                  <span className="donut-name">{item.name}</span>
                </div>
                <div className="donut-pct">{item.pctOfTotal}%</div>
                <div className="donut-amt">{formatVnd(item.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Summary Row ── */}
      <div className="summary-row">
        <div className="sum-card">
          <div className="sum-title">
            <img src="https://www.figma.com/api/mcp/asset/2692c8e7-b548-4b0f-9156-69077c30d015" alt="" width="18" height="18" />
            <span>Quỹ bảo trì</span>
          </div>
          <div className="sum-grid">
            <div className="sum-main">
              <div className="sum-mlbl">Số dư hiện tại</div>
              <div className="sum-bigval">{data ? formatVnd(data.maintenanceFund.balance) : "Đang tải..."}</div>
              <div className="sum-trend">
                <img src={fundTrend === "down" ? DOWN_IMG : "https://www.figma.com/api/mcp/asset/c6a833b5-a6ff-466a-b396-972bb3661f6e"} alt="" width="11" height="11" />
                <span className="sum-tpct">{pctLabel(data?.maintenanceFund?.balanceChangePct)}</span>
                <span className="sum-tlbl">so với {prevLabel}</span>
              </div>
            </div>
            <div className="sum-details">
              <div className="sum-drow">
                <span className="sum-dkey">Số dư đầu kỳ</span>
                <span className="sum-dval">{data ? formatVnd(fundStart) : "—"}</span>
              </div>
              <div className="sum-drow">
                <span className="sum-dkey">Tăng trong tháng</span>
                <span className="sum-dval green">{data ? formatVnd(fundDelta) : "—"}</span>
              </div>
              <div className="sum-drow">
                <span className="sum-dkey">Đã sử dụng</span>
                <span className="sum-dval">{formatVnd(0)}</span>
              </div>
            </div>
          </div>
          <a href="#" className="sum-link">
            Xem lịch sử quỹ bảo trì
            <img src="https://www.figma.com/api/mcp/asset/2182cf16-c606-4a8d-8028-0a377971172b" alt="" width="13" height="13" />
          </a>
        </div>

        <div className="sum-card">
          <div className="sum-title">
            <img src="https://www.figma.com/api/mcp/asset/67e99264-b523-43a0-8dcf-bb73fa9b811b" alt="" width="18" height="18" />
            <span>Chỉ số tài chính</span>
          </div>
          <div className="metric-list">
            <div className="metric-row">
              <div className="metric-icon" style={{ background: "#efffe7" }}>
                <img src="https://www.figma.com/api/mcp/asset/a1f90758-bdbb-4b40-860d-072060f9689b" alt="" width="16" height="16" />
              </div>
              <div className="metric-name">Tỷ lệ thu phí</div>
              <div className="metric-val">{ratios ? `${ratios.collectionRate}%` : "—"}</div>
              <div className={`metric-trend ${dirClass(undefined, ratios?.collectionRateChangePct)}`}>
                {signedPct(ratios?.collectionRateChangePct)} so với {prevPeriodShort(period)}
              </div>
            </div>
            <div className="metric-row">
              <div className="metric-icon" style={{ background: "#fff1de" }}>
                <img src="https://www.figma.com/api/mcp/asset/8911d112-c0c2-45cf-ac1f-829917821964" alt="" width="16" height="16" />
              </div>
              <div className="metric-name">Tỷ lệ chi phí / Thu</div>
              <div className="metric-val">{ratios ? `${ratios.expenseRatio}%` : "—"}</div>
              <div className={`metric-trend ${dirClass(undefined, ratios?.expenseRatioChangePct)}`}>
                {signedPct(ratios?.expenseRatioChangePct)} so với {prevPeriodShort(period)}
              </div>
            </div>
            <div className="metric-row">
              <div className="metric-icon" style={{ background: "#efeeff" }}>
                <img src="https://www.figma.com/api/mcp/asset/e88157c5-1b73-4936-a61a-3617cc37163d" alt="" width="16" height="16" />
              </div>
              <div className="metric-name">Tỷ lệ sử dụng quỹ bảo trì</div>
              <div className="metric-val">{ratios ? `${ratios.fundUsageRate}%` : "—"}</div>
              <div className="metric-trend neu">+0% so với {prevPeriodShort(period)}</div>
            </div>
          </div>
          <a href="#" className="sum-link">
            Xem tất cả chỉ số
            <img src="https://www.figma.com/api/mcp/asset/2182cf16-c606-4a8d-8028-0a377971172b" alt="" width="13" height="13" />
          </a>
        </div>
      </div>

      {/* ── Báo cáo tài chính mới nhất ── */}
      <div className="report-card">
        <div className="report-hd">
          <div className="report-title">Báo cáo tài chính mới nhất</div>
          <a href="#" className="report-link">
            Xem tất cả
            <img src="https://www.figma.com/api/mcp/asset/5a506401-e463-4a1b-bf42-3f1fa881b635" alt="" width="13" height="13" />
          </a>
        </div>
        <div className="report-body">
          <div className="report-file">
            <div className="pdf-badge">{(data?.latestReport?.fileType ?? "PDF").toUpperCase()}</div>
            <div>
              <div className="report-fname">{data?.latestReport?.title ?? "Đang tải..."}</div>
              <div className="report-fmeta">
                {data?.latestReport
                  ? `${data.latestReport.fileType.toUpperCase()} • ${data.latestReport.sizeLabel} • ${data.latestReport.responsibleName ?? "Ban quản trị"}`
                  : ""}
              </div>
            </div>
          </div>
          <div className="report-meta">
            <div className="report-mitem">
              <img src="https://www.figma.com/api/mcp/asset/62236d98-457d-41ed-b756-7cd5d55209a4" alt="" width="13" height="13" />
              <span className="report-mlbl">Ngày tạo</span>
            </div>
            <span className="report-mval">{data?.latestReport ? formatDate(data.latestReport.publishedAt) : "—"}</span>
          </div>
          <div className="report-meta">
            <div className="report-mitem">
              <img src="https://www.figma.com/api/mcp/asset/78fa00e8-bbd4-4b35-972e-709ed91f109c" alt="" width="13" height="13" />
              <span className="report-mlbl">Lượt xem</span>
            </div>
            <span className="report-mval">{data?.latestReport ? formatNumber(data.latestReport.viewCount) : "—"}</span>
          </div>
          <a href="#" className="report-dl">
            <img src="https://www.figma.com/api/mcp/asset/fb3fce31-7fe7-48a0-bbdd-671441f0b2d4" alt="" width="15" height="15" />
            Tải xuống
          </a>
        </div>
      </div>
    </div>
  );
}
