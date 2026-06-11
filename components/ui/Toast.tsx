"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastKind = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  leaving?: boolean;
}

interface ToastApi {
  show: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let counter = 0;
const AUTO_DISMISS_MS = 3000; // auto-tắt sau 3 giây
const LEAVE_MS = 220; // thời gian animation thoát

/**
 * Lightweight transient toast for success/error/warning feedback across the
 * whole app. Mounted once per layout (dashboard + admin); consumed via
 * {@link useToast}. Toasts auto-dismiss after 3s, can be closed manually, and
 * slide in/out.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  // Two-phase removal so we can play the leave animation before unmounting.
  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, LEAVE_MS);
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = ++counter;
      setItems((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const api: ToastApi = {
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
    warning: (m) => show(m, "warning"),
    info: (m) => show(m, "info"),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport items={items} onClose={dismiss} />
    </ToastContext.Provider>
  );
}

const PALETTE: Record<ToastKind, { bg: string; fg: string; bd: string; icon: React.ReactNode }> = {
  success: { bg: "#ecfdf3", fg: "#157347", bd: "#abefc6", icon: <CheckCircle /> },
  error: { bg: "#fef3f2", fg: "#d92d20", bd: "#fecdca", icon: <XCircle /> },
  warning: { bg: "#fffaeb", fg: "#b54708", bd: "#fedf89", icon: <AlertTriangle /> },
  info: { bg: "#eff4ff", fg: "#2f4fd9", bd: "#c7d4fe", icon: <InfoCircle /> },
};

function ToastViewport({ items, onClose }: { items: ToastItem[]; onClose: (id: number) => void }) {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={{
          position: "fixed",
          top: 18,
          right: 18,
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {items.map((t) => {
          const c = PALETTE[t.kind];
          return (
            <div
              key={t.id}
              role="status"
              aria-live="polite"
              style={{
                pointerEvents: "auto",
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 260,
                maxWidth: 400,
                padding: "12px 14px",
                borderRadius: 12,
                background: c.bg,
                color: c.fg,
                border: `1px solid ${c.bd}`,
                boxShadow: "0 8px 24px rgba(15,18,40,.12)",
                fontSize: 13.5,
                fontWeight: 600,
                animation: `${t.leaving ? "nc-toast-out" : "nc-toast-in"} ${
                  t.leaving ? LEAVE_MS : 240
                }ms cubic-bezier(.21,1.02,.73,1) forwards`,
              }}
            >
              <span style={{ flexShrink: 0, display: "inline-flex", color: c.fg }}>{c.icon}</span>
              <span style={{ flex: 1, lineHeight: 1.45, wordBreak: "break-word" }}>{t.message}</span>
              <button
                onClick={() => onClose(t.id)}
                aria-label="Đóng"
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: "none",
                  background: "transparent",
                  color: c.fg,
                  cursor: "pointer",
                  opacity: 0.7,
                }}
              >
                <CloseIcon />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

const KEYFRAMES = `
@keyframes nc-toast-in {
  from { opacity: 0; transform: translateX(24px) scale(.98); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes nc-toast-out {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to   { opacity: 0; transform: translateX(24px) scale(.98); }
}`;

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fail-safe no-op so a page rendered outside the provider never crashes.
    const noop = () => {};
    return { show: noop, success: noop, error: noop, warning: noop, info: noop };
  }
  return ctx;
}

// ── Inline icons (keep the component dependency-free) ─────────────
function CheckCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function XCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
function AlertTriangle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function InfoCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
