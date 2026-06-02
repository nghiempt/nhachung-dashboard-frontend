"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight dropdown menu anchored under a trigger button.
 * The parent owns the open state; this renders the panel and closes
 * itself on outside-click or Escape.
 */
export function Dropdown({
  onClose,
  children,
  align = "right",
  width = 200,
}: {
  onClose: () => void;
  children: React.ReactNode;
  align?: "left" | "right";
  width?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // defer so the opening click itself doesn't immediately close it
    const t = setTimeout(() => document.addEventListener("mousedown", onDocClick), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        [align]: 0,
        width: `${width}px`,
        background: "#ffffff",
        border: "1px solid #e2e5f1",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,.12)",
        padding: "6px",
        zIndex: 50,
        maxHeight: "320px",
        overflowY: "auto",
      }}
      className="nc-scroll"
    >
      {children}
    </div>
  );
}

export function dropdownItem(active: boolean): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "9px 12px",
    borderRadius: "8px",
    border: 0,
    background: active ? "#f1f7ff" : "transparent",
    color: active ? "#4137f9" : "#272727",
    fontSize: "13.5px",
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}

export const dropdownEmpty: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "13px",
  color: "#585c7b",
};
