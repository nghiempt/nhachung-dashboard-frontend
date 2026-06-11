"use client";

/**
 * Reusable shimmer skeletons + spinner used while data is loading.
 * Dependency-free (inline styles + a single shared keyframes block) so it can
 * drop into any page regardless of its styling approach.
 */

import type { CSSProperties } from "react";

const SHIMMER_CSS = `
@keyframes nc-skeleton-shimmer {
  0%   { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}
@keyframes nc-spin { to { transform: rotate(360deg); } }`;

let injected = false;
function useShimmerStyles() {
  // Inject once per document. Rendering a <style> per skeleton is wasteful, so
  // we mount it from the first instance via a module-level guard.
  if (typeof document !== "undefined" && !injected) {
    injected = true;
    const el = document.createElement("style");
    el.setAttribute("data-nc-skeleton", "");
    el.textContent = SHIMMER_CSS;
    document.head.appendChild(el);
  }
}

const baseSkeleton: CSSProperties = {
  display: "block",
  background:
    "linear-gradient(90deg, #eef0f5 25%, #f6f7fa 37%, #eef0f5 63%)",
  backgroundSize: "936px 100%",
  animation: "nc-skeleton-shimmer 1.4s ease-in-out infinite",
};

export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
}) {
  useShimmerStyles();
  return <span style={{ ...baseSkeleton, width, height, borderRadius: radius, ...style }} />;
}

/** A few stacked text lines; last line is shorter for a natural look. */
export function SkeletonText({
  lines = 3,
  gap = 8,
  lineHeight = 12,
}: {
  lines?: number;
  gap?: number;
  lineHeight?: number;
}) {
  return (
    <span style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={lineHeight} width={i === lines - 1 ? "60%" : "100%"} />
      ))}
    </span>
  );
}

/** Generic card placeholder. */
export function SkeletonCard({ height = 120, style }: { height?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e5f1",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        ...style,
      }}
    >
      <Skeleton width={40} height={40} radius={10} />
      <Skeleton height={14} width="70%" />
      <SkeletonText lines={2} />
      <div style={{ flex: 1, minHeight: Math.max(0, height - 120) }} />
    </div>
  );
}

/** Placeholder rows for a table; renders <tr>/<td> so it can live inside <tbody>. */
export function SkeletonRows({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} style={{ borderBottom: "1px solid #eff2fc" }}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} style={{ padding: "16px 12px" }}>
              <Skeleton height={12} width={c === 0 ? "80%" : "55%"} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Inline spinner. `size` in px; inherits color via `currentColor`. */
export function LoadingSpinner({
  size = 18,
  stroke = 2.5,
  color = "currentColor",
}: {
  size?: number;
  stroke?: number;
  color?: string;
}) {
  useShimmerStyles();
  return (
    <span
      aria-label="Đang tải"
      role="status"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `${stroke}px solid ${color}`,
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "nc-spin 0.7s linear infinite",
        verticalAlign: "middle",
      }}
    />
  );
}

/** Centered full-area loading state with optional label. */
export function LoadingState({ label = "Đang tải...", minHeight = 240 }: { label?: string; minHeight?: number | string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        minHeight,
        color: "#585c7b",
      }}
    >
      <span style={{ color: "#4137f9" }}>
        <LoadingSpinner size={28} stroke={3} />
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</span>
    </div>
  );
}
