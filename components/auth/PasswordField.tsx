"use client";

import { useState } from "react";
import styles from "./auth.module.css";

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  /** Optional content rendered under the input (e.g. "Quên mật khẩu?"). */
  footer?: React.ReactNode;
};

/** Password input with a show/hide eye toggle — used on both auth pages. */
export function PasswordField({
  id,
  label,
  placeholder = "",
  autoComplete,
  value,
  onChange,
  footer,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.inputRow}>
        <input
          type={visible ? "text" : "password"}
          id={id}
          name={id}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={() => setVisible((v) => !v)}
          aria-label="Hiện/ẩn mật khẩu"
        >
          {visible ? (
            <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 1C5.45 1 1.73 3.61 0 7.5 1.73 11.39 5.45 14 10 14 14.55 14 18.27 11.39 20 7.5 18.27 3.61 14.55 1 10 1ZM10 11.83C7.35 11.83 5.17 9.65 5.17 7 5.17 4.35 7.35 2.17 10 2.17 12.65 2.17 14.83 4.35 14.83 7 14.83 9.65 12.65 11.83 10 11.83ZM10 4C8.34 4 7 5.34 7 7 7 8.66 8.34 10 10 10 11.66 10 13 8.66 13 7 13 5.34 11.66 4 10 4Z" fill="#4137F9" />
              <line x1="1.5" y1="16.5" x2="18.5" y2="1.5" stroke="#4137F9" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0C5.45 0 1.73 2.61 0 6.5 1.73 10.39 5.45 13 10 13 14.55 13 18.27 10.39 20 6.5 18.27 2.61 14.55 0 10 0ZM10 10.83C7.35 10.83 5.17 8.65 5.17 6 5.17 3.35 7.35 1.17 10 1.17 12.65 1.17 14.83 3.35 14.83 6 14.83 8.65 12.65 10.83 10 10.83ZM10 3C8.34 3 7 4.34 7 6 7 7.66 8.34 9 10 9 11.66 9 13 7.66 13 6 13 4.34 11.66 3 10 3Z" fill="#737373" />
            </svg>
          )}
        </button>
      </div>
      {footer}
    </div>
  );
}

/** Arrow glyph inside the primary submit button. */
export function SubmitArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.49 2 2 6.49 2 12 2 17.51 6.49 22 12 22 17.51 22 22 17.51 22 12 22 6.49 17.51 2 12 2ZM14.79 12.53L11.26 16.06C11.11 16.21 10.92 16.28 10.73 16.28 10.54 16.28 10.35 16.21 10.2 16.06 9.91 15.77 9.91 15.29 10.2 15L13.2 12 10.2 9C9.91 8.71 9.91 8.23 10.2 7.94 10.49 7.65 10.97 7.65 11.26 7.94L14.79 11.47C15.09 11.76 15.09 12.24 14.79 12.53Z" fill="white" />
    </svg>
  );
}
