"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPost } from "@/lib/api";
import { formatDate, formatDateTime, formatTime } from "@/lib/format";
import { feedbackStatus, feedbackPriority } from "@/lib/ui-maps";
import { Skeleton, SkeletonText, LoadingState } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface SummaryTab {
  key: string;
  label: string;
  count: number;
}
interface FeedbackListItem {
  id: string;
  code: string;
  category: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  timeLabel: string;
  imageCount: number;
}
interface FeedbackListResponse {
  items: FeedbackListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
interface FeedbackHistory {
  id: string;
  label: string;
  description: string | null;
  status: string;
  actorName: string | null;
  completed: boolean;
  time: string;
}
interface FeedbackDetail {
  id: string;
  code: string;
  title: string;
  description: string | null;
  status: string;
  submitter: { name: string } | null;
  metadata: {
    category: string;
    priority: string;
    location: string | null;
    createdAt: string;
    updatedAt: string;
  };
  images: { url: string }[];
  history: FeedbackHistory[];
}

const TAB_KEYS = ["all", "processing", "awaiting", "completed", "rejected"];
const PAGE_LIMIT = 5;

export default function GopYPage() {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Summary tabs
  const { data: summary, refetch: refetchSummary } =
    useApiData<{ tabs: SummaryTab[] }>("/feedbacks/summary");

  // List
  const listPath = useMemo(() => {
    const params = new URLSearchParams();
    if (activeTab !== "all") params.set("status", activeTab);
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    params.set("page", String(page));
    params.set("limit", String(PAGE_LIMIT));
    return `/feedbacks?${params.toString()}`;
  }, [activeTab, debouncedSearch, page]);

  const {
    data: list,
    loading: listLoading,
    refetch: refetchList,
  } = useApiData<FeedbackListResponse>(listPath);

  const items = list?.items ?? [];
  const meta = list?.meta;

  // Auto-select first item when list loads & nothing selected
  useEffect(() => {
    if (!selectedId && items.length > 0) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  // Detail
  const {
    data: detail,
    loading: detailLoading,
  } = useApiData<FeedbackDetail>(selectedId ? `/feedbacks/${selectedId}` : null);

  const tabs: SummaryTab[] =
    summary?.tabs ??
    TAB_KEYS.map((key) => ({ key, label: "", count: 0 }));

  const totalPages = meta?.totalPages ?? 1;
  const pageNumbers = useMemo(() => {
    const arr: number[] = [];
    for (let i = 1; i <= Math.min(totalPages, 5); i++) arr.push(i);
    return arr;
  }, [totalPages]);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Page header */}
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#272727", lineHeight: "36px" }}>Góp ý / Phản ánh</h1>
            <p style={{ fontSize: "16px", color: "#3e4265", marginTop: "6px", fontWeight: 500, lineHeight: "24px" }}>
              Gửi phản ánh và theo dõi tình trạng xử lý từ Ban quản trị
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "11px 18px", background: "#4137f9",
              borderRadius: "10px", border: 0,
              fontSize: "14px", fontWeight: 500, color: "#fff",
              cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, marginTop: "4px", lineHeight: "22px",
            }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Tạo phản ánh mới
          </button>
        </div>

        {/* Tabs */}
        <nav style={{ display: "flex", borderBottom: "1px solid #e2e5f1" }}>
          {tabs.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <a key={tab.key} href="#" onClick={(e) => { e.preventDefault(); setActiveTab(tab.key); setPage(1); }} style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "0 18px 14px",
                fontSize: "14px", fontWeight: active ? 600 : 500,
                color: active ? "#4137f9" : "#585c7b",
                cursor: "pointer", position: "relative", whiteSpace: "nowrap",
                textDecoration: "none",
                borderBottom: active ? "2px solid #4137f9" : "2px solid transparent",
                marginBottom: "-1px",
              }}>
                {tab.label}
                <span style={{
                  fontSize: "11px", fontWeight: 700, padding: "2px 7px",
                  borderRadius: "10px", lineHeight: "17px",
                  background: active ? "#f1f7ff" : "#f0f1f5",
                  color: active ? "#4137f9" : "#585c7b",
                }}>{tab.count}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Three-column layout */}
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

        {/* LEFT — List */}
        <div style={{ width: "372px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Search + filter */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", border: "1px solid #d4d7e5", borderRadius: "10px", padding: "0 15px", height: "44px", background: "#ffffff" }}>
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNy4zMzMgMTJDOS45MSAxMiAxMiA5LjkxIDEyIDcuMzMzQzEyIDQuNzU2IDkuOTEgMi42NjcgNy4zMzMgMi42NjdDNC43NTYgMi42NjcgMi42NjcgNC43NTYgMi42NjcgNy4zMzNDMi42NjcgOS45MSA0Ljc1NiAxMiA3LjMzMyAxMloiIHN0cm9rZT0iI0I0QjdDOSIgc3Ryb2tlLXdpZHRoPSIxLjMzMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEzLjMzMyAxMy4zMzNMMTEuMSAxMS4xIiBzdHJva2U9IiNCNEI3QzkiIHN0cm9rZS13aWR0aD0iMS4zMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==" alt="" width={16} height={16} style={{ flex: "0 0 16px" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm phản ánh..." style={{ flex: 1, border: 0, outline: 0, fontSize: "14px", background: "transparent", color: "#222" }} />
            </div>
            <button style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "0 16px", height: "44px", background: "#ffffff", border: "1px solid #d4d7e5", borderRadius: "10px", fontSize: "13.5px", fontWeight: 400, color: "#272727", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAzLjMzM1YxMi42NjciIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS40NTgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zLjMzMyA4SDEyLjY2NyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjQ1OCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="" width={16} height={16} />
              Bộ lọc
            </button>
          </div>

          {/* Cards */}
          {listLoading && items.length === 0 &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`sk-${i}`} style={{ background: "#ffffff", border: "1px solid #e2e5f1", borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Skeleton width={44} height={44} radius={10} />
                  <div style={{ flex: 1 }}>
                    <Skeleton height={10} width="40%" />
                    <SkeletonText lines={2} lineHeight={11} />
                  </div>
                </div>
                <Skeleton height={10} width="70%" />
              </div>
            ))}
          {!listLoading && items.length === 0 && (
            <div style={{ fontSize: "13.5px", color: "#585c7b", padding: "16px" }}>Chưa có phản ánh nào.</div>
          )}
          {items.map((card) => {
            const active = card.id === selectedId;
            const st = feedbackStatus(card.status);
            return (
              <div key={card.id} onClick={() => setSelectedId(card.id)} style={{ background: active ? "#f7f5ff" : "#ffffff", border: `1px solid ${active ? "#d3c5fd" : "#e2e5f1"}`, borderRadius: "20px", padding: "16px", cursor: "pointer", boxShadow: active ? "0 2px 5px rgba(65,55,249,.12)" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: active ? "#ffffff" : "#f7f8fc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMjIiIHZpZXdCb3g9IjAgMCAyMiAyMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTEgMkM2LjAyOSAyIDIgNi4wMjkgMiAxMUMyIDE1Ljk3MSA2LjAyOSAyMCAxMSAyMEMxNS45NzEgMjAgMjAgMTUuOTcxIDIwIDExQzIwIDYuMDI5IDE1Ljk3MSAyIDExIDJaIiBmaWxsPSIjRkZFREVEIiBzdHJva2U9IiNGNTIyMkQiIHN0cm9rZS13aWR0aD0iMS41Ii8+PHBhdGggZD0iTTE0LjI1IDguNzVMNy43NSAxNS4yNU03Ljc1IDguNzVMMTQuMjUgMTUuMjUiIHN0cm9rZT0iI0Y1MjIyRCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==" alt="" width={22} height={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "11.5px", color: "#585c7b", marginBottom: "4px" }}>{card.category}</div>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#272727", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{card.title}</div>
                  </div>
                  <div style={{ width: "8px", height: "8px", borderRadius: "4px", background: st.dot, flexShrink: 0, marginTop: "4px" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "11.5px", color: "#585c7b" }}>{card.code} · {formatTime(card.timeLabel)} · {formatDate(card.createdAt)}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "999px", fontSize: "11.5px", fontWeight: 600, whiteSpace: "nowrap", background: st.bg, color: st.color }}>{st.label}</span>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", paddingBottom: "4px", marginTop: "2px" }}>
            <span style={{ fontSize: "12px", color: "#3e4265", whiteSpace: "nowrap" }}>
              {meta && meta.total > 0
                ? `Hiển thị ${(meta.page - 1) * meta.limit + 1} - ${Math.min(meta.page * meta.limit, meta.total)} của ${meta.total} phản ánh`
                : `Hiển thị 0 phản ánh`}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ minWidth: "32px", height: "32px", borderRadius: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d4d7e5", background: "#ffffff", cursor: page <= 1 ? "default" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMy43NSA3LjVMNi4yNSA1TDMuNzUgMi41IiBzdHJva2U9IiMzRTQyNjUiIHN0cm9rZS13aWR0aD0iMS4wNDIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==" alt="" width={10} height={10} />
              </button>
              {pageNumbers.map((n) => (
                <button key={n} onClick={() => setPage(n)} style={{ minWidth: "32px", height: "32px", borderRadius: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 8px", fontSize: "13px", color: n === page ? "#fff" : "#3e4265", border: n === page ? "1px solid #4137f9" : "1px solid #d4d7e5", background: n === page ? "#4137f9" : "#ffffff", cursor: "pointer", fontWeight: n === page ? 600 : 400 }}>{n}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ minWidth: "32px", height: "32px", borderRadius: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d4d7e5", background: "#ffffff", cursor: page >= totalPages ? "default" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}>
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNi4yNSA3LjVMMy43NSA1TDYuMjUgMi41IiBzdHJva2U9IiMzRTQyNjUiIHN0cm9rZS13aWR0aD0iMS4wNDIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==" alt="" width={10} height={10} />
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE — Detail */}
        <div style={{ flex: 1, minWidth: 0, background: "#ffffff", border: "1px solid #e2e5f1", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Topbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setSelectedId(null); }} style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#3e4265", textDecoration: "none" }}>
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAxNSAxNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTEuODc1IDcuNUgzLjEyNSIgc3Ryb2tlPSIjM0U0MjY1IiBzdHJva2Utd2lkdGg9IjEuMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik03LjUgMTEuODc1TDMuMTI1IDcuNUw3LjUgMy4xMjUiIHN0cm9rZT0iIzNFNDI2NSIgc3Ryb2tlLXdpZHRoPSIxLjI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="" width={15} height={15} />
              <span style={{ fontSize: "13.5px" }}>Quay lại danh sách</span>
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 15px", background: "#ffffff", border: "1px solid #d4d7e5", borderRadius: "10px", fontSize: "13px", fontWeight: 500, color: "#272727", cursor: "pointer" }}>
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNS4yNSAxMC41TDguNzUgN0w1LjI1IDMuNSIgc3Ryb2tlPSIjNTg1QzdCIiBzdHJva2Utd2lkdGg9IjEuMTY3IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="" width={14} height={14} />
                Theo dõi
              </button>
              <button style={{ width: "34px", height: "34px", background: "#ffffff", border: "1px solid #d4d7e5", borderRadius: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAxNSAxNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzLjEyNSIgY3k9IjcuNSIgcj0iMC45Mzc1IiBmaWxsPSIjM0U0MjY1Ii8+PGNpcmNsZSBjeD0iNy41IiBjeT0iNy41IiByPSIwLjkzNzUiIGZpbGw9IiMzRTQyNjUiLz48Y2lyY2xlIGN4PSIxMS44NzUiIGN5PSI3LjUiIHI9IjAuOTM3NSIgZmlsbD0iIzNFNDI2NSIvPjwvc3ZnPg==" alt="" width={15} height={15} />
              </button>
            </div>
          </div>

          {detailLoading && !detail && <LoadingState label="Đang tải chi tiết..." minHeight={200} />}
          {!detailLoading && !detail && (
            <div style={{ fontSize: "13.5px", color: "#585c7b" }}>Chọn một phản ánh để xem chi tiết.</div>
          )}

          {detail && (() => {
            const st = feedbackStatus(detail.status);
            return (
              <>
                {/* Status */}
                <div><span style={{ display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span></div>

                {/* Title */}
                <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#272727", lineHeight: 1.3 }}>{detail.title}</h2>

                {/* Author */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0, background: "linear-gradient(180deg, #d7e0ee 0%, #c0cadb 100%)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#272727" }}>{detail.submitter?.name ?? "—"}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "3px" }}>
                      <span style={{ fontSize: "11.5px", color: "#585c7b" }}>{detail.code}</span>
                      <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#b4b7c9" }} />
                      <span style={{ fontSize: "11.5px", color: "#585c7b" }}>{formatTime(detail.metadata.createdAt)}</span>
                      <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#b4b7c9" }} />
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEiIGhlaWdodD0iMTEiIHZpZXdCb3g9IjAgMCAxMSAxMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOC43MDggMS44MzNIMi4yOTJDMS43ODUgMS44MzMgMS4zNzUgMi4yNDMgMS4zNzUgMi43NVY5LjE2N0MxLjM3NSA5LjY3MyAxLjc4NSAxMC4wODMgMi4yOTIgMTAuMDgzSDguNzA4QzkuMjE1IDEwLjA4MyA5LjYyNSA5LjY3MyA5LjYyNSA5LjE2N1YyLjc1QzkuNjI1IDIuMjQzIDkuMjE1IDEuODMzIDguNzA4IDEuODMzWiIgc3Ryb2tlPSIjNTg1QzdCIiBzdHJva2Utd2lkdGg9IjAuOTE3IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNy4zMzMgMC45MTdWMi43NSIgc3Ryb2tlPSIjNTg1QzdCIiBzdHJva2Utd2lkdGg9IjAuOTE3IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMy42NjcgMC45MTdWMi43NSIgc3Ryb2tlPSIjNTg1QzdCIiBzdHJva2Utd2lkdGg9IjAuOTE3IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMS4zNzUgNC41ODNIOS42MjUiIHN0cm9rZT0iIzU4NUM3QiIgc3Ryb2tlLXdpZHRoPSIwLjkxNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="" width={11} height={11} />
                        <span style={{ fontSize: "11.5px", color: "#585c7b" }}>{formatDate(detail.metadata.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {detail.description && (
                  <p style={{ fontSize: "14px", color: "#3e4265", lineHeight: 1.65 }}>{detail.description}</p>
                )}

                {/* Attachments */}
                {detail.images.length > 0 && (
                  <>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#272727" }}>Hình ảnh đính kèm ({detail.images.length})</div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {detail.images.slice(0, 3).map((img, i) => {
                        const isLast = i === 2 && detail.images.length > 3;
                        if (isLast) {
                          return (
                            <div key={i} style={{ flex: 1, aspectRatio: "1/1", minWidth: 0, borderRadius: "12px", position: "relative", overflow: "hidden" }}>
                              <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>+{detail.images.length - 3}</span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <img key={i} src={img.url} alt="" style={{ flex: 1, aspectRatio: "1/1", minWidth: 0, borderRadius: "12px", objectFit: "cover" }} />
                        );
                      })}
                    </div>
                  </>
                )}

                {/* History */}
                {detail.history.length > 0 && (
                  <>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#272727" }}>Lịch sử xử lý</div>
                    <div>
                      {detail.history.map((step, i) => {
                        const last = i === detail.history.length - 1;
                        const hasLine = !last;
                        if (step.completed) {
                          const stStyle = feedbackStatus(step.status);
                          return (
                            <div key={step.id} style={{ position: "relative", paddingLeft: "36px", paddingBottom: last ? 0 : "22px", display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ position: "absolute", left: 0, top: 0, width: "24px", height: "24px", borderRadius: "12px", border: `2px solid ${stStyle.dot}`, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgM0w0LjUgOC41TDIgNiIgc3Ryb2tlPSIjMUNCRjZBIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="" width={12} height={12} />
                              </div>
                              {hasLine && <div style={{ position: "absolute", left: "11px", top: "26px", bottom: "-6px", width: "2px", background: "#e2e5f1" }} />}
                              <div style={{ display: "flex", alignItems: "baseline", gap: "20px" }}>
                                <div style={{ flex: 1, fontSize: "13.5px", fontWeight: 600, color: "#272727" }}>{step.label}</div>
                                <div style={{ fontSize: "11.5px", color: "#585c7b", whiteSpace: "nowrap" }}>{formatDateTime(step.time)}</div>
                              </div>
                              {step.description && <div style={{ fontSize: "13px", color: "#3e4265", lineHeight: 1.55 }}>{step.description}</div>}
                            </div>
                          );
                        }
                        // pending step (gray)
                        return (
                          <div key={step.id} style={{ position: "relative", paddingLeft: "36px", paddingBottom: last ? 0 : "22px", display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ position: "absolute", left: 0, top: 0, width: "24px", height: "24px", borderRadius: "12px", border: "2px solid #d4d7e5", background: "#f7f8fc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                              <div style={{ width: "8px", height: "8px", background: "#d4d7e5", borderRadius: "4px" }} />
                            </div>
                            {hasLine && <div style={{ position: "absolute", left: "11px", top: "26px", bottom: "-6px", width: "2px", background: "#e2e5f1" }} />}
                            <div style={{ display: "flex", alignItems: "baseline", gap: "20px" }}>
                              <div style={{ flex: 1, fontSize: "13.5px", fontWeight: 600, color: "#585c7b" }}>{step.label}</div>
                              <div style={{ fontSize: "11.5px", color: "#585c7b", whiteSpace: "nowrap" }}>—</div>
                            </div>
                            {step.description && <div style={{ fontSize: "13px", color: "#3e4265", lineHeight: 1.55 }}>{step.description}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Comment */}
                <div style={{ borderTop: "1px solid #eff2fc", paddingTop: "19px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ flex: 1, height: "44px", border: "1px solid #d4d7e5", borderRadius: "10px", background: "#ffffff", display: "flex", alignItems: "center", padding: "0 15px", minWidth: 0 }}>
                    <input placeholder="Viết bình luận..." style={{ flex: 1, border: 0, outline: 0, fontSize: "16px", background: "transparent", color: "#222", minWidth: 0 }} />
                  </div>
                  <button style={{ width: "44px", height: "44px", background: "#4137f9", borderRadius: "10px", border: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMS41IDE1Ljc1TDE3LjI1IDlMMS41IDIuMjVWNy41TDEyLjc1IDlMMS41IDEwLjVWMTUuNzVaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==" alt="" width={18} height={18} />
                  </button>
                </div>
              </>
            );
          })()}
        </div>

        {/* RIGHT — Rail */}
        <div style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e2e5f1", borderRadius: "20px", padding: "17px 19px" }}>
            <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#272727", marginBottom: "14px" }}>Thông tin phản ánh</div>
            {detail ? (() => {
              const pr = feedbackPriority(detail.metadata.priority);
              const st = feedbackStatus(detail.status);
              const rows: { label: string; value: string; dot?: string }[] = [
                { label: "Danh mục", value: detail.metadata.category, dot: st.dot },
                { label: "Ưu tiên", value: pr.label, dot: pr.color },
                { label: "Địa điểm", value: detail.metadata.location ?? "—" },
                { label: "Ngày tạo", value: formatDateTime(detail.metadata.createdAt) },
                { label: "Cập nhật cuối", value: formatDateTime(detail.metadata.updatedAt) },
              ];
              return rows.map((row, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: i > 0 ? "14px" : 0 }}>
                  <div style={{ fontSize: "11.5px", color: "#585c7b" }}>{row.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#272727" }}>
                    {row.value}
                    {row.dot && <div style={{ width: "8px", height: "8px", borderRadius: "4px", background: row.dot, flexShrink: 0 }} />}
                  </div>
                </div>
              ));
            })() : (
              <div style={{ fontSize: "13px", color: "#585c7b" }}>—</div>
            )}
          </div>

          <div style={{ background: "#ffffff", border: "1px solid #e2e5f1", borderRadius: "20px", padding: "17px 19px" }}>
            <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#272727", marginBottom: "14px" }}>Thao tác nhanh</div>
            {[
              { icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgMkM1LjU4IDIgMiA1LjU4IDIgMTBDMiAxNC40MiA1LjU4IDE4IDEwIDE4QzE0LjQyIDE4IDE4IDE0LjQyIDE4IDEwQzE4IDUuNTggMTQuNDIgMiAxMCAyWk0xMCAxMy41QzkuMTcgMTMuNSA4LjUgMTIuODMgOC41IDEyQzguNSAxMS4xNyA5LjE3IDEwLjUgMTAgMTAuNUMxMC44MyAxMC41IDExLjUgMTEuMTcgMTEuNSAxMkMxMS41IDEyLjgzIDEwLjgzIDEzLjUgMTAgMTMuNVpNMTEuNSA5SDguNVY2LjVIMTEuNVY5WiIgZmlsbD0iIzQxMzdGOSIvPjwvc3ZnPg==", label: "Cập nhật thông tin", danger: false },
              { icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgMkM1LjU4IDIgMiA1LjU4IDIgMTBDMiAxNC40MiA1LjU4IDE4IDEwIDE4QzE0LjQyIDE4IDE4IDE0LjQyIDE4IDEwQzE4IDUuNTggMTQuNDIgMiAxMCAyWiIgc3Ryb2tlPSIjNDEzN0Y5IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik03IDEwTDkuNSAxMi41TDE0IDcuNSIgc3Ryb2tlPSIjNDEzN0Y5IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+", label: "Bổ sung hình ảnh", danger: false },
              { icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOSAxNUgxNS43NU0xMi4zNzUgMi42MjVDMTIuNjczIDIuMzI3IDEzLjA3OCAyLjE1OSAxMy41IDIuMTU5QzEzLjcwOSAyLjE1OSAxMy45MTYgMi4yIDE0LjEwOSAyLjI4QzE0LjMwMiAyLjM2IDE0LjQ3NyAyLjQ3NyAxNC42MjUgMi42MjVDMTQuNzczIDIuNzczIDE0Ljg5IDIuOTQ4IDE0Ljk3IDMuMTQxQzE1LjA1IDMuMzM0IDE1LjA5MSAzLjU0MSAxNS4wOTEgMy43NUMxNS4wOTEgMy45NTkgMTUuMDUgNC4xNjYgMTQuOTcgNC4zNTlDMTQuODkgNC41NTIgMTQuNzczIDQuNzI3IDE0LjYyNSA0Ljg3NUw1LjI1IDE0LjI1TDIuMjUgMTVMMyAxMkwxMi4zNzUgMi42MjVaIiBzdHJva2U9IiM1ODVDN0IiIHN0cm9rZS13aWR0aD0iMS4zNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+", label: "Hủy phản ánh", danger: true },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", cursor: "pointer", borderTop: i > 0 ? "1px solid #eff2fc" : "none" }}>
                <img src={item.icon} alt="" width={18} height={18} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "13px", color: item.danger ? "#f5222d" : "#272727", minWidth: 0 }}>{item.label}</span>
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNS4yNSAxMC41TDguNzUgN0w1LjI1IDMuNSIgc3Ryb2tlPSIjNTg1QzdCIiBzdHJva2Utd2lkdGg9IjEuMTY3IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="" width={14} height={14} style={{ flexShrink: 0, opacity: 0.5 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Banner */}
      <div style={{ position: "relative", overflow: "hidden", border: "1px solid #d3c5fd", borderRadius: "10px", padding: "23px 24px 23px 220px", flexShrink: 0 }}>
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEyMiIgaGVpZ2h0PSIxMjAiIHZpZXdCb3g9IjAgMCAxMTIyIDEyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTEyMiIgaGVpZ2h0PSIxMjAiIHJ4PSIxNiIgZmlsbD0iIzFhMGE1ZSIvPjxjaXJjbGUgY3g9IjgwIiBjeT0iNjAiIHI9IjM1IiBmaWxsPSIjNDEzN0Y5IiBvcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjYwIiByPSIyMCIgZmlsbD0iIzQxMzdGOSIgb3BhY2l0eT0iMC41Ii8+PHRleHQgeD0iMTYwIiB5PSI0NSIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiPkFJIEFzc2lzdGFudCAtIE5oYSBDaHVuZzwvdGV4dD48dGV4dCB4PSIxNjAiIHk9Ijc1IiBmb250LXNpemU9IjEzIiBmaWxsPSIjY2NiYmZmIj5Ib2kgYmF0IGN1IGRpZXUgZ2kgdmUgdG9hIG5oYSBjdWEgYmFuPC90ZXh0Pjwvc3ZnPg==" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#4137f9", lineHeight: "36px", marginBottom: "4px" }}>Hỏi AI trợ lý của cư dân</div>
              <div style={{ fontSize: "18px", fontWeight: 500, color: "#272727", lineHeight: "26px" }}>Tôi có thể giúp gì cho bạn hôm nay?</div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["Quy định về việc nuôi thú cưng?", "Hướng dẫn đăng ký xe", "Tìm tài liệu nội quy"].map((chip) => (
                <span key={chip} style={{ background: "#fff", borderRadius: "12px", padding: "8px 10px", fontSize: "14px", fontWeight: 500, color: "#272727", whiteSpace: "nowrap", cursor: "pointer", lineHeight: "22px" }}>{chip}</span>
              ))}
            </div>
          </div>
          <button onClick={() => router.push("/ai-assistant")} style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#4137f9", color: "#fff", padding: "8px 10px", borderRadius: "12px", border: 0, fontSize: "14px", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, lineHeight: "22px" }}>
            Chat với AI
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQgMTBDMTQgMTAuMzU0IDEzLjg2IDEwLjY5MyAxMy42MSAxMC45NDNDMTMuMzU5IDExLjE5MyAxMy4wMiAxMS4zMzMgMTIuNjY3IDExLjMzM0g0LjY2N0wyIDE0VjMuMzMzQzIgMi45OCAyLjE0IDIuNjQxIDIuMzkgMi4zOTFDMi42NDEgMi4xNCAyLjk4IDIgMy4zMzMgMkgxMi42NjdDMTMuMDIgMiAxMy4zNTkgMi4xNCAxMy42MSAyLjM5MUMxMy44NiAyLjY0MSAxNCAyLjk4IDE0IDMuMzMzVjEwWiIgc3Ryb2tlPSIjMjcyNzI3IiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="" width={18} height={18} />
          </button>
        </div>
      </div>

      {showCreate && (
        <CreateFeedbackModal
          onClose={() => setShowCreate(false)}
          onCreated={(created) => {
            setShowCreate(false);
            setActiveTab("all");
            setPage(1);
            refetchList();
            refetchSummary();
            setSelectedId(created.id);
            toast.success("Đã gửi phản ánh thành công");
          }}
        />
      )}
    </div>
  );
}

// ── Create modal ───────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  "Vệ sinh - Môi trường",
  "Thang máy",
  "Kỹ thuật - Hạ tầng",
  "An ninh",
  "Tiện ích - Dịch vụ",
];
const PRIORITY_OPTIONS = [
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "urgent", label: "Khẩn cấp" },
];

interface UploadResult { url: string; name: string; sizeBytes: number }

function CreateFeedbackModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (created: { id: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Validate images up front: must be images and ≤5MB each.
  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const valid = picked.filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast.warning(`"${f.name}" không phải tệp ảnh`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.warning(`"${f.name}" vượt quá 5MB`);
        return false;
      }
      return true;
    });
    setFiles(valid);
  };

  const { run, loading, error } = useAction(async () => {
    const imageUrls: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const up = await apiPost<UploadResult>("/uploads?folder=feedback", fd);
      if (up?.url) imageUrls.push(up.url);
    }
    const created = await apiPost<{ id: string }>("/feedbacks", {
      title,
      category,
      description: description || undefined,
      priority,
      location: location || undefined,
      imageUrls: imageUrls.length ? imageUrls : undefined,
    });
    return created;
  });

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", border: "1px solid #d4d7e5", borderRadius: "10px",
    padding: "10px 14px", fontSize: "14px", color: "#272727", background: "#ffffff", outline: "none",
  };
  const labelStyle: React.CSSProperties = { fontSize: "12px", fontWeight: 600, color: "#585c7b", marginBottom: "6px", display: "block" };

  const onSubmit = async () => {
    if (!title.trim()) {
      toast.warning("Vui lòng nhập tiêu đề phản ánh");
      return;
    }
    const created = await run();
    if (created) onCreated(created);
    else toast.error("Gửi phản ánh thất bại, vui lòng thử lại");
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "520px", maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", background: "#ffffff", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 10px 40px rgba(0,0,0,.2)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#272727" }}>Tạo phản ánh mới</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #d4d7e5", background: "#fff", cursor: "pointer", fontSize: "16px", color: "#585c7b" }}>×</button>
        </div>

        <div>
          <label style={labelStyle}>Tiêu đề</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề phản ánh..." style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Danh mục</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Mô tả</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Mô tả chi tiết..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
        </div>

        <div>
          <label style={labelStyle}>Mức độ ưu tiên</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
            {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Địa điểm</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="VD: Tầng hầm B2 - Gần cột B2-07" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Hình ảnh đính kèm</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onPickFiles}
            style={{ fontSize: "13px", color: "#3e4265" }}
          />
          {files.length > 0 && (
            <div style={{ fontSize: "12px", color: "#585c7b", marginTop: "6px" }}>{files.length} tệp đã chọn</div>
          )}
        </div>

        {error && <div style={{ fontSize: "13px", color: "#ef4444" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
          <button onClick={onClose} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #d4d7e5", background: "#fff", fontSize: "14px", fontWeight: 500, color: "#272727", cursor: "pointer" }}>Hủy</button>
          <button
            onClick={onSubmit}
            disabled={loading || !title.trim()}
            style={{ padding: "10px 18px", borderRadius: "10px", border: 0, background: "#4137f9", fontSize: "14px", fontWeight: 500, color: "#fff", cursor: loading || !title.trim() ? "default" : "pointer", opacity: loading || !title.trim() ? 0.6 : 1 }}
          >
            {loading ? "Đang gửi..." : "Tạo phản ánh"}
          </button>
        </div>
      </div>
    </div>
  );
}
