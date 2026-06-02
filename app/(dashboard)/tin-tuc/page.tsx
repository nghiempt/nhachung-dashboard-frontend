"use client";

import { useMemo, useState } from "react";
import { useApiData } from "@/lib/hooks";
import { formatDateLong, formatDateTime, formatTime, formatNumber } from "@/lib/format";
import { newsCategory } from "@/lib/ui-maps";
import { Modal, ModalBadge } from "@/components/ui/Modal";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  thumbnailUrl: string | null;
  category: string;
  tags: string[];
  isPinned: boolean;
  readMinutes: number;
  viewCount: number;
  authorName: string;
  authorLabel: string;
  publishedAt: string;
}

interface NewsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface NewsListResponse {
  items: NewsItem[];
  meta: NewsMeta;
}

interface TrendingItem {
  rank: number;
  id: string;
  title: string;
  viewCount: number;
}

interface EventItem {
  id: string;
  title: string;
  content: string;
  startAt: string;
  endAt: string | null;
  location: string | null;
  regulations: string | null;
  status: string;
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1200&h=500&fit=crop&auto=format&q=80";

const RANK_STYLES = [
  { rankBg: "#fff3e0", rankColor: "#c05621" },
  { rankBg: "#f0f9ff", rankColor: "#0369a1" },
  { rankBg: "#f0fdf4", rankColor: "#166534" },
];
const RANK_DEFAULT = { rankBg: "#f7f7f7", rankColor: "#b4b7c9" };

const PAGE_LIMIT = 6;

const TABS = [
  { label: "Tất cả", category: "" },
  { label: "Thông báo BQT", category: "announcement" },
  { label: "Sự kiện", category: "event" },
  { label: "Bảo trì", category: "maintenance" },
  { label: "Cộng đồng", category: "community" },
];

const FILTER_CHIPS = [
  { label: "Tất cả", pinned: undefined as boolean | undefined },
  { label: "Tháng này", pinned: undefined as boolean | undefined },
  { label: "Quan trọng", pinned: true as boolean | undefined },
  { label: "Chưa đọc", pinned: undefined as boolean | undefined },
];

function eventStatusBadge(status: string): { label: string; bg: string; color: string } {
  if (status === "ongoing") return { label: "Đang diễn ra", bg: "#e3fbed", color: "#1c9d5f" };
  if (status === "completed") return { label: "Đã kết thúc", bg: "#f7f7f7", color: "#585c7b" };
  return { label: "Sắp diễn ra", bg: "#e4f1ff", color: "#1561c0" };
}

export default function TinTucPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeChip, setActiveChip] = useState(0);
  const [page, setPage] = useState(1);
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const category = TABS[activeTab].category;
  const pinned = FILTER_CHIPS[activeChip].pinned;

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (pinned) params.set("pinned", "true");
    params.set("page", String(page));
    params.set("limit", String(PAGE_LIMIT));
    return params.toString();
  }, [category, pinned, page]);

  const { data: newsData, loading: newsLoading } = useApiData<NewsListResponse>(
    `/news?${query}`,
    [query],
  );
  const { data: featured } = useApiData<NewsItem>("/news/featured");
  const { data: trending } = useApiData<TrendingItem[]>("/news/trending");
  const { data: events } = useApiData<EventItem[]>("/events?upcoming=true");

  const newsCards = useMemo(() => {
    const items = [...(newsData?.items ?? [])];
    items.sort((a, b) => {
      const diff = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      return sortDesc ? -diff : diff;
    });
    return items;
  }, [newsData, sortDesc]);
  const meta = newsData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const featuredCat = featured ? newsCategory(featured.category) : null;

  return (
    <div style={{ padding: "24px 28px 48px" }}>

      {/* Page header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#272727", lineHeight: "28px" }}>Tin tức cộng đồng</h1>
            <p style={{ fontSize: "13px", color: "#585c7b", marginTop: "3px" }}>Thông tin, sự kiện và hoạt động mới nhất từ ban quản trị và cư dân</p>
          </div>
        </div>

        {/* Tabs */}
        <nav style={{ display: "flex", gap: "4px", borderBottom: "1px solid #e2e5f1" }}>
          {TABS.map((tab, i) => {
            const active = i === activeTab;
            return (
              <a key={tab.label} href="#" onClick={(e) => { e.preventDefault(); setActiveTab(i); setPage(1); }} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", fontSize: "13px",
                fontWeight: active ? 600 : 500,
                color: active ? "#4137f9" : "#585c7b",
                borderBottom: active ? "2px solid #4137f9" : "2px solid transparent",
                marginBottom: "-1px", cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap",
              }}>
                {tab.label}
                {active && meta && (
                  <span style={{
                    fontSize: "11px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px",
                    background: "#f7f5ff",
                    color: "#4137f9",
                  }}>{meta.total}</span>
                )}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#585c7b", whiteSpace: "nowrap" }}>Lọc:</span>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {FILTER_CHIPS.map((chip, i) => {
            const active = i === activeChip;
            return (
              <span key={chip.label} onClick={() => { setActiveChip(i); setPage(1); }} style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                border: active ? "1px solid #d3c5fd" : "1px solid #e2e5f1",
                background: active ? "#f7f5ff" : "#ffffff",
                color: active ? "#4137f9" : "#585c7b",
                cursor: "pointer",
              }}>{chip.label}</span>
            );
          })}
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={() => setSortDesc((v) => !v)} title="Đổi thứ tự sắp xếp" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", border: "1px solid #d4d7e5", borderRadius: "8px", fontSize: "12px", fontWeight: 500, color: "#585c7b", background: "#ffffff", cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            {sortDesc ? "Mới nhất" : "Cũ nhất"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </div>

      {/* Two-col: main + aside */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>

        {/* Main feed */}
        <div>
          {/* Featured article */}
          {featured && (
            <div onClick={() => setSelectedNewsId(featured.id)} style={{ position: "relative", borderRadius: "20px", overflow: "hidden", marginBottom: "20px", cursor: "pointer" }}>
              <img src={featured.thumbnailUrl || FALLBACK_IMG} alt="" style={{ width: "100%", height: "260px", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.18) 55%, transparent 100%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 28px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  {featured.isPinned && (
                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase", padding: "3px 10px", borderRadius: "20px", background: "rgba(255,214,24,.9)", color: "#3b2a00" }}>📌 Ghim</span>
                  )}
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase", padding: "3px 10px", borderRadius: "20px", background: "rgba(255,255,255,.2)", color: "#fff", backdropFilter: "blur(4px)" }}>{featuredCat?.label}</span>
                </div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff", lineHeight: 1.35, marginBottom: "8px", maxWidth: "680px" }}>
                  {featured.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#4137f9", border: "2px solid rgba(255,255,255,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "#fff" }}>{featured.authorLabel}</div>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,.85)", fontWeight: 500 }}>{featured.authorName}</span>
                  </div>
                  <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,.4)" }} />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,.65)" }}>{formatDateLong(featured.publishedAt)}</span>
                  <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,.4)" }} />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,.65)" }}>{featured.readMinutes} phút đọc</span>
                </div>
              </div>
            </div>
          )}

          {/* News grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            {newsLoading && newsCards.length === 0 && (
              <div style={{ fontSize: "13px", color: "#585c7b", gridColumn: "1 / -1", padding: "8px 2px" }}>Đang tải...</div>
            )}
            {!newsLoading && newsCards.length === 0 && (
              <div style={{ fontSize: "13px", color: "#585c7b", gridColumn: "1 / -1", padding: "8px 2px" }}>Không có tin tức nào.</div>
            )}
            {newsCards.map((card) => {
              const cat = newsCategory(card.category);
              return (
                <div key={card.id} onClick={() => setSelectedNewsId(card.id)} style={{ background: "#ffffff", border: "1px solid #e2e5f1", borderRadius: "20px", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }}>
                  <img src={card.thumbnailUrl || FALLBACK_IMG} alt="" style={{ width: "100%", height: "148px", objectFit: "cover", display: "block", background: "#f7f7f7" }} />
                  <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", letterSpacing: ".3px", background: cat.bg, color: cat.color }}>{cat.label}</span>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#272727", lineHeight: 1.45, marginBottom: "6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{card.title}</div>
                    <div style={{ fontSize: "12px", color: "#585c7b", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "12px", flex: 1 } as React.CSSProperties}>{card.excerpt}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: cat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{card.authorLabel}</div>
                        <span style={{ fontSize: "12px", color: "#585c7b", fontWeight: 500 }}>{card.authorName}</span>
                      </div>
                      <span style={{ fontSize: "12px", color: "#b4b7c9" }}>{formatDateLong(card.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", paddingTop: "8px" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e5f1", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: page <= 1 ? "default" : "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b4b7c9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: n === page ? "1px solid #4137f9" : "1px solid #e2e5f1", background: n === page ? "#4137f9" : "#ffffff", fontSize: "12px", fontWeight: 600, color: n === page ? "#fff" : "#585c7b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{n}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e5f1", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: page >= totalPages ? "default" : "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b4b7c9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          )}
        </div>

        {/* Aside */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Hot topics */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e5f1", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #e2e5f1" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#585c7b", textTransform: "uppercase", letterSpacing: ".5px" }}>Xem nhiều nhất</div>
            </div>
            <div style={{ padding: "4px 0 8px" }}>
              {(trending ?? []).map((item) => {
                const rs = RANK_STYLES[item.rank - 1] ?? RANK_DEFAULT;
                return (
                  <div key={item.id} onClick={() => setSelectedNewsId(item.id)} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 16px", cursor: "pointer" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: rs.rankBg, color: rs.rankColor, fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>{item.rank}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#272727", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{item.title}</div>
                      <div style={{ fontSize: "11px", color: "#b4b7c9", marginTop: "2px" }}>{formatNumber(item.viewCount)} lượt xem</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming events */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e5f1", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #e2e5f1" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#585c7b", textTransform: "uppercase", letterSpacing: ".5px" }}>Sự kiện sắp diễn ra</div>
            </div>
            <div style={{ padding: "4px 0 8px" }}>
              {(events ?? []).map((ev) => {
                const start = new Date(ev.startAt);
                const day = String(start.getDate()).padStart(2, "0");
                const mon = `Th.${start.getMonth() + 1}`;
                const timeRange = ev.endAt
                  ? `${formatTime(ev.startAt)} – ${formatTime(ev.endAt)}`
                  : formatTime(ev.startAt);
                const loc = ev.location ? `${timeRange} · ${ev.location}` : timeRange;
                const badge = eventStatusBadge(ev.status);
                return (
                  <div key={ev.id} onClick={() => setSelectedEventId(ev.id)} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 16px", cursor: "pointer" }}>
                    <div style={{ width: "38px", textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#4137f9", lineHeight: 1 }}>{day}</div>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#585c7b", textTransform: "uppercase" }}>{mon}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#272727", lineHeight: 1.4 }}>{ev.title}</div>
                      <div style={{ fontSize: "11px", color: "#585c7b", marginTop: "2px" }}>{loc}</div>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "10px", marginTop: "4px", display: "inline-block", background: badge.bg, color: badge.color }}>{badge.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {selectedNewsId && (
        <NewsDetailModal id={selectedNewsId} onClose={() => setSelectedNewsId(null)} />
      )}
      {selectedEventId && (
        <EventDetailModal id={selectedEventId} onClose={() => setSelectedEventId(null)} />
      )}
    </div>
  );
}

// ── News detail popup ──────────────────────────────────────────
interface NewsDetail extends NewsItem {
  content: string;
}

function NewsDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, loading } = useApiData<NewsDetail>(`/news/${id}`, [id]);
  const cat = data ? newsCategory(data.category) : null;

  return (
    <Modal onClose={onClose} width={680}>
      {loading && !data ? (
        <div style={{ padding: "60px 24px", textAlign: "center", fontSize: "14px", color: "#585c7b" }}>Đang tải...</div>
      ) : data ? (
        <>
          <img
            src={data.thumbnailUrl || FALLBACK_IMG}
            alt=""
            style={{ width: "100%", height: "260px", objectFit: "cover", display: "block", borderTopLeftRadius: "20px", borderTopRightRadius: "20px" }}
          />
          <div style={{ padding: "20px 28px 28px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              {cat && <ModalBadge label={cat.label} bg={cat.bg} color={cat.color} />}
              {data.isPinned && <ModalBadge label="📌 Ghim" bg="#fff3e0" color="#b45309" />}
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#272727", lineHeight: 1.35, marginBottom: "12px" }}>{data.title}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "18px", paddingBottom: "18px", borderBottom: "1px solid #eff2fc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: cat?.color ?? "#4137f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#fff" }}>{data.authorLabel}</div>
                <span style={{ fontSize: "13px", color: "#272727", fontWeight: 600 }}>{data.authorName}</span>
              </div>
              <span style={{ fontSize: "12px", color: "#b4b7c9" }}>{formatDateLong(data.publishedAt)}</span>
              <span style={{ fontSize: "12px", color: "#b4b7c9" }}>· {data.readMinutes} phút đọc</span>
              <span style={{ fontSize: "12px", color: "#b4b7c9" }}>· {formatNumber(data.viewCount)} lượt xem</span>
            </div>
            <div style={{ fontSize: "14px", color: "#3e4265", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
              {data.content || data.excerpt}
            </div>
            {data.tags?.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "20px" }}>
                {data.tags.map((t) => (
                  <span key={t} style={{ fontSize: "12px", fontWeight: 500, padding: "4px 10px", borderRadius: "20px", background: "#f7f7f7", color: "#585c7b" }}>#{t}</span>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: "60px 24px", textAlign: "center", fontSize: "14px", color: "#585c7b" }}>Không tải được nội dung.</div>
      )}
    </Modal>
  );
}

// ── Event detail popup ─────────────────────────────────────────
interface EventDetail {
  id: string;
  title: string;
  content: string;
  startAt: string;
  endAt: string | null;
  location: string | null;
  regulations: string | null;
  status: string;
}

function EventDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, loading } = useApiData<EventDetail>(`/events/${id}`, [id]);
  const badge = data ? eventStatusBadge(data.status) : null;

  return (
    <Modal
      onClose={onClose}
      width={560}
      title={data?.title}
      headerAccent={badge ? <ModalBadge label={badge.label} bg={badge.bg} color={badge.color} /> : undefined}
    >
      {loading && !data ? (
        <div style={{ padding: "40px 24px", textAlign: "center", fontSize: "14px", color: "#585c7b" }}>Đang tải...</div>
      ) : data ? (
        <div style={{ padding: "16px 24px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", color: "#585c7b", width: "92px", flexShrink: 0 }}>Thời gian</span>
              <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#272727" }}>
                {formatDateTime(data.startAt)}{data.endAt ? ` – ${formatTime(data.endAt)}` : ""}
              </span>
            </div>
            {data.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "13px", color: "#585c7b", width: "92px", flexShrink: 0 }}>Địa điểm</span>
                <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#272727" }}>{data.location}</span>
              </div>
            )}
          </div>
          {data.content && (
            <div style={{ fontSize: "14px", color: "#3e4265", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: data.regulations ? "16px" : 0 }}>
              {data.content}
            </div>
          )}
          {data.regulations && (
            <div style={{ background: "#f9fafe", border: "1px solid #eff2fc", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#585c7b", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: "8px" }}>Nội quy / Lưu ý</div>
              <div style={{ fontSize: "13.5px", color: "#3e4265", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data.regulations}</div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: "40px 24px", textAlign: "center", fontSize: "14px", color: "#585c7b" }}>Không tải được sự kiện.</div>
      )}
    </Modal>
  );
}
