"use client";

import { btnGhost, btnPrimary } from "@/lib/admin";

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,18,40,.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 20,
};
const closeBtn: React.CSSProperties = {
  background: "none",
  border: 0,
  cursor: "pointer",
  fontSize: 22,
  color: "#585c7b",
  lineHeight: 1,
};

/** Form modal shell shared by all admin create/edit dialogs. */
export function AdminModal({
  title,
  onClose,
  onSubmit,
  submitting,
  submitLabel = "Lưu",
  width = 540,
  error,
  children,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting?: boolean;
  submitLabel?: string;
  width?: number;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div
      style={overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: `min(${width}px, 100%)`,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 20px 60px rgba(15,18,40,.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#272727" }}>{title}</div>
          <button type="button" onClick={onClose} style={closeBtn} aria-label="Đóng">
            ×
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {children}
          {error && <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 500 }}>{error}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} disabled={submitting} style={btnGhost}>
            Huỷ
          </button>
          <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Đang lưu..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

/** Stat card (mg-stat) with a custom icon path. */
export function StatCard({
  bg,
  color,
  label,
  value,
  children,
}: {
  bg: string;
  color: string;
  label: string;
  value: React.ReactNode;
  /** SVG inner paths; falls back to a generic dot when omitted. */
  children?: React.ReactNode;
}) {
  return (
    <div className="mg-stat">
      <div className="mg-stat-ic" style={{ background: bg }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {children ?? <circle cx="12" cy="12" r="9" />}
        </svg>
      </div>
      <div>
        <div className="mg-stat-val">{value}</div>
        <div className="mg-stat-lbl">{label}</div>
      </div>
    </div>
  );
}
