"use client";

import { useEffect } from "react";

/**
 * Shared modal shell used by the resident detail/popup views.
 * Matches the inline-styled overlay pattern first introduced by the
 * "Tạo phản ánh" modal so the look stays consistent across pages.
 */
export function Modal({
  onClose,
  children,
  width = 560,
  title,
  subtitle,
  headerAccent,
}: {
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  title?: string;
  subtitle?: string;
  /** Optional coloured strip / badge area rendered next to the title. */
  headerAccent?: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: `${width}px`,
          maxWidth: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 10px 40px rgba(0,0,0,.2)",
        }}
        className="nc-scroll"
      >
        <button
          onClick={onClose}
          aria-label="Đóng"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 3,
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: "1px solid #d4d7e5",
            background: "#fff",
            cursor: "pointer",
            fontSize: "16px",
            color: "#585c7b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {title && (
          <div style={{ padding: "24px 24px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", paddingRight: "40px" }}>
              <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#272727", lineHeight: "26px" }}>{title}</h2>
              {headerAccent}
            </div>
            {subtitle && (
              <p style={{ fontSize: "13px", color: "#585c7b", marginTop: "4px" }}>{subtitle}</p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

/** A label / value row used by the detail modals. */
export function ModalField({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        padding: "11px 0",
        borderBottom: "1px solid #f0f0f5",
      }}
    >
      <span style={{ fontSize: "13px", color: "#585c7b", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "13.5px", fontWeight: 600, color: valueColor ?? "#272727", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

/** Small coloured status/category pill reused inside detail modals. */
export function ModalBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 700,
        background: bg,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
