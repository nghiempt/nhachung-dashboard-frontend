"use client";

import type { PaginatedMeta } from "@/lib/admin";

/** Footer with row-count summary + page controls, styled with the mg-* classes. */
export function AdminPagination({
  meta,
  page,
  onPage,
  unit = "mục",
  loading,
}: {
  meta: PaginatedMeta | null;
  page: number;
  onPage: (p: number) => void;
  unit?: string;
  loading?: boolean;
}) {
  if (!meta) return null;
  const { total, limit, totalPages } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Compact page window: 1 … (p-1) p (p+1) … last
  const pages: (number | "…")[] = [];
  const add = (n: number) => pages.push(n);
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) add(i);
  } else {
    add(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
    if (page < totalPages - 2) pages.push("…");
    add(totalPages);
  }

  return (
    <div className="mg-foot">
      <div className="mg-count">
        {loading
          ? "Đang tải..."
          : `Hiển thị ${from} - ${to} của ${total.toLocaleString("vi-VN")} ${unit}`}
      </div>
      <div className="mg-pages">
        <span
          className="mg-pg"
          onClick={() => page > 1 && onPage(page - 1)}
          style={{ cursor: page > 1 ? "pointer" : "default", opacity: page > 1 ? 1 : 0.4 }}
        >
          ‹
        </span>
        {pages.map((p, i) =>
          p === "…" ? (
            <span className="mg-pg" key={`e${i}`}>
              …
            </span>
          ) : (
            <span
              key={p}
              className={`mg-pg${p === page ? " active" : ""}`}
              onClick={() => onPage(p)}
              style={{ cursor: "pointer" }}
            >
              {p}
            </span>
          ),
        )}
        <span
          className="mg-pg"
          onClick={() => page < totalPages && onPage(page + 1)}
          style={{ cursor: page < totalPages ? "pointer" : "default", opacity: page < totalPages ? 1 : 0.4 }}
        >
          ›
        </span>
      </div>
    </div>
  );
}
