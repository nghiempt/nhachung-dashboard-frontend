// Client-side CSV export so the "Xuất báo cáo" buttons download the data
// the resident is currently looking at (no backend export endpoint needed).

function escapeCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Build a CSV from a header row + data rows and trigger a download.
 * Prepends a UTF-8 BOM so Excel renders Vietnamese characters correctly.
 */
export function exportCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]): void {
  if (typeof window === "undefined") return;
  const lines = [headers, ...rows].map((r) => r.map(escapeCell).join(","));
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
