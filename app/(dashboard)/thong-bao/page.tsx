"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useApiData, useAction } from "@/lib/hooks";
import { formatTime, formatDate, formatDateLong } from "@/lib/format";
import { notifIconColor, NOTIF_CATEGORY_LABEL } from "@/lib/ui-maps";

// ── Types matching the API shapes ───────────────────────────────
type TabKey = "all" | "urgent" | "unread" | "read";

interface ListItem {
  id: string;
  category: string;
  status: "unread" | "read";
  eyebrow: string;
  title: string;
  time: string;
  iconType: string;
  isUrgent: boolean;
  viewCount: number;
}
interface ListMeta { page: number; limit: number; total: number; totalPages: number }
interface ListResponse { items: ListItem[]; meta: ListMeta }

interface SummaryTab { key: TabKey; label: string; count: number }
interface SummaryCategory { category: string; count: number }
interface SummaryResponse { tabs: SummaryTab[]; categories: SummaryCategory[] }

interface Attachment { id: string; name: string; type: string; sizeLabel: string; url?: string }
interface Detail {
  id: string;
  category: string;
  eyebrow: string;
  title: string;
  isUrgent: boolean;
  status: string;
  author: { name: string; role: string; verified: boolean; time: string; viewCount: number };
  body: string[];
  timeCard?: { heading: string; rows: string[] };
  checklist?: string[];
  alertText?: string;
  signoff?: { lines: string[]; signedBy: string; title: string };
  attachments?: Attachment[];
}

// Per-color thumbnail assets (preserve the existing visual design)
const THUMB_IMG: Record<string, string> = {
  red: "https://www.figma.com/api/mcp/asset/9880ed18-5587-436d-8cd0-060f6b9bcd51",
  blue: "https://www.figma.com/api/mcp/asset/045ba488-25e3-4537-b659-d178f2895cd6",
  orange: "https://www.figma.com/api/mcp/asset/abd52cb0-2d6f-4e72-bd40-b6f409b70e84",
  violet: "https://www.figma.com/api/mcp/asset/b66c0343-b44f-4bbd-ad9c-1b849b4299fb",
  green: "https://www.figma.com/api/mcp/asset/adef0138-8229-4f3a-8366-2ffa23a3f374",
  mint: "https://www.figma.com/api/mcp/asset/adef0138-8229-4f3a-8366-2ffa23a3f374",
  amber: "https://www.figma.com/api/mcp/asset/abd52cb0-2d6f-4e72-bd40-b6f409b70e84",
};

const PAGE_LIMIT = 5;

