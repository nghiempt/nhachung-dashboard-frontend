"use client";

import { useMemo, useState } from "react";
import { useApiData } from "@/lib/hooks";
import { apiPost } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/format";
import { ARCHIVE_CATEGORY, docColor, docTypeLabel } from "@/lib/ui-maps";

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

const CalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#585c7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ── API shapes ──────────────────────────────────────────────
interface ArchiveStats {
  totalDocuments: number;
  totalStorageBytes: number;
  storageLabel: string;
  yearsArchived: number;
  range: { from: number; to: number };
  totalDownloads: number;
}

interface ArchiveDoc {
  id: string;
  name: string;
  fileType: string;
  archiveCategory: string | null;
  uploadDate: string;
  sizeBytes: number;
  sizeLabel: string;
  downloadCount: number;
  url?: string;
}

interface MonthGroup {
  key: string;
  label: string;
  count: number;
  documents: ArchiveDoc[];
}

interface YearGroup {
  year: number;
  count: number;
  monthCount: number;
  months: MonthGroup[];
}

interface ArchiveResponse {
  years: YearGroup[];
}

interface CategoryCount {
  category: string;
  count: number;
}

interface TopDownload {
  id: string;
  name: string;
  downloadCount: number;
}

interface FileTypeBreakdown {
  fileType: string;
  count: number;
  pct: number;
}

// Badge class for the file-type chip in document rows.
function fileBadgeClass(ext: string): string {
  const e = ext.toLowerCase();
  if (e === "pdf") return "badge-pdf";
  if (e === "doc" || e === "docx") return "badge-doc";
  if (e === "xls" || e === "xlsx") return "badge-xls";
  return "badge-doc";
}

// Coloured rank/file-type chip backgrounds derived from the doc colour.
function tintBg(color: string): string {
  return `${color}1a`; // ~10% alpha
}

function DocRow({ d, onDownload }: { d: ArchiveDoc; onDownload: (d: ArchiveDoc) => void }) {
  const ext = docTypeLabel(d.fileType);
  const cat = d.archiveCategory ? ARCHIVE_CATEGORY[d.archiveCategory] : null;
  const catInfo = cat ?? ARCHIVE_CATEGORY.other;
  return (
    <div className="doc-row">
      <div className="doc-name-col">
        <span
          className={`doc-file-badge ${fileBadgeClass(ext)}`}
          style={{ background: tintBg(docColor(d.fileType)), color: docColor(d.fileType) }}
        >
          {ext}
        </span>
        <span className="doc-name">{d.name}</span>
      </div>
      <div className="doc-cat">
        <span className="badge" style={{ background: tintBg(catInfo.color), color: catInfo.color }}>
          {catInfo.label}
        </span>
      </div>
      <div className="doc-date">{formatDate(d.uploadDate)}</div>
      <div className="doc-size">{d.sizeLabel}</div>
      <div className="doc-dl">{formatNumber(d.downloadCount)}</div>
      <div className="doc-act">
        <button className="doc-btn"><EyeIcon /></button>
        <button className="doc-btn" onClick={() => onDownload(d)}><DownloadIcon /></button>
      </div>
    </div>
  );
}

function MonthBlock({ m, onDownload }: { m: MonthGroup; onDownload: (d: ArchiveDoc) => void }) {
  return (
    <div className="month-group">
      <div className="month-hd">
        <CalIcon />
        <span className="month-name">{m.label}</span>
        <span className="month-count">{formatNumber(m.count)} tài liệu</span>
        <svg className="month-toggle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </div>
      <div className="doc-table">
        <div className="doc-hd">
          <span>Tên tài liệu</span>
          <span>Danh mục</span>
          <span>Ngày tải</span>
          <span>Dung lượng</span>
          <span>Lượt tải</span>
          <span></span>
        </div>
        {m.documents.map((d) => <DocRow key={d.id} d={d} onDownload={onDownload} />)}
      </div>
    </div>
  );
}

