"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useApiData } from "@/lib/hooks";
import { formatVnd, formatDate } from "@/lib/format";
import { trendDir } from "@/lib/ui-maps";

interface LineItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  pctOfTotal: number;
  comparisonPct: number | null;
  comparisonDirection: string;
  subInfo: string | null;
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
  ratios: { collectionRate: number; expenseRatio: number; expenseRatioChangePct: number };
  lineItems: { income: LineItem[]; expense: LineItem[] };
}
interface PeriodPoint {
  period: string;
  totalIncome: number;
  totalExpense: number;
  surplus: number;
}
interface Txn {
  id: string;
  code: string;
  type: string;
  category: string;
  description: string;
  subInfo: string | null;
  vendorName: string | null;
  contractRef: string | null;
  paymentMethod: string;
  amount: number;
  occurredAt: string;
}
interface TxnResp {
  items: Txn[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const DONUT_COLORS = ["#7a6dff", "#ff9d6a", "#3ddcb6", "#a99cff", "#c7d3ff", "#f5b5d4"];
const PERIOD_LABELS = (period: string) => {
  const [y, m] = period.split("-");
  return `T${parseInt(m, 10)}/${y.slice(2)}`;
};

/** Format a money value to a compact M label, e.g. 748600000 -> "748,6M" */
function toMillionLabel(v: number): string {
  const millions = v / 1_000_000;
  const rounded = Math.round(millions * 10) / 10;
  return `${rounded.toLocaleString("vi-VN", { minimumFractionDigits: rounded % 1 === 0 ? 0 : 1, maximumFractionDigits: 1 })}M`;
}

/** Format a signed percentage chip text, e.g. 8.2 -> "+8.2%", 0 -> "±0%" */
function pctChip(pct: number | null): string {
  if (pct == null || pct === 0) return "±0%";
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

export default function ThuChiPage() {
  const [page, setPage] = useState(1);
  const LIMIT = 8;

  const { data: overview } = useApiData<FinancialOverview>("/financial/overview");
  const { data: periods } = useApiData<PeriodPoint[]>("/financial/periods?months=6");
  const { data: txnData } = useApiData<TxnResp>(
    `/financial/transactions?page=${page}&limit=${LIMIT}`,
    [page],
  );

  const periodLabel = overview ? PERIOD_LABELS(overview.period) : "";
  const prevPeriodLabel =
    periods && periods.length >= 2 ? PERIOD_LABELS(periods[periods.length - 2].period) : "";
  const cmpLabel = prevPeriodLabel ? `so với ${prevPeriodLabel}` : "so với tháng trước";

  const incomeItems = overview?.lineItems.income ?? [];
  const expenseItems = overview?.lineItems.expense ?? [];

  // ── 6-month chart geometry ──
  // Chart band: y=8 (top) .. y=264 (baseline). Bars sit on a 0..maxBar scale.
  const TOP_Y = 8;
  const BASE_Y = 264;
  const BAND = BASE_Y - TOP_Y; // 256
  const pts = periods ?? [];
  const maxBar = Math.max(1, ...pts.map((p) => Math.max(p.totalIncome, p.totalExpense)));
  const maxSurplus = Math.max(1, ...pts.map((p) => p.surplus));
  const minSurplus = Math.min(0, ...pts.map((p) => p.surplus));
  const groupX = (i: number) => 20 + i * 100; // income bar x; expense bar at +42
  const lineX = (i: number) => 39 + i * 100;

  const barRect = (val: number) => {
    const h = Math.max(0, (val / maxBar) * BAND);
    return { y: BASE_Y - h, height: h };
  };
  // Surplus line maps over [minSurplus, maxSurplus] into a sensible vertical band (8..200)
  const surplusRange = Math.max(1, maxSurplus - minSurplus);
  const lineY = (val: number) => {
    const t = (val - minSurplus) / surplusRange; // 0..1
    return 200 - t * 100; // higher surplus -> higher on chart (smaller y)
  };

  const linePoints = pts.map((p, i) => `${lineX(i)},${lineY(p.surplus).toFixed(0)}`).join(" ");

  // Y-axis labels derived from maxBar (top label ~ maxBar rounded up)
  const yTop = maxBar;
  const yLbl = (frac: number) => {
    const v = yTop * frac;
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
    return `${Math.round(v / 1_000_000)}M`;
  };

  const lastIdx = pts.length - 1;
  const last = pts[lastIdx];

  // ── Donut (expense structure) ──
  const expenseTotal = overview?.totalExpense ?? 0;
  const donutItems = expenseItems.map((it, i) => ({
    color: it.color ?? DONUT_COLORS[i % DONUT_COLORS.length],
    name: it.name,
    pct: `${it.pctOfTotal}%`,
    amt: toMillionLabel(it.amount),
  }));

  // ── Transactions ──
  const txns = txnData?.items ?? [];
  const meta = txnData?.meta;
  const rangeStart = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const rangeEnd = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <div className="tc-page">
      {/* ── Page Header ── */}
      <div className="tc-page-hd">
        <div>
          <h1 className="tc-title">Báo cáo thu chi</h1>
          <p className="tc-sub">Chi tiết các khoản thu, chi và biến động dòng tiền của tòa nhà</p>
        </div>
        <div className="tc-actions">
          <button className="tc-btn">
            <img src="https://www.figma.com/api/mcp/asset/bb824f87-1b0e-4c71-ba99-09a0e1da7f1e" alt="" width="16" height="16" />
            {periodLabel ? `Tháng ${periodLabel.slice(1)}` : "Tháng này"}
            <img src="https://www.figma.com/api/mcp/asset/f68a73a3-66a4-4714-b40e-bd14e282faef" alt="" width="14" height="14" />
          </button>
          <button className="tc-btn">
            <img src="https://www.figma.com/api/mcp/asset/690e85bc-cb14-4eb3-931b-790db95c8d26" alt="" width="16" height="16" />
            Bộ lọc
          </button>
          <button className="tc-btn-primary">
            <img src="https://www.figma.com/api/mcp/asset/690e85bc-cb14-4eb3-931b-790db95c8d26" alt="" width="16" height="16" style={{ filter: "brightness(0) invert(1)" }} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#e3fbed" }}>
            <img src="https://www.figma.com/api/mcp/asset/044401e8-31a2-4319-baba-dea119cc37a0" alt="" width="22" height="22" />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Tổng thu trong tháng</div>
            <div className="kpi-value">{overview ? formatVnd(overview.totalIncome) : "Đang tải..."}</div>
            <div className="kpi-trend">
              <img src="https://www.figma.com/api/mcp/asset/533d51cd-ada2-4e1e-9195-c963cd036668" alt="" width="11" height="11" />
              <span className={`kpi-pct ${overview && overview.incomeChangePct < 0 ? "down" : "up"}`}>{overview ? pctChip(overview.incomeChangePct) : ""}</span>
              <span className="kpi-tlabel">{cmpLabel}</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#ffeded" }}>
            <img src="https://www.figma.com/api/mcp/asset/426729a8-7cb5-4d21-88af-4a84e9722dd9" alt="" width="22" height="22" />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Tổng chi trong tháng</div>
            <div className="kpi-value">{overview ? formatVnd(overview.totalExpense) : "Đang tải..."}</div>
            <div className="kpi-trend">
              <img src="https://www.figma.com/api/mcp/asset/7e266243-494f-485c-afcc-77d8e7a3f69a" alt="" width="11" height="11" />
              <span className={`kpi-pct ${overview && overview.expenseChangePct <= 0 ? "up" : "down"}`}>{overview ? pctChip(overview.expenseChangePct) : ""}</span>
              <span className="kpi-tlabel">{cmpLabel}</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#efeeff" }}>
            <img src="https://www.figma.com/api/mcp/asset/74172d89-4a1b-4dbd-b7c1-6c2ea57ab41c" alt="" width="22" height="22" />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Thặng dư / thâm hụt</div>
            <div className="kpi-value">{overview ? formatVnd(overview.surplus) : "Đang tải..."}</div>
            <div className="kpi-trend">
              <img src="https://www.figma.com/api/mcp/asset/533d51cd-ada2-4e1e-9195-c963cd036668" alt="" width="11" height="11" />
              <span className={`kpi-pct ${overview && overview.surplusChangePct < 0 ? "down" : "up"}`}>{overview ? pctChip(overview.surplusChangePct) : ""}</span>
              <span className="kpi-tlabel">{cmpLabel}</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-bg" style={{ background: "#e4f1ff" }}>
            <img src="https://www.figma.com/api/mcp/asset/06413164-378f-45dc-a373-944256292fb7" alt="" width="22" height="22" />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Tỉ lệ chi / thu</div>
            <div className="kpi-value">{overview ? `${overview.ratios.expenseRatio}%` : "Đang tải..."}</div>
            <div className="kpi-trend">
              <img src="https://www.figma.com/api/mcp/asset/7e266243-494f-485c-afcc-77d8e7a3f69a" alt="" width="11" height="11" />
              <span className={`kpi-pct ${overview && overview.ratios.expenseRatioChangePct <= 0 ? "up" : "down"}`}>{overview ? pctChip(overview.ratios.expenseRatioChangePct) : ""}</span>
              <span className="kpi-tlabel">{cmpLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Summary Banner ── */}
      <div className="ai-sum-banner">
        <div className="ai-sum-icon-wrap">
          <img src="https://www.figma.com/api/mcp/asset/25958985-3347-42bb-be2a-fd5ff8597dd2" alt="" width="24" height="24" />
        </div>
        <div className="ai-sum-body">
          <div className="ai-sum-label">AI Phân tích nhanh</div>
          <div className="ai-sum-text">
            Tháng 5/2024, tòa nhà ghi nhận thặng dư <span className="hl-green">dương 706.7 triệu đồng</span>, cải thiện <span className="hl-green">28.6%</span> so với tháng trước. Tỉ lệ thu phí quản lý đạt <span className="hl-green">98.6%</span>, rất tốt. Khoản chi tăng chủ yếu từ <span className="hl-red">Bảo trì & sửa chữa</span> (+14.2%) do thay thế thiết bị PCCC định kỳ.
          </div>
        </div>
        <button className="ai-sum-btn">
          Xem chi tiết
          <img src="https://www.figma.com/api/mcp/asset/1fe2686f-14e9-4794-99b2-6091479ae9d6" alt="" width="14" height="14" />
        </button>
      </div>

      {/* ── Chart Row ── */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="chart-hd">
            <div className="chart-title">
              Biến động thu chi
              <span className="chart-info">i</span>
            </div>
            <div className="chart-period">
              6 tháng gần nhất
              <img src="https://www.figma.com/api/mcp/asset/f68a73a3-66a4-4714-b40e-bd14e282faef" alt="" width="13" height="13" />
            </div>
          </div>

          <div className="chart-svg-area" style={{ height: "300px", position: "relative" }}>
            <span className="chart-y-lbl" style={{ top: "8px" }}>{yLbl(1)}</span>
            <span className="chart-y-lbl" style={{ top: "72px" }}>{yLbl(0.75)}</span>
            <span className="chart-y-lbl" style={{ top: "136px" }}>{yLbl(0.5)}</span>
            <span className="chart-y-lbl" style={{ top: "200px" }}>{yLbl(0.25)}</span>
            <span className="chart-y-lbl" style={{ top: "264px" }}>0</span>

            <svg
              viewBox="0 0 640 280"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: "absolute", left: "44px", right: 0, top: 0, bottom: "20px", width: "calc(100% - 44px)", height: "280px" }}
            >
              <line x1="0" y1="8" x2="640" y2="8" stroke="#f0f0f5" strokeWidth="1" />
              <line x1="0" y1="72" x2="640" y2="72" stroke="#f0f0f5" strokeWidth="1" />
              <line x1="0" y1="136" x2="640" y2="136" stroke="#f0f0f5" strokeWidth="1" />
              <line x1="0" y1="200" x2="640" y2="200" stroke="#f0f0f5" strokeWidth="1" />
              <line x1="0" y1="264" x2="640" y2="264" stroke="#e8e8f0" strokeWidth="1" />

              {pts.map((p, i) => {
                const inc = barRect(p.totalIncome);
                const exp = barRect(p.totalExpense);
                const isLast = i === lastIdx;
                return (
                  <g key={p.period}>
                    <rect x={groupX(i)} y={inc.y} width="38" height={inc.height} rx="5" fill="#8b80f9" opacity={isLast ? undefined : 0.85} />
                    <rect x={groupX(i) + 42} y={exp.y} width="38" height={exp.height} rx="5" fill="#ef6b7c" opacity={isLast ? undefined : 0.85} />
                  </g>
                );
              })}

              {pts.length > 0 && (
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#22c08a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {pts.map((p, i) => (
                <circle
                  key={`c-${p.period}`}
                  cx={lineX(i)}
                  cy={lineY(p.surplus).toFixed(0)}
                  r={i === lastIdx ? 6 : 4}
                  fill="#22c08a"
                  stroke="#fff"
                  strokeWidth={i === lastIdx ? 2.5 : 2}
                />
              ))}

              {pts.map((p, i) => (
                <text
                  key={`t-${p.period}`}
                  x={lineX(i)}
                  y="278"
                  textAnchor="middle"
                  fontSize="12"
                  fill={i === lastIdx ? "#4137f9" : "#585c7b"}
                  fontWeight={i === lastIdx ? 600 : undefined}
                  fontFamily="Inter,sans-serif"
                >
                  {PERIOD_LABELS(p.period)}
                </text>
              ))}
            </svg>

            {last && (
              <div className="chart-tooltip" style={{ top: "30px", left: "60%" }}>
                <div className="tt-title">{PERIOD_LABELS(last.period)}</div>
                <div className="tt-row">
                  <div className="tt-dot" style={{ background: "#8b80f9" }}></div>
                  <span className="tt-name">Tổng thu</span>
                  <span className="tt-val">{formatVnd(last.totalIncome)}</span>
                </div>
                <div className="tt-row">
                  <div className="tt-dot" style={{ background: "#ef6b7c" }}></div>
                  <span className="tt-name">Tổng chi</span>
                  <span className="tt-val">{formatVnd(last.totalExpense)}</span>
                </div>
                <div className="tt-row">
                  <div className="tt-dot" style={{ background: "#22c08a" }}></div>
                  <span className="tt-name">Thặng dư</span>
                  <span className="tt-val">{formatVnd(last.surplus)}</span>
                </div>
              </div>
            )}
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
              <div className="legend-line" style={{ background: "#22c08a" }}></div>
              <span className="legend-lbl">Thặng dư</span>
            </div>
          </div>
        </div>

        {/* Donut */}
        <div className="donut-card">
          <div className="donut-title">Cơ cấu chi phí</div>
          <div className="donut-wrap">
            <img src="https://www.figma.com/api/mcp/asset/b5288dca-c5ba-442d-9c20-ddaf75ae7faf" alt="Cơ cấu chi phí" />
            <div className="donut-center">
              <div className="donut-cval">{toMillionLabel(expenseTotal)}</div>
              <div className="donut-clbl">Tổng chi</div>
            </div>
          </div>
          <div className="donut-legend">
            {donutItems.map((r) => (
              <div className="donut-row" key={r.name}>
                <div className="donut-left">
                  <div className="donut-dot" style={{ background: r.color }}></div>
                  <span className="donut-name">{r.name}</span>
                </div>
                <span className="donut-pct">{r.pct}</span>
                <span className="donut-amt">{r.amt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Breakdown Tables ── */}
      <div className="breakdown-row">
        <div className="breakdown-card">
          <div className="breakdown-hd">
            <div className="breakdown-title">Chi tiết khoản thu</div>
            <div className="breakdown-total"><span>Tổng:</span>{overview ? formatVnd(overview.totalIncome) : "—"}</div>
          </div>
          <div className="bd-table">
            {incomeItems.map((r) => {
              const t = trendDir(r.comparisonPct, r.comparisonDirection);
              const cls = t.color === "#1c9d5f" ? "up" : t.color === "#ef4444" ? "down" : "neu";
              return (
                <div className="bd-row" key={r.id}>
                  <div className="bd-name-col">
                    <div className="bd-name">{r.name}</div>
                    <div className="bd-sub">{r.subInfo}</div>
                  </div>
                  <div className="bd-bar-col">
                    <div className="bd-bar-track">
                      <div className="bd-bar-fill" style={{ width: `${r.pctOfTotal}%`, background: r.color ?? "#8b80f9" }}></div>
                    </div>
                  </div>
                  <div className="bd-amount-col">
                    <div className="bd-amount">{formatVnd(r.amount)}</div>
                    <div className={`bd-cmp ${cls}`}>{pctChip(r.comparisonPct)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="breakdown-card">
          <div className="breakdown-hd">
            <div className="breakdown-title">Chi tiết khoản chi</div>
            <div className="breakdown-total"><span>Tổng:</span>{overview ? formatVnd(overview.totalExpense) : "—"}</div>
          </div>
          <div className="bd-table">
            {expenseItems.map((r, i) => {
              const t = trendDir(r.comparisonPct, r.comparisonDirection);
              const cls = t.color === "#1c9d5f" ? "up" : t.color === "#ef4444" ? "down" : "neu";
              const color = r.color ?? DONUT_COLORS[i % DONUT_COLORS.length];
              // Bar widths in original were scaled so the largest item filled the track.
              const maxPct = Math.max(1, ...expenseItems.map((e) => e.pctOfTotal));
              const width = `${Math.round((r.pctOfTotal / maxPct) * 100)}%`;
              return (
                <div className="bd-row" key={r.id}>
                  <div className="bd-name-col">
                    <div className="bd-name">{r.name}</div>
                    <div className="bd-sub">{r.subInfo}</div>
                  </div>
                  <div className="bd-bar-col">
                    <div className="bd-bar-track">
                      <div className="bd-bar-fill" style={{ width, background: color }}></div>
                    </div>
                  </div>
                  <div className="bd-amount-col">
                    <div className="bd-amount">{formatVnd(r.amount)}</div>
                    <div className={`bd-cmp ${cls}`}>{pctChip(r.comparisonPct)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Giao dịch gần đây ── */}
      <div className="txn-card">
        <div className="txn-hd">
          <div className="txn-title">Giao dịch gần đây</div>
          <span className="txn-link">
            Xem tất cả
            <img src="https://www.figma.com/api/mcp/asset/1fe2686f-14e9-4794-99b2-6091479ae9d6" alt="" width="13" height="13" />
          </span>
        </div>

        <div className="txn-table-hd">
          <span>MÃ GIAO DỊCH</span>
          <span>MÔ TẢ</span>
          <span style={{ textAlign: "center" }}>DANH MỤC</span>
          <span style={{ textAlign: "center" }}>NGÀY</span>
          <span style={{ textAlign: "center" }}>HÌNH THỨC</span>
          <span style={{ textAlign: "right" }}>SỐ TIỀN</span>
        </div>

        {txns.length === 0 && (
          <div className="txn-row"><div className="txn-desc-col"><div className="txn-desc-body"><div className="txn-desc-main">Đang tải...</div></div></div></div>
        )}

        {txns.map((t) => {
          const isIncome = t.type === "income";
          return (
            <div className="txn-row" key={t.id}>
              <div className="txn-id-col">
                <span className="txn-id">{t.code}</span>
              </div>
              <div className="txn-desc-col">
                <div className="txn-type-icon" style={{ background: isIncome ? "#e3fbed" : "#ffeded" }}>
                  <img
                    src={isIncome
                      ? "https://www.figma.com/api/mcp/asset/47f9e73d-0043-419f-8ee5-ba6a7ecba22e"
                      : "https://www.figma.com/api/mcp/asset/608266b7-1e25-4466-a5f3-68a8ebf94ae6"}
                    alt=""
                    width="18"
                    height="18"
                  />
                </div>
                <div className="txn-desc-body">
                  <div className="txn-desc-main">{t.description}</div>
                  <div className="txn-desc-sub">{t.subInfo}</div>
                </div>
              </div>
              <div className="txn-cat-col">
                <span
                  className="txn-cat-badge"
                  style={isIncome ? { background: "#e3fbed", color: "#1c9d5f" } : { background: "#fff1de", color: "#c8761b" }}
                >
                  {t.category}
                </span>
              </div>
              <div className="txn-date-col">{formatDate(t.occurredAt)}</div>
              <div className="txn-method-col">{t.paymentMethod}</div>
              <div className="txn-amt-col">
                <span className={`txn-amount ${t.type}`}>
                  {isIncome ? "+ " : "- "}{formatVnd(t.amount)}
                </span>
              </div>
            </div>
          );
        })}

        <div className="txn-pagination">
          <span className="txn-pag-label">
            {meta && meta.total > 0
              ? `Hiển thị ${rangeStart} - ${rangeEnd} của ${meta.total} giao dịch${periodLabel ? ` trong tháng ${periodLabel.slice(1)}` : ""}`
              : "Không có giao dịch"}
          </span>
          <div className="txn-pag-btns">
            <button className="pag-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>‹</button>
            {Array.from({ length: meta?.totalPages ?? 0 }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pag-btn ${p === page ? "active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button className="pag-btn" onClick={() => setPage((p) => Math.min(meta?.totalPages ?? p, p + 1))} disabled={!!meta && page >= meta.totalPages}>›</button>
          </div>
        </div>
      </div>

      {/* ── Bottom AI Banner ── */}
      <div className="ai-bot-banner">
        <img className="ai-bot-bg" src="https://www.figma.com/api/mcp/asset/e1803480-f04b-45ee-b55c-9cd83b6024a7" alt="" />
        <div className="ai-bot-content">
          <div className="ai-bot-tag">AI Assistant</div>
          <div className="ai-bot-title">Trợ lý AI tài chính<br />thông minh</div>
          <button className="ai-bot-cta">
            Hỏi ngay
            <img src="https://www.figma.com/api/mcp/asset/2d5f6eb3-da7c-4c55-b3e3-3e94dcef4928" alt="" width="16" height="16" />
          </button>
        </div>
      </div>
    </div>
  );
}
