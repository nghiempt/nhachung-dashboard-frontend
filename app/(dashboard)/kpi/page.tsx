"use client";

import { useApiData } from "@/lib/hooks";
import { KPI_GRADE, KPI_RESULT } from "@/lib/ui-maps";
import { exportCsv } from "@/lib/export-csv";

type KpiMetric = {
  name: string;
  unit: string;
  targetValue: string;
  actualValue: string;
  statusColor: string;
  achievementPct: number;
  pointsEarned: number;
  pointsMax: number;
  resultBadge: string;
};

type KpiCategory = {
  name: string;
  color: string;
  score: number;
  maxScore: number;
  metricsPassed: number;
  metricsTotal: number;
  grade: string;
  metrics: KpiMetric[];
};

type Kpi = {
  period: string;
  periodLabel: string;
  totalScore: number;
  maxScore: number;
  grade: string;
  targetScore: number;
  scoreChange: number;
  comparisonPeriod: string;
  counts: { achieved: number; needsImprovement: number; notAchieved: number; total: number };
  categories: KpiCategory[];
};

type KpiTrendPoint = { period: string; periodLabel: string; totalScore: number; targetScore: number };

type KpiMember = {
  id: string;
  name: string;
  initials: string;
  role: string;
  score: number;
  grade: string;
  termStart: number;
  termEnd: number;
  avatarColor: string;
};

// hex color -> light background (~12% tint) for avatars / icon bg
function tint(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.88);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function statusColorHex(c: string): string {
  if (c === "green") return "#1c9d5f";
  if (c === "orange") return "#c8761b";
  if (c === "red") return "#f5222d";
  return "#272727";
}

