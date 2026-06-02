"use client";

import { useMemo, useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPost } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/format";
import { docColor, docTypeLabel, DOC_CATEGORY_CLASS } from "@/lib/ui-maps";
import { Modal } from "@/components/ui/Modal";

interface DocCategory {
  id: string;
  name: string;
  iconUrl: string | null;
  documentCount: number;
}

interface DocItem {
  id: string;
  name: string;
  fileType: string;
  category: string;
  categoryId: string;
  sizeLabel: string;
  viewCount: number;
  updatedDate: string;
  url: string;
}

interface DocMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DocList {
  items: DocItem[];
  meta: DocMeta;
}

const PAGE_LIMIT = 8;

const catStyles: Record<string, React.CSSProperties> = {
  purple: { background: "#efeaff", color: "#5a3ad9" },
  green: { background: "#e3fbed", color: "#1c9d5f" },
  orange: { background: "#fff0d9", color: "#c8761b" },
  blue: { background: "#def5fa", color: "#1287a5" },
  gray: { background: "#eef0f7", color: "#3e4265" },
};

export default function KhoTaiLieuPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showRequest, setShowRequest] = useState(false);

  const { data: categories } = useApiData<DocCategory[]>("/documents/categories");

  const listPath = useMemo(() => {
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", String(PAGE_LIMIT));
    return `/documents?${params.toString()}`;
  }, [categoryId, search, page]);

  const { data: list, loading } = useApiData<DocList>(listPath, [listPath]);

  const items = list?.items ?? [];
  const meta = list?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;
  const currentPage = meta?.page ?? page;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(currentPage * PAGE_LIMIT, total);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleSelectCategory = (id: string) => {
    setPage(1);
    setCategoryId((prev) => (prev === id ? null : id));
  };

  const handleOpenDoc = async (doc: DocItem) => {
    try {
      await apiPost(`/documents/${doc.id}/view`, {});
    } catch {
      /* ignore view-count errors, still open the doc */
    }
    if (doc.url) window.open(doc.url, "_blank", "noopener,noreferrer");
  };

  const pageNumbers = useMemo(() => {
    const max = Math.min(5, totalPages);
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#272727", lineHeight: "36px" }}>
            Kho tài liệu
          </h1>
          <p style={{ fontSize: "16px", color: "#3e4265", marginTop: "6px", lineHeight: "24px", fontWeight: 500 }}>
            Lưu trữ và chia sẻ các tài liệu, quy định, biên bản và biểu mẫu của tòa nhà
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0, paddingTop: "4px" }}>
          <button onClick={() => setShowRequest(true)} style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "11px 19px", background: "#4137f9",
            border: 0, borderRadius: "10px",
            fontSize: "14px", fontWeight: 500, color: "#fff",
            cursor: "pointer", whiteSpace: "nowrap", lineHeight: "22px",
          }}>
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0IDEwQzE0IDEwLjM1MzYgMTMuODU5NSAxMC42OTI4IDEzLjYwOTUgMTAuOTQyOEMxMy4zNTk0IDExLjE5MjkgMTMuMDIwMyAxMS4zMzMzIDEyLjY2NjcgMTEuMzMzM0g0LjY2NjY3TDIgMTRWMy4zMzMzM0MyIDIuOTc5NzEgMi4xNDA0OCAyLjY0MDU3IDIuMzkwNTIgMi4zOTA1MkMyLjY0MDU3IDIuMTQwNDggMi45Nzk3MSAyIDMuMzMzMzMgMkgxMi42NjY3QzEzLjAyMDMgMiAxMy4zNTk0IDIuMTQwNDggMTMuNjA5NSAyLjM5MDUyQzEzLjg1OTUgMi42NDA1NyAxNCAyLjk3OTcxIDE0IDMuMzMzMzNWMTBaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==" alt="" width={16} height={16} />
            Yêu cầu tài liệu
          </button>
        </div>
      </div>

      {/* Search row */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: "10px",
          border: "1px solid #d4d7e5", borderRadius: "10px",
          padding: "0 15px", height: "44px", background: "#ffffff",
        }}>
          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcuMzMzNjYgMTIuMDAwM0M5LjkxMDk5IDEyLjAwMDMgMTIuMDAwMyA5LjkxMDk5IDEyLjAwMDMgNy4zMzM2NkMxMi4wMDAzIDQuNzU2MzMgOS45MTA5OSAyLjY2Njk5IDcuMzMzNjYgMi42NjY5OUM0Ljc1NjMzIDIuNjY2OTkgMi42NjY5OSA0Ljc1NjMzIDIuNjY2OTkgNy4zMzM2NkMyLjY2Njk5IDkuOTEwOTkgNC43NTYzMyAxMi4wMDAzIDcuMzMzNjYgMTIuMDAwM1oiIHN0cm9rZT0iI0I0QjdDOSIgc3Ryb2tlLXdpZHRoPSIxLjMzMzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTEzLjMzMjkgMTMuMzMyOUwxMS4wOTk2IDExLjA5OTYiIHN0cm9rZT0iI0I0QjdDOSIgc3Ryb2tlLXdpZHRoPSIxLjMzMzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==" alt="" width={16} height={16} style={{ flex: "0 0 16px" }} />
          <input
            placeholder="Tìm kiếm tài liệu..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            style={{
              flex: 1, border: 0, outline: 0,
              fontSize: "16px", color: "#222222", background: "transparent",
            }}
          />
        </div>
        <button
          onClick={handleSearch}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "0 19px", height: "44px", background: "#ffffff",
            border: "1px solid #d4d7e5", borderRadius: "10px",
            fontSize: "13.5px", fontWeight: 400, color: "#272727",
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}>
          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAxNSAxNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzU4NTk0XzkxMTUpIj4KPHBhdGggZD0iTTEzLjc1IDEuODc1SDEuMjVMNi4yNSA3Ljc4NzVWMTEuODc1TDguNzUgMTMuMTI1VjcuNzg3NUwxMy43NSAxLjg3NVoiIHN0cm9rZT0iIzI3MjcyNyIgc3Ryb2tlLXdpZHRoPSIxLjI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF81ODU5NF85MTE1Ij4KPHJlY3Qgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=" alt="" width={15} height={15} />
          Tìm kiếm
        </button>
      </div>

      {/* Section: Danh mục */}
      <div style={{
        background: "#ffffff", border: "1px solid #e2e5f1",
        borderRadius: "20px", padding: "23px 25px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#272727", lineHeight: "26px" }}>Danh mục</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
          {(categories ?? []).map((folder) => (
            <div
              key={folder.id}
              onClick={() => handleSelectCategory(folder.id)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "15px",
                border: categoryId === folder.id ? "1px solid #4137f9" : "1px solid #e2e5f1",
                borderRadius: "12px",
                background: "#ffffff", cursor: "pointer",
              }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "#f7f5ff", display: "inline-flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <img src={folder.iconUrl ?? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIuNSA1LjgzMzY2QzIuNSA1LjM5MTYzIDIuNjc1NTkgNC45Njc3MSAyLjk4ODE2IDQuNjU1MTVDMy4zMDA3MiA0LjM0MjU5IDMuNzI0NjQgNC4xNjY5OSA0LjE2NjY3IDQuMTY2OTlINy41TDkuMTY2NjcgNS44MzM2NkgxNS44MzMzQzE2LjI3NTQgNS44MzM2NiAxNi42OTkzIDYuMDA5MjUgMTcuMDExOCA2LjMyMTgxQzE3LjMyNDQgNi42MzQzNyAxNy41IDcuMDU4MyAxNy41IDcuNTAwMzNWMTUuMDAwM0MxNy41IDE1LjQ0MjQgMTcuMzI0NCAxNS44NjYzIDE3LjAxMTggMTYuMTc4OEMxNi42OTkzIDE2LjQ5MTQgMTYuMjc1NCAxNi42NjcgMTUuODMzMyAxNi42NjdINC4xNjY2N0MzLjcyNDY0IDE2LjY2NyAzLjMwMDcyIDE2LjQ5MTQgMi45ODgxNiAxNi4xNzg4QzIuNjc1NTkgMTUuODY2MyAyLjUgMTUuNDQyNCAyLjUgMTUuMDAwM1Y1LjgzMzY2WiIgc3Ryb2tlPSIjNDEzN0Y5IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo="} alt="" width={20} height={20} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                <div style={{ fontSize: "13.5px", color: "#272727", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 400 }}>
                  {folder.name}
                </div>
                <div style={{ fontSize: "11.5px", color: "#585c7b" }}>{folder.documentCount} tài liệu</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Tài liệu mới nhất */}
      <div style={{
        background: "#ffffff", border: "1px solid #e2e5f1",
        borderRadius: "20px", padding: "23px 25px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#272727", lineHeight: "26px" }}>Tài liệu mới nhất</span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eff2fc" }}>
              <th style={{ fontSize: "12.5px", fontWeight: 400, color: "#585c7b", padding: "0 12px 14px", textAlign: "left", whiteSpace: "nowrap", width: "43%" }}>Tên tài liệu</th>
              <th style={{ fontSize: "12.5px", fontWeight: 400, color: "#585c7b", padding: "0 12px 14px", textAlign: "left", whiteSpace: "nowrap", width: "17%" }}>Danh mục</th>
              <th style={{ fontSize: "12.5px", fontWeight: 400, color: "#585c7b", padding: "0 12px 14px", textAlign: "left", whiteSpace: "nowrap", width: "10%" }}>Cập nhật</th>
              <th style={{ fontSize: "12.5px", fontWeight: 400, color: "#585c7b", padding: "0 12px 14px", textAlign: "center", whiteSpace: "nowrap", width: "10%" }}>Kích thước</th>
              <th style={{ fontSize: "12.5px", fontWeight: 400, color: "#585c7b", padding: "0 12px 14px", textAlign: "center", whiteSpace: "nowrap", width: "10%" }}>Lượt xem</th>
              <th style={{ fontSize: "12.5px", fontWeight: 400, color: "#585c7b", padding: "0 12px 14px", textAlign: "center", whiteSpace: "nowrap", width: "10%" }}>Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "24px 12px", textAlign: "center", fontSize: "13.5px", color: "#585c7b" }}>Đang tải...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "24px 12px", textAlign: "center", fontSize: "13.5px", color: "#585c7b" }}>Không có tài liệu</td>
              </tr>
            ) : items.map((row, i) => {
              const catClass = DOC_CATEGORY_CLASS[row.category] ?? "gray";
              const badgeTxt = docTypeLabel(row.fileType).slice(0, 3);
              return (
                <tr key={row.id} style={{ borderBottom: i < items.length - 1 ? "1px solid #eff2fc" : "none" }}>
                  <td style={{ padding: "16px 12px 17px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "32px", height: "38px", borderRadius: "6px",
                        background: docColor(row.fileType),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, position: "relative",
                      }}>
                        <div style={{
                          position: "absolute", top: 0, right: 0,
                          width: "9px", height: "9px",
                          background: "rgba(255,255,255,.35)",
                          borderBottomLeftRadius: "3px",
                        }} />
                        <span style={{
                          fontSize: "9px", fontWeight: 400, color: "#fff",
                          letterSpacing: ".36px", textAlign: "center", lineHeight: "normal",
                          position: "relative", zIndex: 1,
                        }}>{badgeTxt}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                        <div style={{ fontSize: "13.5px", color: "#272727", lineHeight: "normal" }}>{row.name}</div>
                        <div style={{ fontSize: "11.5px", color: "#585c7b", textTransform: "uppercase", letterSpacing: ".46px" }}>{docTypeLabel(row.fileType)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0 12px", verticalAlign: "middle" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "5px 10px", borderRadius: "999px",
                      fontSize: "11.5px", whiteSpace: "nowrap", lineHeight: "normal",
                      ...catStyles[catClass],
                    }}>{row.category}</span>
                  </td>
                  <td style={{ padding: "0 12px", verticalAlign: "middle" }}>
                    <span style={{ fontSize: "13.5px", color: "#3e4265", whiteSpace: "nowrap" }}>{formatDate(row.updatedDate)}</span>
                  </td>
                  <td style={{ padding: "0 12px", verticalAlign: "middle", textAlign: "center" }}>
                    <span style={{ fontSize: "13.5px", color: "#3e4265", whiteSpace: "nowrap" }}>{row.sizeLabel}</span>
                  </td>
                  <td style={{ padding: "0 12px", verticalAlign: "middle", textAlign: "center" }}>
                    <span style={{ fontSize: "13.5px", color: "#3e4265", whiteSpace: "nowrap" }}>{formatNumber(row.viewCount)}</span>
                  </td>
                  <td style={{ padding: "0 12px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "19.5px 0" }}>
                      <button
                        onClick={() => handleOpenDoc(row)}
                        style={{
                          width: "32px", height: "32px", borderRadius: "8px",
                          background: "#f7f8fc", border: 0,
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", flexShrink: 0,
                        }} title="Xem">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAxNSAxNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzU4NTk0XzkyMjIpIj4KPHBhdGggZD0iTTAuNjI1IDcuNUMwLjYyNSA3LjUgMy4xMjUgMi41IDcuNSAyLjVDMTEuODc1IDIuNSAxNC4zNzUgNy41IDE0LjM3NSA3LjVDMTQuMzc1IDcuNSAxMS44NzUgMTIuNSA3LjUgMTIuNUMzLjEyNSAxMi41IDAuNjI1IDcuNSAwLjYyNSA3LjVaIiBzdHJva2U9IiMzRTQyNjUiIHN0cm9rZS13aWR0aD0iMS4yNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik03LjUgOS4zNzVDOC41MzU1MyA5LjM3NSA5LjM3NSA4LjUzNTUzIDkuMzc1IDcuNUM5LjM3NSA2LjQ2NDQ3IDguNTM1NTMgNS42MjUgNy41IDUuNjI1QzYuNDY0NDcgNS42MjUgNS42MjUgNi40NjQ0NyA1LjYyNSA3LjVDNS42MjUgOC41MzU1MyA2LjQ2NDQ3IDkuMzc1IDcuNSA5LjM3NVoiIHN0cm9rZT0iIzNFNDI2NSIgc3Ryb2tlLXdpZHRoPSIxLjI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF81ODU5NF85MjIyIj4KPHJlY3Qgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=" alt="Xem" width={15} height={15} />
                      </button>
                      <button
                        onClick={() => handleOpenDoc(row)}
                        style={{
                          width: "32px", height: "32px", borderRadius: "8px",
                          background: "#f7f8fc", border: 0,
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", flexShrink: 0,
                        }} title="Tải xuống">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAxNSAxNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzLjEyNSA5LjM3NVYxMS44NzVDMTMuMTI1IDEyLjIwNjUgMTIuOTkzMyAxMi41MjQ1IDEyLjc1ODkgMTIuNzU4OUMxMi41MjQ1IDEyLjk5MzMgMTIuMjA2NSAxMy4xMjUgMTEuODc1IDEzLjEyNUgzLjEyNUMyLjc5MzQ4IDEzLjEyNSAyLjQ3NTU0IDEyLjk5MzMgMi4yNDExMiAxMi43NTg5QzIuMDA2NyAxMi41MjQ1IDEuODc1IDEyLjIwNjUgMS44NzUgMTEuODc1VjkuMzc1IiBzdHJva2U9IiMzRTQyNjUiIHN0cm9rZS13aWR0aD0iMS4yNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik00LjM3NSA2LjI1TDcuNSA5LjM3NUwxMC42MjUgNi4yNSIgc3Ryb2tlPSIjM0U0MjY1IiBzdHJva2Utd2lkdGg9IjEuMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNNy41IDkuMzc1VjEuODc1IiBzdHJva2U9IiMzRTQyNjUiIHN0cm9rZS13aWR0aD0iMS4yNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=" alt="Tải xuống" width={15} height={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: "18px", marginTop: "8px",
          borderTop: "1px solid #eff2fc",
        }}>
          <span style={{ fontSize: "12.5px", color: "#3e4265" }}>Hiển thị {rangeStart} - {rangeEnd} của {total} tài liệu</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              style={{
                minWidth: "32px", height: "32px", borderRadius: "8px",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "0", fontSize: "13px", color: "#3e4265",
                border: "1px solid #d4d7e5", background: "#ffffff",
                cursor: currentPage <= 1 ? "default" : "pointer",
              }}>
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEiIGhlaWdodD0iMTEiIHZpZXdCb3g9IjAgMCAxMSAxMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYuODc1IDguMjVMNC4xMjUgNS41TDYuODc1IDIuNzUiIHN0cm9rZT0iIzNFNDI2NSIgc3Ryb2tlLXdpZHRoPSIxLjE0NTgzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==" alt="Trang trước" width={11} height={11} />
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{
                  minWidth: "32px", height: "32px", borderRadius: "8px",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  padding: "0 10px", fontSize: "13px",
                  color: n === currentPage ? "#fff" : "#3e4265",
                  border: n === currentPage ? "1px solid #4137f9" : "1px solid #d4d7e5",
                  background: n === currentPage ? "#4137f9" : "#ffffff",
                  cursor: "pointer",
                }}>{n}</button>
            ))}
            {totalPages > 6 && (
              <button style={{
                minWidth: "32px", height: "32px", borderRadius: "8px",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "0 10px", fontSize: "13px", color: "#585c7b",
                border: "none", background: "none", cursor: "default",
              }}>…</button>
            )}
            {totalPages > 5 && (
              <button
                onClick={() => setPage(totalPages)}
                style={{
                  minWidth: "32px", height: "32px", borderRadius: "8px",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  padding: "0 10px", fontSize: "13px",
                  color: totalPages === currentPage ? "#fff" : "#3e4265",
                  border: totalPages === currentPage ? "1px solid #4137f9" : "1px solid #d4d7e5",
                  background: totalPages === currentPage ? "#4137f9" : "#ffffff",
                  cursor: "pointer",
                }}>{totalPages}</button>
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              style={{
                minWidth: "32px", height: "32px", borderRadius: "8px",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "0", fontSize: "13px", color: "#3e4265",
                border: "1px solid #d4d7e5", background: "#ffffff",
                cursor: currentPage >= totalPages ? "default" : "pointer",
              }}>
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEiIGhlaWdodD0iMTEiIHZpZXdCb3g9IjAgMCAxMSAxMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuMTI1IDguMjVMNi44NzUgNS41TDQuMTI1IDIuNzUiIHN0cm9rZT0iIzNFNDI2NSIgc3Ryb2tlLXdpZHRoPSIxLjE0NTgzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==" alt="Trang sau" width={11} height={11} />
            </button>
          </div>
        </div>
      </div>

      {showRequest && <RequestDocumentModal onClose={() => setShowRequest(false)} />}
    </div>
  );
}

