"use client";

import { useApiData } from "./hooks";

/** Pagination envelope returned by the admin list endpoints. */
export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface Paginated<T> {
  items: T[];
  meta: PaginatedMeta;
}

/** Serialise a params object into a query string, skipping empty values. */
export function buildQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/**
 * Fetch a paginated admin list. Rebuilds (and refetches) whenever the params
 * change. Returns the parsed envelope plus the flat items/meta for convenience.
 */
export function useAdminList<T>(
  base: string,
  params: Record<string, unknown> = {},
) {
  const path = `${base}${buildQuery(params)}`;
  const { data, loading, error, refetch } = useApiData<Paginated<T>>(path);
  return {
    items: data?.items ?? [],
    meta: data?.meta ?? null,
    loading,
    error,
    refetch,
  };
}

// ── Shared inline styles (match the resident dashboard modals) ──
export const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "42px",
  border: "1px solid #d4d7e5",
  borderRadius: "10px",
  padding: "0 13px",
  fontSize: "14px",
  color: "#272727",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
};

export const labelStyle: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 600,
  color: "#3e4265",
  marginBottom: "6px",
  display: "block",
};

export const btnPrimary: React.CSSProperties = {
  padding: "11px 18px",
  background: "#4137f9",
  border: 0,
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: 500,
  color: "#fff",
  cursor: "pointer",
};

export const btnGhost: React.CSSProperties = {
  padding: "11px 18px",
  background: "#fff",
  border: "1px solid #d4d7e5",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: 500,
  color: "#3e4265",
  cursor: "pointer",
};