export default function KpiPage() {
  const { data: kpi } = useApiData<Kpi>("/kpi");
  const { data: trend } = useApiData<KpiTrendPoint[]>("/kpi/trend");
  const { data: members } = useApiData<KpiMember[]>("/kpi/members");

  const totalScore = kpi?.totalScore ?? 0;
  const maxScore = kpi?.maxScore ?? 100;
  const targetScore = kpi?.targetScore ?? 0;
  const grade = KPI_GRADE[kpi?.grade ?? ""] ?? { label: "", color: "#272727", bg: "#f0f0f3" };
  const counts = kpi?.counts ?? { achieved: 0, needsImprovement: 0, notAchieved: 0, total: 0 };
  const categories = kpi?.categories ?? [];

  // Overall ring: circumference = 2πr (r=46) ≈ 289.0265
  const circ = 2 * Math.PI * 46;
  const ringPct = Math.max(0, Math.min(1, totalScore / maxScore));
  const ringDash = circ * ringPct;
  const ringOffset = circ - ringDash;

  const scoreChange = kpi?.scoreChange ?? 0;
  const comparisonPeriod = kpi?.comparisonPeriod ?? "";

  // ── Trend chart geometry ──
  const trendPts = trend ?? [];
  const chartX0 = 70;
  const chartX1 = 320;
  const stepX = trendPts.length > 1 ? (chartX1 - chartX0) / (trendPts.length - 1) : 0;
  // y: 100 -> y=10, 40 -> y=160  =>  y = 10 + (100 - score) * (150/60)
  const scoreToY = (s: number) => 10 + (100 - s) * (150 / 60);
  const points = trendPts.map((p, i) => ({
    x: chartX0 + i * stepX,
    y: scoreToY(p.totalScore),
    ...p,
  }));
  const linePoints = points.map((p) => `${p.x},${p.y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const areaPoints = points.length
    ? `${linePoints} ${last.x},160 ${points[0].x},160`
    : "";
  const targetVal = trendPts.length ? trendPts[trendPts.length - 1].targetScore : targetScore;
  const targetY = scoreToY(targetVal);

  // bottom summary cells (last two periods + growth)
  const prevPt = trendPts.length >= 2 ? trendPts[trendPts.length - 2] : undefined;
  const lastPt = trendPts.length ? trendPts[trendPts.length - 1] : undefined;
  const growth = lastPt && prevPt ? +(lastPt.totalScore - prevPt.totalScore).toFixed(1) : 0;

  const handleExport = () => {
    const rows: (string | number)[][] = [];
    for (const cat of categories) {
      for (const m of cat.metrics) {
        rows.push([
          cat.name,
          m.name,
          `${m.targetValue}${m.unit}`,
          `${m.actualValue}${m.unit}`,
          `${m.achievementPct}%`,
          `${m.pointsEarned}/${m.pointsMax}`,
          KPI_RESULT[m.resultBadge]?.label ?? m.resultBadge,
        ]);
      }
    }
    exportCsv(
      `kpi-ban-quan-tri${kpi?.period ? `-${kpi.period}` : ""}`,
      ["Nhóm", "Chỉ tiêu", "Mục tiêu", "Thực tế", "Đạt được", "Điểm", "Kết quả"],
      rows,
    );
  };

  return (
    <div className="kpi-page">
      {/* ── Page Header ── */}
      <div className="page-hd">
        <div>
          <h1 className="page-title">KPI Ban quản trị</h1>
          <p className="page-sub">Đánh giá hiệu quả hoạt động Ban quản trị theo chỉ tiêu đề ra</p>
        </div>
        <div className="page-actions">
          <span className="btn-outline" style={{ cursor: "default" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {kpi?.periodLabel ?? "Đang tải..."}
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

      {/* ── Overall Score + Stats ── */}
      <div className="score-row">
        <div className="score-main">
          <div className="score-ring-wrap">
            <svg viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="10" />
              <circle
                cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="10"
                strokeDasharray={`${ringDash.toFixed(1)} ${circ.toFixed(1)}`} strokeDashoffset={ringOffset.toFixed(1)} strokeLinecap="round"
                transform="rotate(-90 55 55)"
              />
            </svg>
            <div className="score-ring-label">
              <div className="score-big">{totalScore}</div>
              <div className="score-max">/{maxScore}</div>
            </div>
          </div>
          <div className="score-info">
            <div className="score-title">Tổng điểm KPI — {kpi?.periodLabel ?? ""}</div>
            <div className="score-grade">{grade.label}</div>
            <div className="score-grade-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {totalScore >= targetScore ? "Vượt" : "Dưới"} chỉ tiêu {targetScore} điểm
            </div>
            <div className="score-compare">So với {comparisonPeriod}: <strong>{scoreChange >= 0 ? "+" : ""}{scoreChange} điểm {scoreChange >= 0 ? "↑" : "↓"}</strong></div>
          </div>
        </div>

        <div className="stat-mini">
          <div className="stat-mini-top">
            <div className="stat-mini-icon" style={{ background: "#e3fbed" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="stat-mini-trend trend-up">{comparisonPeriod}</div>
          </div>
          <div className="stat-mini-val green">{counts.achieved}</div>
          <div className="stat-mini-label">Chỉ tiêu đạt / vượt</div>
        </div>

        <div className="stat-mini">
          <div className="stat-mini-top">
            <div className="stat-mini-icon" style={{ background: "#fff1de" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-mini-trend trend-same">Theo dõi</div>
          </div>
          <div className="stat-mini-val orange">{counts.needsImprovement}</div>
          <div className="stat-mini-label">Chỉ tiêu cần cải thiện</div>
        </div>

        <div className="stat-mini">
          <div className="stat-mini-top">
            <div className="stat-mini-icon" style={{ background: "#ffeded" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#f5222d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="stat-mini-trend trend-down">Cần xử lý</div>
          </div>
          <div className="stat-mini-val red">{counts.notAchieved}</div>
          <div className="stat-mini-label">Chỉ tiêu chưa đạt</div>
        </div>

        <div className="stat-mini">
          <div className="stat-mini-top">
            <div className="stat-mini-icon" style={{ background: "#efeeff" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
            <div className="stat-mini-trend trend-same">{kpi?.periodLabel ?? ""}</div>
          </div>
          <div className="stat-mini-val">{counts.total}</div>
          <div className="stat-mini-label">Tổng chỉ tiêu đánh giá</div>
        </div>
      </div>

      {/* ── Category KPI cards ── */}
      <div className="cat-grid">
        {categories.map((c, idx) => {
          const g = KPI_GRADE[c.grade] ?? { label: "", color: c.color };
          const widthPct = c.maxScore ? (c.score / c.maxScore) * 100 : 0;
          return (
            <div className={`cat-kpi-card${idx === 0 ? " active" : ""}`} key={c.name}>
              <div className="cat-icon-bg" style={{ background: tint(c.color) }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <div className="cat-kpi-name">{c.name}</div>
                <div className="cat-kpi-score-row">
                  <div className="cat-kpi-score" style={{ color: c.color }}>{c.score}</div>
                  <div className="cat-kpi-total">/{c.maxScore}</div>
                </div>
              </div>
              <div>
                <div className="cat-track"><div className="cat-fill" style={{ width: `${widthPct}%`, background: c.color }}></div></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                  <span style={{ fontSize: 11, color: "#585c7b" }}>{c.metricsPassed}/{c.metricsTotal} chỉ tiêu đạt</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: g.color }}>{g.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Mid row: Trend + Detail ── */}
      <div className="mid-row">
        <div className="trend-card">
          <div className="card-hd">
            <div className="card-title">Xu hướng điểm KPI</div>
            <span className="card-sub">6 quý gần nhất</span>
          </div>
          <div className="chart-svg-wrap">
            <span className="chart-y-lbl" style={{ top: "6px" }}>100</span>
            <span className="chart-y-lbl" style={{ top: "56px" }}>80</span>
            <span className="chart-y-lbl" style={{ top: "106px" }}>60</span>
            <span className="chart-y-lbl" style={{ top: "156px" }}>40</span>
            <svg viewBox="0 0 330 180" style={{ width: "100%", overflow: "visible", paddingLeft: 34 }}>
              <line x1="34" y1="10" x2="330" y2="10" stroke="#f0f0f5" strokeWidth="1" />
              <line x1="34" y1="60" x2="330" y2="60" stroke="#f0f0f5" strokeWidth="1" />
              <line x1="34" y1="110" x2="330" y2="110" stroke="#f0f0f5" strokeWidth="1" />
              <line x1="34" y1="160" x2="330" y2="160" stroke="#f0f0f5" strokeWidth="1" />

              {points.map((p, i) => (
                <text
                  key={p.period}
                  x={p.x}
                  y="175"
                  textAnchor="middle"
                  fontSize="10.5"
                  fill={i === points.length - 1 ? "#4137f9" : "#585c7b"}
                  fontWeight={i === points.length - 1 ? "700" : undefined}
                >
                  {p.periodLabel.replace("Quý ", "Q").replace("/20", "/")}
                </text>
              ))}

              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4137f9" stopOpacity=".18" />
                  <stop offset="100%" stopColor="#4137f9" stopOpacity="0" />
                </linearGradient>
              </defs>
              {areaPoints && <polygon points={areaPoints} fill="url(#trendGrad)" />}
              {linePoints && (
                <polyline
                  points={linePoints}
                  fill="none" stroke="#4137f9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                />
              )}
              {points.map((p, i) =>
                i === points.length - 1 ? (
                  <circle key={p.period} cx={p.x} cy={p.y} r="6" fill="#fff" stroke="#4137f9" strokeWidth="2.5" />
                ) : (
                  <circle key={p.period} cx={p.x} cy={p.y} r="4" fill="#4137f9" />
                )
              )}

              {last && (
                <>
                  <rect x={last.x - 26} y={last.y - 21} width="52" height="18" rx="5" fill="#4137f9" />
                  <text x={last.x} y={last.y - 9} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">{last.totalScore} điểm</text>
                </>
              )}

              <line x1="34" y1={targetY.toFixed(1)} x2="330" y2={targetY.toFixed(1)} stroke="#1c9d5f" strokeWidth="1.5" strokeDasharray="5 4" />
              <text x="330" y={(targetY - 3).toFixed(1)} textAnchor="end" fontSize="10" fill="#1c9d5f" fontWeight="600">Mục tiêu {targetVal}</text>
            </svg>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-line" style={{ background: "#4137f9" }}></div>
              <span className="legend-lbl">Điểm KPI tổng</span>
            </div>
            <div className="legend-item">
              <div className="legend-line" style={{ background: "#1c9d5f", borderTop: "1.5px dashed #1c9d5f", height: 0 }}></div>
              <span className="legend-lbl">Chỉ tiêu</span>
            </div>
          </div>

          <div style={{ background: "#fafafa", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 16 }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#585c7b", marginBottom: 4 }}>{prevPt?.periodLabel ?? ""}</div>
              <div style={{ fontFamily: '"Manrope","Inter",sans-serif', fontSize: 20, fontWeight: 800, color: "#272727" }}>{prevPt?.totalScore ?? "—"}</div>
            </div>
            <div style={{ width: 1, background: "#e2e5f1" }}></div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#4137f9", fontWeight: 600, marginBottom: 4 }}>{lastPt?.periodLabel ?? ""} ●</div>
              <div style={{ fontFamily: '"Manrope","Inter",sans-serif', fontSize: 20, fontWeight: 800, color: "#4137f9" }}>{lastPt?.totalScore ?? "—"}</div>
            </div>
            <div style={{ width: 1, background: "#e2e5f1" }}></div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#585c7b", marginBottom: 4 }}>Tăng trưởng</div>
              <div style={{ fontFamily: '"Manrope","Inter",sans-serif', fontSize: 20, fontWeight: 800, color: growth >= 0 ? "#1c9d5f" : "#f5222d" }}>{growth >= 0 ? "+" : ""}{growth}</div>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="card-hd">
            <div className="card-title">Chi tiết chỉ tiêu KPI</div>
            <span className="card-link" onClick={handleExport} style={{ cursor: "pointer" }}>Xuất CSV →</span>
          </div>

          <div className="kpi-table">
            <div className="kpi-hd">
              <span>Chỉ tiêu</span>
              <span>Mục tiêu</span>
              <span>Thực tế</span>
              <span>% Đạt</span>
              <span>Điểm</span>
              <span>Kết quả</span>
            </div>

            {categories.map((c) => (
              <div key={c.name}>
                <div className="kpi-group-label">
                  <span className="kpi-group-dot" style={{ background: c.color }}></span>
                  {c.name}
                </div>
                {c.metrics.map((m) => {
                  const achWidth = Math.max(0, Math.min(100, m.achievementPct));
                  const achColor = statusColorHex(m.statusColor);
                  const result = KPI_RESULT[m.resultBadge] ?? { label: m.resultBadge, color: "#585c7b", bg: "#f0f0f3" };
                  return (
                    <div className="kpi-row" key={m.name}>
                      <div className="kpi-name-col">
                        <div className="kpi-metric">{m.name}</div>
                        <div className="kpi-unit">{m.unit}</div>
                      </div>
                      <div className="kpi-num">{m.targetValue}</div>
                      <div className="kpi-num" style={{ color: statusColorHex(m.statusColor) }}>{m.actualValue}</div>
                      <div className="kpi-ach-wrap">
                        <span className="kpi-ach-pct" style={{ color: achColor }}>{m.achievementPct}%</span>
                        <div className="kpi-ach-bar">
                          <div className="kpi-ach-fill" style={{ width: `${achWidth}%`, background: c.color }}></div>
                        </div>
                      </div>
                      <div className="pts-cell"><span className="pts-val" style={m.statusColor === "orange" ? { color: "#c8761b" } : undefined}>{m.pointsEarned}/{m.pointsMax}</span></div>
                      <div className="badge-cell"><span className="badge" style={{ color: result.color, background: result.bg }}>{result.label}</span></div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Members ── */}
      <div className="members-card">
        <div className="card-hd">
          <div className="card-title">Thành viên Ban quản trị</div>
          <span className="card-sub">
            {members && members.length ? `Nhiệm kỳ ${members[0].termStart}–${members[0].termEnd}` : "Nhiệm kỳ"}
          </span>
        </div>
        <div className="members-grid">
          {(members ?? []).map((m) => {
            const g = KPI_GRADE[m.grade] ?? { label: "", color: "#585c7b", bg: "#f0f0f3" };
            return (
              <div className="member-item" key={m.id}>
                <div className="member-avatar" style={{ background: tint(m.avatarColor), color: m.avatarColor }}>{m.initials}</div>
                <div>
                  <div className="member-name">{m.name}</div>
                  <div className="member-role">{m.role}</div>
                </div>
                <div className="member-score-row">
                  <span className="member-score">{m.score}</span>
                  <span className="member-badge badge" style={{ fontSize: 10, color: g.color, background: g.bg }}>{g.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
