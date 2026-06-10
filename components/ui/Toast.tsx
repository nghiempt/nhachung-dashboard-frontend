"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  show: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let counter = 0;

/**
 * Lightweight transient toast used by the admin pages for success/error
 * feedback. Mounted once in the admin layout; consumed via {@link useToast}.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = ++counter;
      setItems((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => remove(id), 3200);
    },
    [remove],
  );

  const api: ToastApi = {
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
  };

  const palette: Record<ToastKind, { bg: string; fg: string; bd: string }> = {
    success: { bg: "#ecfdf3", fg: "#157347", bd: "#abefc6" },
    error: { bg: "#fef3f2", fg: "#d92d20", bd: "#fecdca" },
    info: { bg: "#eff4ff", fg: "#2f4fd9", bd: "#c7d4fe" },
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
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
          const c = palette[t.kind];
          return (
            <div
              key={t.id}
              onClick={() => remove(t.id)}
              style={{
                pointerEvents: "auto",
                cursor: "pointer",
                minWidth: 240,
                maxWidth: 380,
                padding: "12px 16px",
                borderRadius: 12,
                background: c.bg,
                color: c.fg,
                border: `1px solid ${c.bd}`,
                boxShadow: "0 8px 24px rgba(15,18,40,.12)",
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fail-safe no-op so a page rendered outside the provider never crashes.
    return { show: () => {}, success: () => {}, error: () => {} };
  }
  return ctx;
}