export default function ThongBaoPage() {
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);

  // Debounce the search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const listQuery =
    `/notifications?tab=${tab}` +
    (search ? `&search=${encodeURIComponent(search)}` : "") +
    `&page=${page}&limit=${PAGE_LIMIT}`;

  const { data: list, refetch: refetchList } = useApiData<ListResponse>(listQuery, [tab, search, page]);
  const { data: summary, refetch: refetchSummary } = useApiData<SummaryResponse>("/notifications/summary");

  const items = list?.items ?? [];
  const meta = list?.meta;
  const tabs: SummaryTab[] = summary?.tabs ?? [];
  const categories: SummaryCategory[] = summary?.categories ?? [];

  // Load detail when an item is selected; marks it read server-side, then refresh
  async function selectItem(id: string) {
    setSelectedId(id);
    try {
      const d = await apiGet<Detail>(`/notifications/${id}`);
      setDetail(d);
    } catch {
      setDetail(null);
    }
    refetchList();
    refetchSummary();
  }

  const markAll = useAction(async () => {
    await apiPost("/notifications/read-all");
    refetchList();
    refetchSummary();
  });

  function tabCount(key: TabKey): number | undefined {
    return tabs.find((t) => t.key === key)?.count;
  }

  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;
  const startIdx = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const endIdx = Math.min(page * PAGE_LIMIT, total);

  return (
    <div className="thongbao-page">
      <div className="col-main">
        <div className="page-head">
          <div>
            <h1 className="page-title">Thông báo</h1>
            <div className="page-sub">Cập nhật những thông tin mới nhất từ Ban quản trị</div>
          </div>
          <button className="mark-all" onClick={() => markAll.run()} disabled={markAll.loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Đánh dấu đã đọc tất cả
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#585c7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

        <div className="tabs">
          <div className={`tab ${tab === "all" ? "active" : ""}`} onClick={() => { setTab("all"); setPage(1); }}>
            Tất cả {tabCount("all") != null && <span className="count">{tabCount("all")}</span>}
          </div>
          <div className={`tab urgent ${tab === "urgent" ? "active" : ""}`} onClick={() => { setTab("urgent"); setPage(1); }}>
            Thông báo khẩn {tabCount("urgent") != null && <span className="count">{tabCount("urgent")}</span>}
          </div>
          <div className={`tab ${tab === "unread" ? "active" : ""}`} onClick={() => { setTab("unread"); setPage(1); }}>
            Chưa đọc {tabCount("unread") != null && <span className="count">{tabCount("unread")}</span>}
          </div>
          <div className={`tab ${tab === "read" ? "active" : ""}`} onClick={() => { setTab("read"); setPage(1); }}>
            Đã đọc {tabCount("read") != null && <span className="count">{tabCount("read")}</span>}
          </div>
        </div>

        <div className="work">
          {/* List */}
          <div>
            <div className="search-row">
              <div className="search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b4b7c9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>
                <input
                  placeholder="Tìm kiếm thông báo..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <button className="filter-icon-btn" aria-label="Bộ lọc">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
              </button>
            </div>

            <div className="list">
              {items.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px", color: "#585c7b", fontSize: "14px" }}>
                  Không có thông báo nào.
                </div>
              )}
              {items.map((n) => {
                const color = notifIconColor(n.category);
                return (
                  <div
                    key={n.id}
                    className={`item ${selectedId === n.id ? "active" : ""}`}
                    onClick={() => selectItem(n.id)}
                  >
                    <div className={`thumb ${color}`}>
                      <img src={THUMB_IMG[color] ?? THUMB_IMG.blue} alt="" width={20} height={20} />
                    </div>
                    <div className="body">
                      <div className="eyebrow">{n.eyebrow}</div>
                      <div className="title">{n.title}</div>
                      <div className="meta">{formatTime(n.time)}</div>
                    </div>
                    {n.status === "unread" && (
                      <span className={`status-dot ${n.isUrgent ? "red" : "blue"}`}></span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pager">
              <div>Hiển thị {startIdx} - {endIdx} của {total} thông báo</div>
              <div className="pages">
                <button
                  className="page-btn"
                  aria-label="Trang trước"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? "active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="page-btn"
                  aria-label="Trang sau"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Detail */}
          {detail ? (
            <div className="detail">
              <div className="detail-top">
                <div className="back" onClick={() => { setSelectedId(null); setDetail(null); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  Quay lại danh sách
                </div>
                <div className="top-actions">
                  <button className="share-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Chia sẻ
                  </button>
                  <button className="more-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
                  </button>
                </div>
              </div>

              <div className="title-row">
                <div>
                  <span className="kicker">{detail.eyebrow}</span>
                  <h2 className="h1">{detail.title}</h2>
                </div>
                {detail.isUrgent && <span className="urgent-badge">Khẩn cấp</span>}
              </div>

              <div className="author">
                <div className="avatar-org">
                  <img src="https://www.figma.com/api/mcp/asset/a896629d-2faa-4bae-b318-ea03b31e6db9" alt="" width={22} height={25} style={{ display: "block" }} />
                </div>
                <div>
                  <div className="author-name">
                    {detail.author.name}
                    {detail.author.verified && (
                      <span className="verified">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    )}
                  </div>
                  <div className="author-meta">
                    {formatTime(detail.author.time)}
                    <span className="dot"></span>
                    {formatDate(detail.author.time)}
                    <span className="dot"></span>
                    <span className="views">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      {detail.author.viewCount.toLocaleString()} lượt xem
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose">
                {detail.body.map((p, i) => <p key={i}>{p}</p>)}
              </div>

              {detail.timeCard && (
                <div className="time-card">
                  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <div>
                    <div className="label">{detail.timeCard.heading}</div>
                    {detail.timeCard.rows.map((r, i) => (
                      <div key={i} className="row">{r}</div>
                    ))}
                  </div>
                </div>
              )}

              {detail.checklist && detail.checklist.length > 0 && (
                <>
                  <div className="section-h"><span className="info-icon">i</span> Nội dung công việc</div>
                  <ul className="check-list">
                    {detail.checklist.map((c, i) => (
                      <li key={i}><span className="check"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> {c}</li>
                    ))}
                  </ul>
                </>
              )}

              {detail.alertText && (
                <div className="alert">
                  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <div>{detail.alertText}</div>
                </div>
              )}

              {detail.signoff && (
                <div className="signoff">
                  {detail.signoff.lines.map((line, i) => <div key={i}>{line}</div>)}
                  <div><strong>{detail.signoff.signedBy}</strong></div>
                </div>
              )}

              {detail.attachments && detail.attachments.length > 0 && (
                <>
                  <div className="attach-title">Tài liệu đính kèm ({detail.attachments.length})</div>
                  <div className="attach-grid">
                    {detail.attachments.map((att) => (
                      <div className="attach" key={att.id}>
                        <div className={`filetype ${att.type}`}>{att.type.toUpperCase()}</div>
                        <div className="info">
                          <div className="name">{att.name}</div>
                          <div className="size">{att.type.toUpperCase()} • {att.sizeLabel}</div>
                        </div>
                        <a
                          className="download"
                          aria-label="Tải xuống"
                          href={att.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="detail" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px", color: "#585c7b", fontSize: "14px", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "32px" }}>📬</div>
              <div>Chọn một thông báo để xem chi tiết</div>
            </div>
          )}
        </div>
      </div>

      {/* Right rail */}
      <aside className="rail">
        <section className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Bộ lọc
            </div>
          </div>
          <div className="field">
            <div className="field-label">Loại thông báo</div>
            <div className="select">Tất cả <svg className="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>
          </div>
          <div className="field">
            <div className="field-label">Danh mục</div>
            <div className="select">Tất cả <svg className="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>
          </div>
          <div className="field">
            <div className="field-label">Khoảng thời gian</div>
            <div className="select">Tất cả thời gian <svg className="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>
          </div>
          <button className="btn-apply">Áp dụng</button>
          <button className="btn-reset">Đặt lại</button>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div className="panel-title">Thông báo nổi bật</div>
            <a href="#" className="link">Xem tất cả <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></a>
          </div>
          <div className="featured-list">
            {items.filter((n) => n.isUrgent).slice(0, 2).map((n) => {
              const color = notifIconColor(n.category);
              return (
                <div key={n.id} className="featured urgent" onClick={() => selectItem(n.id)}>
                  <div className={`thumb ${color}`}>
                    <img src={THUMB_IMG[color] ?? THUMB_IMG.blue} alt="" width={18} height={18} />
                  </div>
                  <div className="body">
                    <div className="kicker-sm">{n.eyebrow}</div>
                    <div className="ftitle">{n.title}</div>
                    <div className="fmeta">{formatDateLong(n.time)} • {formatTime(n.time)}</div>
                  </div>
                </div>
              );
            })}
            {items.filter((n) => n.isUrgent).length === 0 && items.slice(0, 2).map((n) => {
              const color = notifIconColor(n.category);
              return (
                <div key={n.id} className="featured" onClick={() => selectItem(n.id)}>
                  <div className={`thumb ${color}`}>
                    <img src={THUMB_IMG[color] ?? THUMB_IMG.blue} alt="" width={18} height={18} />
                  </div>
                  <div className="body">
                    <div className="ftitle">{n.title}</div>
                    <div className="fmeta">{formatDate(n.time)} • {formatTime(n.time)}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#585c7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div className="panel-title">Danh mục phổ biến</div>
          </div>
          <div className="cat-list">
            {categories.map((c) => (
              <div className="cat" key={c.category}>
                <span>{NOTIF_CATEGORY_LABEL[c.category] ?? c.category}</span>
                <span className="cat-count">{c.count}</span>
              </div>
            ))}
          </div>
          <a href="#" className="cat-link">
            Xem tất cả danh mục
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </section>
      </aside>
    </div>
  );
}
