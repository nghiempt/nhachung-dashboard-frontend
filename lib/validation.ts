"use client";

import { useCallback, useMemo, useState } from "react";
import { z } from "zod";

// ── Shared field schemas (Vietnamese messages) ────────────────
export const vEmail = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập email")
  .email("Email không hợp lệ");

// VN phone: 10–11 digits, may start with +84/0; allow spaces/dots which we strip.
export const vPhone = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập số điện thoại")
  .refine(
    (v) => /^(\+?84|0)\d{8,10}$/.test(v.replace(/[\s.]/g, "")),
    "Số điện thoại không hợp lệ",
  );

export const vPhoneOptional = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^(\+?84|0)\d{8,10}$/.test(v.replace(/[\s.]/g, "")),
    "Số điện thoại không hợp lệ",
  )
  .optional();

export const vRequired = (label = "Trường này") =>
  z.string().trim().min(1, `${label} không được để trống`);

/**
 * Minimal Zod-backed form hook (no react-hook-form dependency).
 * Provides values, per-field errors, validation on submit/blur and a `disabled`
 * flag so submit buttons stay disabled until the form is valid.
 */
export function useZodForm<S extends z.ZodType>(
  schema: S,
  initial: z.input<S>,
) {
  type Values = z.input<S>;
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});

  const setField = useCallback(
    (name: keyof Values, value: unknown) => {
      setValues((prev) => ({ ...(prev as Record<string, unknown>), [name]: value }) as Values);
      // Clear the field error as the user fixes it.
      setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    },
    [],
  );

  const runValidation = useCallback((): z.output<S> | null => {
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const next: Partial<Record<keyof Values, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof Values;
      if (key != null && !next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return null;
  }, [schema, values]);

  const blur = useCallback(
    (name: keyof Values) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const result = schema.safeParse(values);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === name);
        setErrors((prev) => ({ ...prev, [name]: issue?.message }));
      }
    },
    [schema, values],
  );

  // Whether the current values pass the schema (for disabling submit).
  const isValid = useMemo(() => schema.safeParse(values).success, [schema, values]);

  const reset = useCallback((next?: Values) => {
    setValues(next ?? initial);
    setErrors({});
    setTouched({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    values,
    errors,
    touched,
    setField,
    setValues,
    blur,
    validate: runValidation,
    isValid,
    reset,
  };
}