export default function LichSuPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [fileType, setFileType] = useState("");
  const [year, setYear] = useState<number | null>(null);

  const stats = useApiData<ArchiveStats>("/archive/stats").data;

  const archiveQuery = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (category) p.set("category", category);
    if (fileType) p.set("fileType", fileType);
    if (year != null) p.set("year", String(year));
    const qs = p.toString();
    return qs ? `/archive?${qs}` : "/archive";
  }, [search, category, fileType, year]);

  const { data: archive } = useApiData<ArchiveResponse>(archiveQuery, [archiveQuery]);
  const { data: byCategory } = useApiData<CategoryCount[]>("/archive/by-category");
  const { data: topDownloads } = useApiData<TopDownload[]>("/archive/top-downloads");
  const { data: fileTypes } = useApiData<FileTypeBreakdown[]>("/archive/file-types");

  const years = archive?.years ?? [];

  // Year tabs: prefer the stat range, fall back to whatever the archive returns.
  const yearTabs = useMemo(() => {
    if (stats?.range) {
      const out: number[] = [];
      for (let y = stats.range.to; y >= stats.range.from; y--) out.push(y);
      return out;
    }
    return years.map((y) => y.year);
  }, [stats, years]);

  const handleDownload = async (d: ArchiveDoc) => {
    try {
      await apiPost(`/archive/${d.id}/download`, {});
    } catch {
      // best-effort increment; still attempt to open the file
    }
    if (d.url) window.open(d.url, "_blank");
  };

  const TOP_RANK_COLORS = ["#4137f9", "#5a3ad9", "#1c9d5f", "#c8761b", "#1870c4"];
  const FILETYPE_TINT: Record<string, { bg: string; color: string; label: string }> = {
    pdf: { bg: "#fff1f0", color: "#f5222d", label: "PDF" },
    xlsx: { bg: "#e8f8ee", color: "#1c9d5f", label: "Excel" },
    xls: { bg: "#e8f8ee", color: "#1c9d5f", label: "Excel" },
    docx: { bg: "#e8f0fe", color: "#1870c4", label: "Word" },
    doc: { bg: "#e8f0fe", color: "#1870c4", label: "Word" },
  };

  const maxCatCount = Math.max(1, ...(byCategory ?? []).map((c) => c.count));

  return (
    <div className="lichsu-page">
      {/* ── Page Header ── */}
      <div className="page-hd">
        <div>
          <h1 className="page-title">Lịch sử &amp; Lưu trữ</h1>
          <p className="page-sub">Kho lưu trữ toàn bộ tài liệu hoạt động của Ban quản trị</p>
        </div>
        <div className="page-actions">
          <button className="btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Xuất danh sách
          </button>
          <button className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tải lên tài liệu
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#efeeff" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-val">{stats ? formatNumber(stats.totalDocuments) : "…"}</div>
            <div className="stat-lbl">Tổng tài liệu lưu trữ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e4f1ff" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1870c4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-val">{stats ? stats.storageLabel : "…"}</div>
            <div className="stat-lbl">Dung lượng lưu trữ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e3fbed" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-val">{stats ? formatNumber(stats.yearsArchived) : "…"}</div>
            <div className="stat-lbl">
              {stats ? `Năm lưu trữ (${stats.range.from}–${stats.range.to})` : "Năm lưu trữ"}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fff1de" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-val">{stats ? formatNumber(stats.totalDownloads) : "…"}</div>
            <div className="stat-lbl">Tổng lượt tải xuống</div>
          </div>
        </div>
      </div>

      {/* ── Search + filter ── */}
      <div className="search-row">
        <div className="search-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b4b7c9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Tìm theo tên tài liệu, nội dung, người tải lên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label className="filter-select">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Danh mục:
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ border: "none", background: "transparent", font: "inherit", color: "inherit", cursor: "pointer", outline: "none" }}
          >
            <option value="">Tất cả</option>
            {Object.entries(ARCHIVE_CATEGORY).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </label>
        <label className="filter-select">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          </svg>
          Loại:
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            style={{ border: "none", background: "transparent", font: "inherit", color: "inherit", cursor: "pointer", outline: "none" }}
          >
            <option value="">Tất cả</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="xlsx">Excel</option>
          </select>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </label>
        <div className="year-tabs">
          {yearTabs.map((y) => (
            <button
              key={y}
              className={`year-tab${year === y ? " active" : ""}`}
              onClick={() => setYear((prev) => (prev === y ? null : y))}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* ── Archive layout ── */}
      <div className="archive-layout">
        {/* Main */}
        <div className="archive-main">
          {years.length === 0 && (
            <div style={{ padding: "24px 4px", fontSize: 13, color: "#585c7b" }}>Đang tải...</div>
          )}
          {years.map((y, idx) => (
            <div className="year-section" key={y.year}>
              <div className="year-header">
                <span
                  className="year-tag"
                  style={idx === 0 ? undefined : { background: "#f7f7f7", color: "#585c7b", borderColor: "#e2e5f1" }}
                >
                  {y.year}
                </span>
                <span className="year-count">
                  {formatNumber(y.count)} tài liệu · {formatNumber(y.monthCount)} tháng
                </span>
                <div className="year-line"></div>
              </div>
              {y.months.map((m) => (
                <MonthBlock key={m.key} m={m} onDownload={handleDownload} />
              ))}
            </div>
          ))}
        </div>

        {/* Right sidebar */}
        <div className="archive-sidebar">
          {/* Theo danh mục */}
          <div className="sw-card">
            <div className="sw-title">Tài liệu theo danh mục</div>
            <div className="sw-list">
              {(byCategory ?? []).map((c) => {
                const info = ARCHIVE_CATEGORY[c.category] ?? ARCHIVE_CATEGORY.other;
                const width = `${Math.round((c.count / maxCatCount) * 100)}%`;
                return (
                  <div key={c.category}>
                    <div className="sw-row">
                      <span className="sw-dot" style={{ background: info.color }}></span>
                      <span className="sw-label">{info.label}</span>
                      <span className="sw-count">{formatNumber(c.count)}</span>
                    </div>
                    <div className="sw-bar-track">
                      <div className="sw-bar-fill" style={{ width, background: info.color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top downloads */}
          <div className="sw-card">
            <div className="sw-title">Tải xuống nhiều nhất</div>
            <div className="sw-list">
              {(topDownloads ?? []).map((t, i) => {
                const color = TOP_RANK_COLORS[i] ?? "#585c7b";
                return (
                  <div className="sw-row" key={t.id} style={{ alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontFamily: '"Manrope","Inter",sans-serif', fontSize: 13, fontWeight: 800, color, flexShrink: 0, width: 18 }}>#{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#272727", lineHeight: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "#585c7b", marginTop: 2 }}>{formatNumber(t.downloadCount)} lượt tải</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Loại file */}
          <div className="sw-card">
            <div className="sw-title">Phân loại file</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(fileTypes ?? []).map((f) => {
                const tint = FILETYPE_TINT[f.fileType] ?? { bg: tintBg(docColor(f.fileType)), color: docColor(f.fileType), label: docTypeLabel(f.fileType) };
                return (
                  <div key={f.fileType} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 6px", borderRadius: 4, background: tint.bg, color: tint.color }}>{docTypeLabel(f.fileType)}</span>
                      <span style={{ fontSize: 13, color: "#585c7b" }}>{tint.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: '"Manrope","Inter",sans-serif', fontSize: 13, fontWeight: 700, color: "#272727" }}>{formatNumber(f.count)}</span>
                      <span style={{ fontSize: 12, color: "#585c7b" }}>{Math.round(f.pct)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
