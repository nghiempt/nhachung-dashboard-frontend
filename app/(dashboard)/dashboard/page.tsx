"use client";

import { useRouter } from "next/navigation";
import { useApiData } from "@/lib/hooks";
import { formatDateLong, formatTime, timeAgo, formatNumber } from "@/lib/format";
import { notifIconColor, type IconColor } from "@/lib/ui-maps";

interface OverviewHero {
  greeting: string;
  buildingName: string;
  residentsCount: number;
  unreadNotifications: number;
}
interface OverviewStat {
  key: string;
  label: string;
  value: number | null;
  unit?: string;
  deferred?: boolean;
  changePercent?: number | null;
}
interface OverviewNotification {
  id: string;
  title: string;
  source: string;
  category: string;
  iconType: string;
  isUrgent: boolean;
  status: string;
  time: string;
}
interface OverviewCommunityPost {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  viewCount: number;
  createdAt: string;
}
interface OverviewEvent {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  location: string;
}
interface DashboardOverview {
  hero: OverviewHero;
  stats: OverviewStat[];
  notifications: OverviewNotification[];
  communityPosts: OverviewCommunityPost[];
  events: OverviewEvent[];
}

// Colored notif icon assets, keyed by the semantic color from the category map.
const NOTIF_ICON_BY_COLOR: Record<IconColor, string> = {
  red: "/images/dashboard/notif-icon-1.svg",
  blue: "/images/dashboard/notif-icon-2.svg",
  violet: "/images/dashboard/notif-icon-3.svg",
  green: "/images/dashboard/notif-icon-3.svg",
  mint: "/images/dashboard/notif-icon-3.svg",
  orange: "/images/dashboard/notif-icon-4.svg",
  amber: "/images/dashboard/notif-icon-4.svg",
};

// Background accents for the 4 stat cards (preserve original order/colors).
const STAT_ICON_BG = ["#eae7fe", "#e6f7f1", "#fef1e6", "#e6f0fe"];
const STAT_ICON_IMG = [
  "/images/dashboard/img_13.svg",
  "/images/dashboard/img_14.svg",
  "/images/dashboard/img_15.svg",
  "/images/dashboard/img_16.svg",
];

