/* eslint-disable @next/next/no-img-element */
"use client";

import { useApiData } from "@/lib/hooks";
import { formatVnd, formatNumber, formatDate } from "@/lib/format";

const UP_IMG = "data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDExIDExIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iU1ZHIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTIuNzUgNi44NzVMNS41IDQuMTI1TDguMjUgNi44NzUiIHN0cm9rZT0idmFyKC0tc3Ryb2tlLTAsICM1MkM0MUEpIiBzdHJva2Utd2lkdGg9IjEuMzc1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8L3N2Zz4K";
const DOWN_IMG = "data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDExIDExIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iU1ZHIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTIuNzUgNi44NzVMNS41IDQuMTI1TDguMjUgNi44NzUiIHN0cm9rZT0idmFyKC0tc3Ryb2tlLTAsICNGNTIyMkQpIiBzdHJva2Utd2lkdGg9IjEuMzc1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8L3N2Zz4K";

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
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNjY2NyAyLjY2Njk5SDMuMzMzMzNDMi41OTY5NSAyLjY2Njk5IDIgMy4yNjM5NSAyIDQuMDAwMzNWMTMuMzMzN0MyIDE0LjA3IDIuNTk2OTUgMTQuNjY3IDMuMzMzMzMgMTQuNjY3SDEyLjY2NjdDMTMuNDAzIDE0LjY2NyAxNCAxNC4wNyAxNCAxMy4zMzM3VjQuMDAwMzNDMTQgMy4yNjM5NSAxMy40MDMgMi42NjY5OSAxMi42NjY3IDIuNjY2OTlaIiBzdHJva2U9IiMyNzI3MjciIHN0cm9rZS13aWR0aD0iMS4zMzMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEwLjY2NyAxLjMzMzAxVjMuOTk5NjciIHN0cm9rZT0iIzI3MjcyNyIgc3Ryb2tlLXdpZHRoPSIxLjMzMzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNS4zMzMwMSAxLjMzMzAxVjMuOTk5NjciIHN0cm9rZT0iIzI3MjcyNyIgc3Ryb2tlLXdpZHRoPSIxLjMzMzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMiA2LjY2Njk5SDE0IiBzdHJva2U9IiMyNzI3MjciIHN0cm9rZS13aWR0aD0iMS4zMzMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="" width="16" height="16" />
            {longLabel ? `Tháng ${parsePeriod(period).m}/${parsePeriod(period).y}` : "Đang tải..."}
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMy41IDUuMjVMNyA4Ljc1TDEwLjUgNS4yNSIgc3Ryb2tlPSIjNTg1QzdCIiBzdHJva2Utd2lkdGg9IjEuMTY2NjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==" alt="" width="14" height="14" />
          </button>
          <button className="fin-btn">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQgMTBWMTIuNjY2N0MxNCAxMy4wMjAzIDEzLjg1OTUgMTMuMzU5NCAxMy42MDk1IDEzLjYwOTVDMTMuMzU5NCAxMy44NTk1IDEzLjAyMDMgMTQgMTIuNjY2NyAxNEgzLjMzMzMzQzIuOTc5NzEgMTQgMi42NDA1NyAxMy44NTk1IDIuMzkwNTIgMTMuNjA5NUMyLjE0MDQ4IDEzLjM1OTQgMiAxMy4wMjAzIDIgMTIuNjY2N1YxMCIgc3Ryb2tlPSIjMjcyNzI3IiBzdHJva2Utd2lkdGg9IjEuMzMzMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik00LjY2Njk5IDYuNjY2OTlMOC4wMDAzMyAxMC4wMDAzTDExLjMzMzcgNi42NjY5OSIgc3Ryb2tlPSIjMjcyNzI3IiBzdHJva2Utd2lkdGg9IjEuMzMzMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik04IDEwVjIiIHN0cm9rZT0iIzI3MjcyNyIgc3Ryb2tlLXdpZHRoPSIxLjMzMzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="" width="16" height="16" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#efeeff" }}>
            <img src="data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDIyIDIyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iU1ZHIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTE5LjI1IDExVjYuNDE2NjdINC41ODMzM0M0LjA5NzEgNi40MTY2NyAzLjYzMDc5IDYuMjIzNTEgMy4yODY5NyA1Ljg3OTdDMi45NDMxNSA1LjUzNTg4IDIuNzUgNS4wNjk1NiAyLjc1IDQuNTgzMzNDMi43NSA0LjA5NzEgMi45NDMxNSAzLjYzMDc5IDMuMjg2OTcgMy4yODY5N0MzLjYzMDc5IDIuOTQzMTUgNC4wOTcxIDIuNzUgNC41ODMzMyAyLjc1SDE3LjQxNjdWNi40MTY2NyIgc3Ryb2tlPSJ2YXIoLS1zdHJva2UtMCwgIzQxMzdGOSkiIHN0cm9rZS13aWR0aD0iMS44MzMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfMiIgZD0iTTIuNzUgNC41ODMzM1YxNy40MTY3QzIuNzUgMTcuOTAyOSAyLjk0MzE1IDE4LjM2OTIgMy4yODY5NyAxOC43MTNDMy42MzA3OSAxOS4wNTY4IDQuMDk3MSAxOS4yNSA0LjU4MzMzIDE5LjI1SDE5LjI1VjE0LjY2NjciIHN0cm9rZT0idmFyKC0tc3Ryb2tlLTAsICM0MTM3RjkpIiBzdHJva2Utd2lkdGg9IjEuODMzMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBpZD0iVmVjdG9yXzMiIGQ9Ik0xNi41IDExQzE2LjAxMzggMTEgMTUuNTQ3NSAxMS4xOTMyIDE1LjIwMzYgMTEuNTM3QzE0Ljg1OTggMTEuODgwOCAxNC42NjY3IDEyLjM0NzEgMTQuNjY2NyAxMi44MzMzQzE0LjY2NjcgMTMuMzE5NiAxNC44NTk4IDEzLjc4NTkgMTUuMjAzNiAxNC4xMjk3QzE1LjU0NzUgMTQuNDczNSAxNi4wMTM4IDE0LjY2NjcgMTYuNSAxNC42NjY3SDIwLjE2NjdWMTFIMTYuNVoiIHN0cm9rZT0idmFyKC0tc3Ryb2tlLTAsICM0MTM3RjkpIiBzdHJva2Utd2lkdGg9IjEuODMzMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L2c+Cjwvc3ZnPgo=" alt="" width="22" height="22" />
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
            <img src="data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDIyIDIyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iU1ZHIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTExIDQuNTgzMzNWMTcuNDE2NyIgc3Ryb2tlPSJ2YXIoLS1zdHJva2UtMCwgI0Y1MjIyRCkiIHN0cm9rZS13aWR0aD0iMS44MzMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfMiIgZD0iTTE3LjQxNjcgMTFMMTEgMTcuNDE2N0w0LjU4MzMzIDExIiBzdHJva2U9InZhcigtLXN0cm9rZS0wLCAjRjUyMjJEKSIgc3Ryb2tlLXdpZHRoPSIxLjgzMzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8L3N2Zz4K" alt="" width="22" height="22" />
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
            <img src="data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDIyIDIyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iU1ZHIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTIwLjE2NjcgNi40MTY2N0wxMi4zNzUgMTQuMjA4M0w3Ljc5MTY3IDkuNjI1TDEuODMzMzMgMTUuNTgzMyIgc3Ryb2tlPSJ2YXIoLS1zdHJva2UtMCwgIzUyQzQxQSkiIHN0cm9rZS13aWR0aD0iMS44MzMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfMiIgZD0iTTE0LjY2NjcgNi40MTY2N0gyMC4xNjY3VjExLjkxNjciIHN0cm9rZT0idmFyKC0tc3Ryb2tlLTAsICM1MkM0MUEpIiBzdHJva2Utd2lkdGg9IjEuODMzMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L2c+Cjwvc3ZnPgo=" alt="" width="22" height="22" />
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
            <img src="data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDIyIDIyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iU1ZHIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTExIDcuMzMzMzNDMTUuNTU2MyA3LjMzMzMzIDE5LjI1IDYuMTAyMTIgMTkuMjUgNC41ODMzM0MxOS4yNSAzLjA2NDU1IDE1LjU1NjMgMS44MzMzMyAxMSAxLjgzMzMzQzYuNDQzNjUgMS44MzMzMyAyLjc1IDMuMDY0NTUgMi43NSA0LjU4MzMzQzIuNzUgNi4xMDIxMiA2LjQ0MzY1IDcuMzMzMzMgMTEgNy4zMzMzM1oiIHN0cm9rZT0idmFyKC0tc3Ryb2tlLTAsICMyRjdCRjYpIiBzdHJva2Utd2lkdGg9IjEuODMzMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBpZD0iVmVjdG9yXzIiIGQ9Ik0yLjc1IDQuNTgzMzNWMTAuMDgzM0MyLjc1IDExLjYwNSA2LjQxNjY3IDEyLjgzMzMgMTEgMTIuODMzM0MxNS41ODMzIDEyLjgzMzMgMTkuMjUgMTEuNjA1IDE5LjI1IDEwLjA4MzNWNC41ODMzMyIgc3Ryb2tlPSJ2YXIoLS1zdHJva2UtMCwgIzJGN0JGNikiIHN0cm9rZS13aWR0aD0iMS44MzMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfMyIgZD0iTTIuNzUgMTAuMDgzM1YxNS41ODMzQzIuNzUgMTcuMTA1IDYuNDE2NjcgMTguMzMzMyAxMSAxOC4zMzMzQzE1LjU4MzMgMTguMzMzMyAxOS4yNSAxNy4xMDUgMTkuMjUgMTUuNTgzM1YxMC4wODMzIiBzdHJva2U9InZhcigtLXN0cm9rZS0wLCAjMkY3QkY2KSIgc3Ryb2tlLXdpZHRoPSIxLjgzMzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8L3N2Zz4K" alt="" width="22" height="22" />
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
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMyA0LjVMNiA3LjVMOSA0LjUiIHN0cm9rZT0iIzNFNDI2NSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="" width="12" height="12" />
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
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOSAwLjc1TDE1Ljc1IDMuNzVWOC4yNUMxNS43NSAxMi40MTI1IDEyLjg3IDE2LjMwNSA5IDE3LjI1QzUuMTMgMTYuMzA1IDIuMjUgMTIuNDEyNSAyLjI1IDguMjVWMy43NUw5IDAuNzVaIiBmaWxsPSIjNDEzN0Y5Ii8+PC9zdmc+" alt="" width="18" height="18" />
            <span>Quỹ bảo trì</span>
          </div>
          <div className="sum-grid">
            <div className="sum-main">
              <div className="sum-mlbl">Số dư hiện tại</div>
              <div className="sum-bigval">{data ? formatVnd(data.maintenanceFund.balance) : "Đang tải..."}</div>
              <div className="sum-trend">
                <img src={fundTrend === "down" ? DOWN_IMG : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEiIGhlaWdodD0iMTEiIHZpZXdCb3g9IjAgMCAxMSAxMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMi43NSA2Ljg3NUw1LjUgNC4xMjVMOC4yNSA2Ljg3NSIgc3Ryb2tlPSIjNTJDNDFBIiBzdHJva2Utd2lkdGg9IjEuMzc1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4="} alt="" width="11" height="11" />
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
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHZpZXdCb3g9IjAgMCAxMyAxMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMi43MDgwMSA2LjVIMTAuMjkxMyIgc3Ryb2tlPSIjNDEzN0Y5IiBzdHJva2Utd2lkdGg9IjEuMDgzMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik02LjUgMi43MDgwMUwxMC4yOTE3IDYuNDk5NjdMNi41IDEwLjI5MTMiIHN0cm9rZT0iIzQxMzdGOSIgc3Ryb2tlLXdpZHRoPSIxLjA4MzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="" width="13" height="13" />
          </a>
        </div>

        <div className="sum-card">
          <div className="sum-title">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYuNSA5SDEzLjVMMTEuMjUgMTUuNzVMNi43NSAyLjI1TDQuNSA5SDEuNSIgc3Ryb2tlPSIjNDEzN0Y5IiBzdHJva2Utd2lkdGg9IjEuNjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==" alt="" width="18" height="18" />
            <span>Chỉ số tài chính</span>
          </div>
          <div className="metric-list">
            <div className="metric-row">
              <div className="metric-icon" style={{ background: "#efffe7" }}>
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQuNjY2MyA0LjY2Njk5TDguOTk5NjcgMTAuMzMzN0w1LjY2NjM0IDcuMDAwMzNMMS4zMzMwMSAxMS4zMzM3IiBzdHJva2U9IiM1MkM0MUEiIHN0cm9rZS13aWR0aD0iMS4zMzMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEwLjY2NyA0LjY2Njk5SDE0LjY2N1Y4LjY2Njk5IiBzdHJva2U9IiM1MkM0MUEiIHN0cm9rZS13aWR0aD0iMS4zMzMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="" width="16" height="16" />
              </div>
              <div className="metric-name">Tỷ lệ thu phí</div>
              <div className="metric-val">{ratios ? `${ratios.collectionRate}%` : "—"}</div>
              <div className={`metric-trend ${dirClass(undefined, ratios?.collectionRateChangePct)}`}>
                {signedPct(ratios?.collectionRateChangePct)} so với {prevPeriodShort(period)}
              </div>
            </div>
            <div className="metric-row">
              <div className="metric-icon" style={{ background: "#fff1de" }}>
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQuNjY2MyAxMS4zMzNMOC45OTk2NyA1LjY2Njk5TDUuNjY2MzQgOS4wMDAzM0wxLjMzMzAxIDQuNjY2OTkiIHN0cm9rZT0iI0U4OUEyQyIgc3Ryb2tlLXdpZHRoPSIxLjMzMzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTAuNjY3IDExLjMzM0gxNC42NjdWNy4zMzMiIHN0cm9rZT0iI0U4OUEyQyIgc3Ryb2tlLXdpZHRoPSIxLjMzMzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="" width="16" height="16" />
              </div>
              <div className="metric-name">Tỷ lệ chi phí / Thu</div>
              <div className="metric-val">{ratios ? `${ratios.expenseRatio}%` : "—"}</div>
              <div className={`metric-trend ${dirClass(undefined, ratios?.expenseRatioChangePct)}`}>
                {signedPct(ratios?.expenseRatioChangePct)} so với {prevPeriodShort(period)}
              </div>
            </div>
            <div className="metric-row">
              <div className="metric-icon" style={{ background: "#efeeff" }}>
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNy45OTk2NyAxNC42NjYzQzExLjY4MTYgMTQuNjY2MyAxNC42NjYzIDExLjY4MTYgMTQuNjY2MyA3Ljk5OTY3QzE0LjY2NjMgNC4zMTc3OCAxMS42ODE2IDEuMzMzMDEgNy45OTk2NyAxLjMzMzAxQzQuMzE3NzggMS4zMzMwMSAxLjMzMzAxIDQuMzE3NzggMS4zMzMwMSA3Ljk5OTY3QzEuMzMzMDEgMTEuNjgxNiA0LjMxNzc4IDE0LjY2NjMgNy45OTk2NyAxNC42NjYzWiIgc3Ryb2tlPSIjNDEzN0Y5IiBzdHJva2Utd2lkdGg9IjEuMzMzMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik04IDRWOEwxMC42NjY3IDkuMzMzMzMiIHN0cm9rZT0iIzQxMzdGOSIgc3Ryb2tlLXdpZHRoPSIxLjMzMzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="" width="16" height="16" />
              </div>
              <div className="metric-name">Tỷ lệ sử dụng quỹ bảo trì</div>
              <div className="metric-val">{ratios ? `${ratios.fundUsageRate}%` : "—"}</div>
              <div className="metric-trend neu">+0% so với {prevPeriodShort(period)}</div>
            </div>
          </div>
          <a href="#" className="sum-link">
            Xem tất cả chỉ số
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHZpZXdCb3g9IjAgMCAxMyAxMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMi43MDgwMSA2LjVIMTAuMjkxMyIgc3Ryb2tlPSIjNDEzN0Y5IiBzdHJva2Utd2lkdGg9IjEuMDgzMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik02LjUgMi43MDgwMUwxMC4yOTE3IDYuNDk5NjdMNi41IDEwLjI5MTMiIHN0cm9rZT0iIzQxMzdGOSIgc3Ryb2tlLXdpZHRoPSIxLjA4MzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="" width="13" height="13" />
          </a>
        </div>
      </div>

      {/* ── Báo cáo tài chính mới nhất ── */}
      <div className="report-card">
        <div className="report-hd">
          <div className="report-title">Báo cáo tài chính mới nhất</div>
          <a href="#" className="report-link">
            Xem tất cả
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHZpZXdCb3g9IjAgMCAxMyAxMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNC44NzUgOS43NUw4LjEyNSA2LjVMNC44NzUgMy4yNSIgc3Ryb2tlPSIjNDEzN0Y5IiBzdHJva2Utd2lkdGg9IjEuMDgzMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==" alt="" width="13" height="13" />
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
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHZpZXdCb3g9IjAgMCAxMyAxMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAuMjkxNyAyLjE2Njk5SDIuNzA4MzNDMi4xMTAwMiAyLjE2Njk5IDEuNjI1IDIuNjUyMDIgMS42MjUgMy4yNTAzM1YxMC44MzM3QzEuNjI1IDExLjQzMiAyLjExMDAyIDExLjkxNyAyLjcwODMzIDExLjkxN0gxMC4yOTE3QzEwLjg5IDExLjkxNyAxMS4zNzUgMTEuNDMyIDExLjM3NSAxMC44MzM3VjMuMjUwMzNDMTEuMzc1IDIuNjUyMDIgMTAuODkgMi4xNjY5OSAxMC4yOTE3IDIuMTY2OTlaIiBzdHJva2U9IiM1ODVDN0IiIHN0cm9rZS13aWR0aD0iMS4wODMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTguNjY2OTkgMS4wODMwMVYzLjI0OTY3IiBzdHJva2U9IiM1ODVDN0IiIHN0cm9rZS13aWR0aD0iMS4wODMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTQuMzMzMDEgMS4wODMwMVYzLjI0OTY3IiBzdHJva2U9IiM1ODVDN0IiIHN0cm9rZS13aWR0aD0iMS4wODMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEuNjI1IDUuNDE2OTlIMTEuMzc1IiBzdHJva2U9IiM1ODVDN0IiIHN0cm9rZS13aWR0aD0iMS4wODMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="" width="13" height="13" />
              <span className="report-mlbl">Ngày tạo</span>
            </div>
            <span className="report-mval">{data?.latestReport ? formatDate(data.latestReport.publishedAt) : "—"}</span>
          </div>
          <div className="report-meta">
            <div className="report-mitem">
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHZpZXdCb3g9IjAgMCAxMyAxMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMC41NDIgNi41QzAuNTQyIDYuNSAyLjcwOCAyLjE2NyA2LjUgMi4xNjdDMTAuMjkyIDIuMTY3IDEyLjQ1OCA2LjUgMTIuNDU4IDYuNUMxMi40NTggNi41IDEwLjI5MiAxMC44MzMgNi41IDEwLjgzM0MyLjcwOCAxMC44MzMgMC41NDIgNi41IDAuNTQyIDYuNVoiIHN0cm9rZT0iIzU4NUM3QiIgc3Ryb2tlLXdpZHRoPSIxLjA4MzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNi41IDguMTI1QzcuMzk3NDYgOC4xMjUgOC4xMjUgNy4zOTc0NiA4LjEyNSA2LjVDOC4xMjUgNS42MDI1NCA3LjM5NzQ2IDQuODc1IDYuNSA0Ljg3NUM1LjYwMjU0IDQuODc1IDQuODc1IDUuNjAyNTQgNC44NzUgNi41QzQuODc1IDcuMzk3NDYgNS42MDI1NCA4LjEyNSA2LjUgOC4xMjVaIiBzdHJva2U9IiM1ODVDN0IiIHN0cm9rZS13aWR0aD0iMS4wODMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="" width="13" height="13" />
              <span className="report-mlbl">Lượt xem</span>
            </div>
            <span className="report-mval">{data?.latestReport ? formatNumber(data.latestReport.viewCount) : "—"}</span>
          </div>
          <a href="#" className="report-dl">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAxNSAxNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTMuMTI1IDkuMzc1VjExLjg3NUMxMy4xMjUgMTIuMjA2NSAxMi45OTMzIDEyLjUyNDUgMTIuNzU4OSAxMi43NTg5QzEyLjUyNDUgMTIuOTkzMyAxMi4yMDY1IDEzLjEyNSAxMS44NzUgMTMuMTI1SDMuMTI1QzIuNzkzNDggMTMuMTI1IDIuNDc1NTQgMTIuOTkzMyAyLjI0MTEyIDEyLjc1ODlDMi4wMDY3IDEyLjUyNDUgMS44NzUgMTIuMjA2NSAxLjg3NSAxMS44NzVWOS4zNzUiIHN0cm9rZT0iIzQxMzdGOSIgc3Ryb2tlLXdpZHRoPSIxLjI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNC4zNzUgNi4yNUw3LjUgOS4zNzVMMTAuNjI1IDYuMjUiIHN0cm9rZT0iIzQxMzdGOSIgc3Ryb2tlLXdpZHRoPSIxLjI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNy41IDkuMzc1VjEuODc1IiBzdHJva2U9IiM0MTM3RjkiIHN0cm9rZS13aWR0aD0iMS4yNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="" width="15" height="15" />
            Tải xuống
          </a>
        </div>
      </div>
    </div>
  );
}