// ── Request document popup ─────────────────────────────────────
function RequestDocumentModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [done, setDone] = useState(false);

  const { run, loading, error } = useAction(async () =>
    apiPost("/feedbacks", {
      title: `Yêu cầu tài liệu: ${title}`,
      category: "Yêu cầu tài liệu",
      description: description || undefined,
      priority: "medium",
    }),
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", border: "1px solid #d4d7e5", borderRadius: "10px",
    padding: "10px 14px", fontSize: "14px", color: "#272727", background: "#ffffff", outline: "none",
  };
  const labelStyle: React.CSSProperties = { fontSize: "12px", fontWeight: 600, color: "#585c7b", marginBottom: "6px", display: "block" };

  const onSubmit = async () => {
    if (!title.trim()) return;
    const res = await run();
    if (res) setDone(true);
  };

  return (
    <Modal onClose={onClose} width={500} title="Yêu cầu tài liệu" subtitle="Gửi yêu cầu tới Ban quản trị về tài liệu bạn cần">
      <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {done ? (
          <>
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>✅</div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#272727" }}>Đã gửi yêu cầu</div>
              <div style={{ fontSize: "13px", color: "#585c7b", marginTop: "4px" }}>
                Ban quản trị sẽ phản hồi qua mục Góp ý / Phản ánh.
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "10px 18px", borderRadius: "10px", border: 0, background: "#4137f9", fontSize: "14px", fontWeight: 500, color: "#fff", cursor: "pointer" }}>Đóng</button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label style={labelStyle}>Tên tài liệu cần</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Biên bản họp tháng 5/2026" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Lý do / Ghi chú</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Mô tả thêm về tài liệu bạn cần..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
            </div>
            {error && <div style={{ fontSize: "13px", color: "#ef4444" }}>{error}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={onClose} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #d4d7e5", background: "#fff", fontSize: "14px", fontWeight: 500, color: "#272727", cursor: "pointer" }}>Hủy</button>
              <button onClick={onSubmit} disabled={loading || !title.trim()} style={{ padding: "10px 18px", borderRadius: "10px", border: 0, background: "#4137f9", fontSize: "14px", fontWeight: 500, color: "#fff", cursor: loading || !title.trim() ? "default" : "pointer", opacity: loading || !title.trim() ? 0.6 : 1 }}>
                {loading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