function statDisplayValue(stat: OverviewStat): string {
  if (stat.deferred || stat.value == null) return "Đang cập nhật";
  return `${formatNumber(stat.value)}${stat.unit ?? ""}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data, loading } = useApiData<DashboardOverview>("/dashboard/overview");

  const hero = data?.hero;
  const stats = data?.stats ?? [];
  const notifications = data?.notifications ?? [];
  const communityPosts = data?.communityPosts ?? [];
  const events = data?.events ?? [];

  // Build a Monday-first calendar grid for the current month (6 weeks),
  // marking today and out-of-month spill days. Replaces the old static grid.
  const now = new Date();
  const calYear = now.getFullYear();
  const calMonth = now.getMonth();
  const todayDate = now.getDate();
  const MONTHS_VI = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];
  const firstDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // 0 = Mon
  const startDate = new Date(calYear, calMonth, 1 - firstDow);
  const calCells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const inMonth = d.getMonth() === calMonth;
    return {
      key: i,
      day: d.getDate(),
      inMonth,
      isToday: inMonth && d.getDate() === todayDate,
    };
  });

  return (
    <div className="db-content">

      {/* ── Hero Banner ── */}
      <div className="hero-banner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-bg" src="/images/dashboard/hero-bg.jpg" alt="" />

        <div className="hero-left">
          <div className="hero-text">
            <p className="hero-greeting">{hero?.greeting ?? (loading ? "Đang tải..." : "")}</p>
            <p className="hero-date">Hôm nay là {formatDateLong(new Date())}</p>
            <div className="hero-meta">
              <div className="hero-meta-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/dashboard/img_1.svg" alt="" />
                {hero?.buildingName ?? ""}
              </div>
              <div className="hero-meta-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/dashboard/img_2.svg" alt="" />
                {formatNumber(hero?.residentsCount)} cư dân
              </div>
            </div>
          </div>
          <div className="hero-notif-pill">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/dashboard/img_3.svg" alt="" />
            Bạn có {formatNumber(hero?.unreadNotifications)} thông báo mới
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hero-notif-pill-arrow" src="/images/dashboard/hero-notif-pill-arrow.svg" alt="" />
          </div>
        </div>

        <div className="hero-right">
          <div className="weather-top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="weather-icon" src="/images/dashboard/weather-icon.png" alt="Sun" />
            <div className="weather-info">
              <span className="weather-city">TP. Hồ Chí Minh</span>
              {/* Live temperature/condition not wired to a weather provider yet;
                  show a neutral prompt instead of fabricated values. */}
              <span className="weather-desc">Dự báo thời tiết</span>
            </div>
          </div>
          <button className="weather-btn" onClick={() => window.open('https://nchmf.gov.vn/Kttv/vi-VN/1/index.html', '_blank', 'noopener,noreferrer')}>
            Xem dự báo
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/dashboard/img_6.svg" alt="" />
          </button>
        </div>
      </div>

      {/* ── Content Row ── */}
      <div className="content-row">

        {/* Left Column */}
        <div className="col-left">

          {/* Thao tác nhanh */}
          <div>
            <div className="db-section-title">Thao tác nhanh</div>
            <div className="quick-actions-grid">

              <div className="qa-card" onClick={() => router.push('/gop-y')} style={{ cursor: 'pointer' }}>
                <div className="qa-icon-box" style={{ background: '#4137f9' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M11.32 6.176H5c-1.105 0-2 .949-2 2.118v10.588C3 19.052 3.895 20 5 20h11c1.105 0 2-.948 2-2.118v-7.75l-3.914 4.144a2.46 2.46 0 0 1-1.276.67l-3.114.733a2.46 2.46 0 0 1-2.638-1.659l-.537-1.518a2.46 2.46 0 0 1 .538-2.44l5.17-5.47-.908-.47Z" />
                    <path d="M19.901 3.604c-.785-.831-2.067-.831-2.852 0l-1.52 1.608a.396.396 0 0 0-.027.534l3.584 3.799a.397.397 0 0 0 .549.012l1.496-1.581c.785-.832.785-2.18 0-3.012Z" />
                  </svg>
                </div>
                <div className="qa-info">
                  <div className="qa-title">Gửi phản ánh</div>
                  <div className="qa-desc">Báo cáo sự cố, góp ý</div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="qa-arrow" src="/images/dashboard/qa-arrow.svg" alt="" />
              </div>

              <div className="qa-card" onClick={() => router.push('/tai-chinh')} style={{ cursor: 'pointer' }}>
                <div className="qa-icon-box" style={{ background: '#41c69c' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/dashboard/img_8.svg" alt="" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className="qa-info">
                  <div className="qa-title">Xem báo cáo</div>
                  <div className="qa-desc">Minh bạch tài chính</div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="qa-arrow" src="/images/dashboard/qa-arrow.svg" alt="" />
              </div>

              <div className="qa-card" onClick={() => router.push('/ai-assistant')} style={{ cursor: 'pointer' }}>
                <div className="qa-icon-box" style={{ background: '#6c90fa' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/dashboard/img_10.svg" alt="" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className="qa-info">
                  <div className="qa-title">AI trợ lý</div>
                  <div className="qa-desc">Hỏi đáp thông tin</div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="qa-arrow" src="/images/dashboard/qa-arrow.svg" alt="" />
              </div>

            </div>
          </div>

          {/* Tổng quan minh bạch */}
          <div>
            <div className="db-section-header">
              <div className="db-section-title">Tổng quan minh bạch</div>
              <span className="db-filter-btn" style={{ cursor: 'default' }}>
                Tháng 5/2026
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/dashboard/img_24.svg" alt="" />
              </span>
            </div>
            <div className="stats-grid">
              {[0, 2].map((rowStart) => (
                <div className="stats-row" key={rowStart}>
                  {[rowStart, rowStart + 1].map((i) => {
                    const stat = stats[i];
                    if (!stat) {
                      return <div className="stat-card" key={i} />;
                    }
                    return (
                      <div className="stat-card" key={stat.key}>
                        <div className="stat-icon-box" style={{ background: STAT_ICON_BG[i] }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={STAT_ICON_IMG[i]} alt="" />
                        </div>
                        <div className="stat-info">
                          <div className="stat-label">{stat.label}</div>
                          <div className="stat-value">{statDisplayValue(stat)}</div>
                          {!stat.deferred && stat.changePercent != null && (
                            <div className="stat-change">
                              <span className={`pct ${stat.changePercent < 0 ? "down" : "up"}`}>
                                {stat.changePercent < 0 ? "" : "+"}{stat.changePercent}%
                              </span> so với tháng trước
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Hoạt động cộng đồng */}
          <div>
            <div className="db-section-header">
              <div className="db-section-title">Hoạt động cộng đồng</div>
              <a onClick={() => router.push('/tin-tuc')} className="db-section-link" style={{ cursor: 'pointer' }}>
                Xem tất cả
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/dashboard/img_6.svg" alt="" />
              </a>
            </div>
            <div className="community-grid">

              {communityPosts.map((post, i) => (
                <div className="community-card" key={post.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="community-photo"
                    src={post.thumbnailUrl ?? `/images/dashboard/community-${(i % 3) + 1}.png`}
                    alt=""
                  />
                  <div className="community-body">
                    <div className="community-title">{post.title}</div>
                    <div className="community-meta">
                      <span className="community-time">{timeAgo(post.createdAt)}</span>
                      <div className="community-views">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/dashboard/img_19.svg" alt="" />
                        {formatNumber(post.viewCount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>{/* /col-left */}

        {/* Right Column */}
        <div className="col-right">

          {/* Thông báo mới */}
          <div>
            <div className="db-section-header">
              <div className="db-section-title">Thông báo mới</div>
              <a onClick={() => router.push('/thong-bao')} className="db-section-link" style={{ cursor: 'pointer' }}>
                Xem tất cả
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/dashboard/img_6.svg" alt="" />
              </a>
            </div>
            <div className="notif-list-card">

              {notifications.map((n) => (
                <div className="notif-row" key={n.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="notif-icon"
                    src={NOTIF_ICON_BY_COLOR[notifIconColor(n.category)]}
                    alt=""
                  />
                  <div className="notif-info">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-sub">{n.source}</div>
                  </div>
                  <span className="notif-time">{formatTime(n.time)}</span>
                </div>
              ))}

            </div>
          </div>

          {/* Lịch sự kiện */}
          <div>
            <div className="db-section-header">
              <div className="db-section-title">Lịch sự kiện</div>
              <a onClick={() => router.push('/tin-tuc')} className="db-section-link" style={{ cursor: 'pointer' }}>
                Xem lịch đầy đủ
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/dashboard/img_6.svg" alt="" />
              </a>
            </div>

            <div className="calendar-card">
              {/* Calendar header */}
              <div className="cal-header">
                <span className="cal-nav-btn" style={{ opacity: 0.4, cursor: 'default' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3e4265" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </span>
                <div className="cal-month-btn">
                  <span className="cal-month-text">{MONTHS_VI[calMonth]}, {calYear}</span>
                </div>
                <span className="cal-nav-btn" style={{ opacity: 0.4, cursor: 'default' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3e4265" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </div>

              {/* Day-of-week headers */}
              <div className="cal-grid">
                <div className="cal-dow">T2</div>
                <div className="cal-dow">T3</div>
                <div className="cal-dow">T4</div>
                <div className="cal-dow">T5</div>
                <div className="cal-dow">T6</div>
                <div className="cal-dow">T7</div>
                <div className="cal-dow">CN</div>
                {calCells.map((c) => (
                  <div
                    key={c.key}
                    className={`cal-cell${c.inMonth ? "" : " other-month"}${c.isToday ? " today" : ""}`}
                  >
                    {c.day}
                  </div>
                ))}
              </div>

              {/* Event cards */}
              <div className="event-grid" style={{ marginTop: '12px' }}>

                {events.map((ev) => (
                  <div className="event-card" key={ev.id}>
                    <div className="event-title">{ev.title}</div>
                    <div className="event-meta">
                      <div className="event-meta-row">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/dashboard/img_30.svg" alt="" />
                        <span>{formatTime(ev.startAt)} - {formatTime(ev.endAt)}</span>
                      </div>
                      <div className="event-meta-row">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/dashboard/img_31.svg" alt="" />
                        <span>{ev.location}</span>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>

        </div>{/* /col-right */}
      </div>{/* /content-row */}

      {/* ── AI Banner ── */}
      <div className="ai-banner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ai-banner-bg" src="/images/dashboard/ai-banner-bg.jpg" alt="" />
        <div className="ai-banner-left">
          <div className="ai-banner-text">
            <div className="ai-banner-title">Hỏi AI trợ lý của cư dân</div>
            <div className="ai-banner-subtitle">Tôi có thể giúp gì cho bạn hôm nay?</div>
          </div>
          <div className="ai-chips">
            <button className="ai-chip" onClick={() => router.push('/ai-assistant')}>Quy định về việc nuôi thú cưng?</button>
            <button className="ai-chip" onClick={() => router.push('/ai-assistant')}>Hướng dẫn đăng ký xe</button>
            <button className="ai-chip" onClick={() => router.push('/ai-assistant')}>Tìm tài liệu nội quy</button>
          </div>
        </div>
        <button className="ai-chat-btn" onClick={() => router.push('/ai-assistant')}>
          Chat với AI
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/dashboard/img_35.svg" alt="" />
        </button>
      </div>

    </div>
  );
}
