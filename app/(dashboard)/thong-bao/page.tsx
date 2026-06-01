"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useApiData, useAction } from "@/lib/hooks";
import { formatTime, formatDate, formatDateLong } from "@/lib/format";
import { notifIconColor, NOTIF_CATEGORY_LABEL } from "@/lib/ui-maps";

// ── Types matching the API shapes ───────────────────────────────
type TabKey = "all" | "urgent" | "unread" | "read";

interface ListItem {
  id: string;
  category: string;
  status: "unread" | "read";
  eyebrow: string;
  title: string;
  time: string;
  iconType: string;
  isUrgent: boolean;
  viewCount: number;
}
interface ListMeta { page: number; limit: number; total: number; totalPages: number }
interface ListResponse { items: ListItem[]; meta: ListMeta }

interface SummaryTab { key: TabKey; label: string; count: number }
interface SummaryCategory { category: string; count: number }
interface SummaryResponse { tabs: SummaryTab[]; categories: SummaryCategory[] }

interface Attachment { id: string; name: string; type: string; sizeLabel: string; url?: string }
interface Detail {
  id: string;
  category: string;
  eyebrow: string;
  title: string;
  isUrgent: boolean;
  status: string;
  author: { name: string; role: string; verified: boolean; time: string; viewCount: number };
  body: string[];
  timeCard?: { heading: string; rows: string[] };
  checklist?: string[];
  alertText?: string;
  signoff?: { lines: string[]; signedBy: string; title: string };
  attachments?: Attachment[];
}

// Per-color thumbnail assets (preserve the existing visual design)
const THUMB_IMG: Record<string, string> = {
  red: "data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iaW9uOm5vdGlmY2F0aW9ucyI+CjxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik0xNy4xOTA2IDEzLjMzMjRDMTcuMTI1OCAxMy4yNTQzIDE3LjA2MjEgMTMuMTc2MiAxNi45OTk2IDEzLjEwMDhDMTYuMTQwMiAxMi4wNjEzIDE1LjYyMDMgMTEuNDM0IDE1LjYyMDMgOC40OTE0MUMxNS42MjAzIDYuOTY3OTcgMTUuMjU1OSA1LjcxNzk3IDE0LjUzNzUgNC43ODA0N0MxNC4wMDc4IDQuMDg3ODkgMTMuMjkxOCAzLjU2MjUgMTIuMzQ4IDMuMTc0MjJDMTIuMzM1OSAzLjE2NzQ2IDEyLjMyNTEgMy4xNTg2IDEyLjMxNiAzLjE0ODA1QzExLjk3NjYgMi4wMTEzMyAxMS4wNDc3IDEuMjUgMTAgMS4yNUM4Ljk1MjM0IDEuMjUgOC4wMjM4MyAyLjAxMTMzIDcuNjg0MzcgMy4xNDY4N0M3LjY3NTMzIDMuMTU3MDYgNy42NjQ2MyAzLjE2NTY0IDcuNjUyNzMgMy4xNzIyN0M1LjQ1MDM5IDQuMDc4OTEgNC4zODAwOCA1LjgxODM2IDQuMzgwMDggOC40OTAyM0M0LjM4MDA4IDExLjQzNCAzLjg2MDk0IDEyLjA2MTMgMy4wMDA3OCAxMy4wOTk2QzIuOTM4MjggMTMuMTc1IDIuODc0NjEgMTMuMjUxNiAyLjgwOTc3IDEzLjMzMTJDMi42NDIyNyAxMy41MzMzIDIuNTM2MTQgMTMuNzc5IDIuNTAzOTUgMTQuMDM5NEMyLjQ3MTc2IDE0LjI5OTkgMi41MTQ4NSAxNC41NjQxIDIuNjI4MTIgMTQuODAwOEMyLjg2OTE0IDE1LjMwODYgMy4zODI4MSAxNS42MjM4IDMuOTY5MTQgMTUuNjIzOEgxNi4wMzUyQzE2LjYxODcgMTUuNjIzOCAxNy4xMjg5IDE1LjMwOSAxNy4zNzA3IDE0LjgwMzVDMTcuNDg0NSAxNC41NjY4IDE3LjUyOCAxNC4zMDIzIDE3LjQ5NiAxNC4wNDE2QzE3LjQ2NDEgMTMuNzgwOSAxNy4zNTgxIDEzLjUzNDggMTcuMTkwNiAxMy4zMzI0Wk0xMCAxOC43NUMxMC41NjQ1IDE4Ljc0OTUgMTEuMTE4MyAxOC41OTYzIDExLjYwMjcgMTguMzA2NkMxMi4wODcyIDE4LjAxNjggMTIuNDg0MSAxNy42MDE0IDEyLjc1MTYgMTcuMTA0M0MxMi43NjQyIDE3LjA4MDUgMTIuNzcwNCAxNy4wNTM4IDEyLjc2OTYgMTcuMDI2OUMxMi43Njg5IDE2Ljk5OTkgMTIuNzYxMiAxNi45NzM2IDEyLjc0NzIgMTYuOTUwNkMxMi43MzMzIDE2LjkyNzUgMTIuNzEzNyAxNi45MDg0IDEyLjY5MDIgMTYuODk1MkMxMi42NjY3IDE2Ljg4MTkgMTIuNjQwMiAxNi44NzUgMTIuNjEzMyAxNi44NzVINy4zODc1QzcuMzYwNTIgMTYuODc0OSA3LjMzMzk3IDE2Ljg4MTggNy4zMTA0NCAxNi44OTVDNy4yODY5MiAxNi45MDgyIDcuMjY3MjEgMTYuOTI3MyA3LjI1MzI1IDE2Ljk1MDRDNy4yMzkyOSAxNi45NzM1IDcuMjMxNTQgMTYuOTk5OCA3LjIzMDc3IDE3LjAyNjhDNy4yMjk5OSAxNy4wNTM3IDcuMjM2MjEgMTcuMDgwNCA3LjI0ODgzIDE3LjEwNDNDNy41MTYyMiAxNy42MDEzIDcuOTEzMTQgMTguMDE2NyA4LjM5NzUgMTguMzA2NUM4Ljg4MTg2IDE4LjU5NjIgOS40MzU2IDE4Ljc0OTUgMTAgMTguNzVaIiBmaWxsPSJ2YXIoLS1maWxsLTAsICM0MTM3RjkpIi8+CjwvZz4KPC9zdmc+Cg==",
  blue: "data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDE2LjI1IDE2LjI1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iR3JvdXAiPgo8cGF0aCBpZD0iVmVjdG9yIiBkPSJNOC43NzE2NyA4SDcuNVY2LjI1SDguNzcxNjdDOS4wNzE2NyA2LjI1IDkuMjU1IDYuMzYgOS4zNzMzMyA2LjQ5OTE3QzkuNTAyNSA2LjY1MDgzIDkuNTgzMzMgNi44NzU4MyA5LjU4MzMzIDcuMTI1QzkuNTgzMzMgNy4zNzQxNyA5LjUwMjUgNy41OTkxNyA5LjM3MzMzIDcuNzUwODNDOS4yNTUgNy44OSA5LjA3MDgzIDggOC43NzE2NyA4WiIgZmlsbD0idmFyKC0tZmlsbC0wLCAjMjQ1NUUwKSIvPgo8cGF0aCBpZD0iVmVjdG9yXzIiIGQ9Ik0wIDguMTI1QzAgMy42Mzc1IDMuNjM3NSAwIDguMTI1IDBDMTIuNjEyNSAwIDE2LjI1IDMuNjM3NSAxNi4yNSA4LjEyNUMxNi4yNSAxMi42MTI1IDEyLjYxMjUgMTYuMjUgOC4xMjUgMTYuMjVDMy42Mzc1IDE2LjI1IDAgMTIuNjEyNSAwIDguMTI1Wk02Ljg3NSA1QzYuNzA5MjQgNSA2LjU1MDI3IDUuMDY1ODUgNi40MzMwNiA1LjE4MzA2QzYuMzE1ODUgNS4zMDAyNyA2LjI1IDUuNDU5MjQgNi4yNSA1LjYyNVYxMC42MjVDNi4yNSAxMC43OTA4IDYuMzE1ODUgMTAuOTQ5NyA2LjQzMzA2IDExLjA2NjlDNi41NTAyNyAxMS4xODQyIDYuNzA5MjQgMTEuMjUgNi44NzUgMTEuMjVDNy4wNDA3NiAxMS4yNSA3LjE5OTczIDExLjE4NDIgNy4zMTY5NCAxMS4wNjY5QzcuNDM0MTUgMTAuOTQ5NyA3LjUgMTAuNzkwOCA3LjUgMTAuNjI1VjkuMjVIOC43NzE2N0M5LjQzIDkuMjUgOS45NjQxNyA4Ljk4NSAxMC4zMjUgOC41NjE2N0MxMC42NzUgOC4xNTA4MyAxMC44MzMzIDcuNjI1ODMgMTAuODMzMyA3LjEyNUMxMC44MzMzIDYuNjI0MTcgMTAuNjc1IDYuMDk5MTcgMTAuMzI1IDUuNjg4MzNDOS45NjQxNyA1LjI2NSA5LjQyOTE3IDUgOC43NzE2NyA1SDYuODc1WiIgZmlsbD0idmFyKC0tZmlsbC0wLCAjMjQ1NUUwKSIvPgo8L2c+Cjwvc3ZnPgo=",
  orange: "data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0ic2k6bGlnaHRuaW5nLWZpbGwiPgo8cGF0aCBpZD0iVmVjdG9yIiBkPSJNMTAuOTQ0MiAxLjk4MjVDMTEuMDU4OSAxLjgzNzgxIDExLjIxODUgMS43MzUzNCAxMS4zOTc4IDEuNjkxMTlDMTEuNTc3MiAxLjY0NzA0IDExLjc2NjEgMS42NjM3MSAxMS45MzQ5IDEuNzM4NThDMTIuMTAzNyAxLjgxMzQ2IDEyLjI0MjkgMS45NDIyOSAxMi4zMzA2IDIuMTA0ODVDMTIuNDE4MiAyLjI2NzQgMTIuNDQ5NCAyLjQ1NDQ3IDEyLjQxOTIgMi42MzY2N0wxMS41NCA3LjkxNjY3SDE0LjcyMjVDMTQuODc5MSA3LjkxNjY0IDE1LjAzMjYgNy45NjA3NiAxNS4xNjU0IDguMDQzOThDMTUuMjk4MSA4LjEyNzIgMTUuNDA0NiA4LjI0NjE0IDE1LjQ3MjkgOC4zODcxN0MxNS41NDExIDguNTI4MTkgMTUuNTY4MSA4LjY4NTU4IDE1LjU1MSA4Ljg0MTI5QzE1LjUzMzggOC45OTcgMTUuNDczMSA5LjE0NDcyIDE1LjM3NTggOS4yNjc1TDguNzc4MzMgMTcuNjAwOEM4LjY2MzU3IDE3Ljc0NTUgOC41MDM5OCAxNy44NDggOC4zMjQ2NiAxNy44OTIxQzguMTQ1MzMgMTcuOTM2MyA3Ljk1NjQyIDE3LjkxOTYgNy43ODc1OSAxNy44NDQ3QzcuNjE4NzcgMTcuNzY5OSA3LjQ3OTYgMTcuNjQxIDcuMzkxOTUgMTcuNDc4NUM3LjMwNDMgMTcuMzE1OSA3LjI3MzEyIDE3LjEyODkgNy4zMDMzMyAxNi45NDY3TDguMTgyNSAxMS42NjY3SDVDNC44NDM0MiAxMS42NjY1IDQuNjkwMDQgMTEuNjIyMyA0LjU1NzQ1IDExLjUzOUM0LjQyNDg1IDExLjQ1NTcgNC4zMTg0IDExLjMzNjggNC4yNTAzIDExLjE5NThDNC4xODIxOSAxMS4wNTQ4IDQuMTU1MTkgMTAuODk3NSA0LjE3MjM4IDEwLjc0MThDNC4xODk1NyAxMC41ODYyIDQuMjUwMjYgMTAuNDM4NiA0LjM0NzUgMTAuMzE1OEwxMC45NDQyIDEuOTgyNVoiIGZpbGw9InZhcigtLWZpbGwtMCwgI0ZEOTg0MCkiLz4KPC9nPgo8L3N2Zz4K",
  violet: "data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0ic29sYXI6ZG9jdW1lbnQtYm9sZCI+CjxwYXRoIGlkPSJWZWN0b3IiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMy40NzY2NyAyLjY0MzMzQzIuNSAzLjYxOTE3IDIuNSA1LjE5MDgzIDIuNSA4LjMzMzMzVjExLjY2NjdDMi41IDE0LjgwOTIgMi41IDE2LjM4MDggMy40NzY2NyAxNy4zNTY3QzQuNDUzMzMgMTguMzMyNSA2LjAyNDE3IDE4LjMzMzMgOS4xNjY2NyAxOC4zMzMzSDEwLjgzMzNDMTMuOTc1OCAxOC4zMzMzIDE1LjU0NzUgMTguMzMzMyAxNi41MjMzIDE3LjM1NjdDMTcuNDk5MiAxNi4zOCAxNy41IDE0LjgwOTIgMTcuNSAxMS42NjY3VjguMzMzMzNDMTcuNSA1LjE5MDgzIDE3LjUgMy42MTkxNyAxNi41MjMzIDIuNjQzMzNDMTUuNTQ2NyAxLjY2NzUgMTMuOTc1OCAxLjY2NjY3IDEwLjgzMzMgMS42NjY2N0g5LjE2NjY3QzYuMDI0MTcgMS42NjY2NyA0LjQ1MjUgMS42NjY2NyAzLjQ3NjY3IDIuNjQzMzNaTTYuNjY2NjcgNy43MDgzM0M2LjUwMDkxIDcuNzA4MzMgNi4zNDE5NCA3Ljc3NDE4IDYuMjI0NzIgNy44OTEzOUM2LjEwNzUxIDguMDA4NiA2LjA0MTY3IDguMTY3NTcgNi4wNDE2NyA4LjMzMzMzQzYuMDQxNjcgOC40OTkwOSA2LjEwNzUxIDguNjU4MDYgNi4yMjQ3MiA4Ljc3NTI3QzYuMzQxOTQgOC44OTI0OSA2LjUwMDkxIDguOTU4MzMgNi42NjY2NyA4Ljk1ODMzSDEzLjMzMzNDMTMuNDk5MSA4Ljk1ODMzIDEzLjY1ODEgOC44OTI0OSAxMy43NzUzIDguNzc1MjdDMTMuODkyNSA4LjY1ODA2IDEzLjk1ODMgOC40OTkwOSAxMy45NTgzIDguMzMzMzNDMTMuOTU4MyA4LjE2NzU3IDEzLjg5MjUgOC4wMDg2IDEzLjc3NTMgNy44OTEzOUMxMy42NTgxIDcuNzc0MTggMTMuNDk5MSA3LjcwODMzIDEzLjMzMzMgNy43MDgzM0g2LjY2NjY3Wk02LjY2NjY3IDExLjA0MTdDNi41MDA5MSAxMS4wNDE3IDYuMzQxOTQgMTEuMTA3NSA2LjIyNDcyIDExLjIyNDdDNi4xMDc1MSAxMS4zNDE5IDYuMDQxNjcgMTEuNTAwOSA2LjA0MTY3IDExLjY2NjdDNi4wNDE2NyAxMS44MzI0IDYuMTA3NTEgMTEuOTkxNCA2LjIyNDcyIDEyLjEwODZDNi4zNDE5NCAxMi4yMjU4IDYuNTAwOTEgMTIuMjkxNyA2LjY2NjY3IDEyLjI5MTdIMTAuODMzM0MxMC45OTkxIDEyLjI5MTcgMTEuMTU4MSAxMi4yMjU4IDExLjI3NTMgMTIuMTA4NkMxMS4zOTI1IDExLjk5MTQgMTEuNDU4MyAxMS44MzI0IDExLjQ1ODMgMTEuNjY2N0MxMS40NTgzIDExLjUwMDkgMTEuMzkyNSAxMS4zNDE5IDExLjI3NTMgMTEuMjI0N0MxMS4xNTgxIDExLjEwNzUgMTAuOTk5MSAxMS4wNDE3IDEwLjgzMzMgMTEuMDQxN0g2LjY2NjY3WiIgZmlsbD0idmFyKC0tZmlsbC0wLCAjMEVDOEMxKSIvPgo8L2c+Cjwvc3ZnPgo=",
  green: "data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iaW9uOmNhbGVuZGFyIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTE4Ljc1IDVDMTguNzUgNC4zMzY5NiAxOC40ODY2IDMuNzAxMDcgMTguMDE3OCAzLjIzMjIzQzE3LjU0ODkgMi43NjMzOSAxNi45MTMgMi41IDE2LjI1IDIuNUgxNS42MjVWMS44OTI1OEMxNS42MjUgMS41NTYyNSAxNS4zNjY0IDEuMjY3NTggMTUuMDMwMSAxLjI1MDc4QzE0Ljk0NTYgMS4yNDY3MSAxNC44NjExIDEuMjU5ODQgMTQuNzgxOCAxLjI4OTM3QzE0LjcwMjYgMS4zMTg5IDE0LjYzMDEgMS4zNjQyMiAxNC41Njg4IDEuNDIyNTlDMTQuNTA3NiAxLjQ4MDk1IDE0LjQ1ODggMS41NTExNCAxNC40MjU1IDEuNjI4OTFDMTQuMzkyMiAxLjcwNjY3IDE0LjM3NSAxLjc5MDQgMTQuMzc1IDEuODc1VjIuNUg1LjYyNVYxLjg5MjU4QzUuNjI1IDEuNTU2MjUgNS4zNjY0MSAxLjI2NzU4IDUuMDMwMDggMS4yNTA3OEM0Ljk0NTU3IDEuMjQ2NzEgNC44NjExMiAxLjI1OTg0IDQuNzgxODQgMS4yODkzN0M0LjcwMjU1IDEuMzE4OSA0LjYzMDA5IDEuMzY0MjIgNC41Njg4NCAxLjQyMjU5QzQuNTA3NTkgMS40ODA5NSA0LjQ1ODgzIDEuNTUxMTQgNC40MjU1MSAxLjYyODkxQzQuMzkyMTkgMS43MDY2NyA0LjM3NTAxIDEuNzkwNCA0LjM3NSAxLjg3NVYyLjVIMy43NUMzLjA4Njk2IDIuNSAyLjQ1MTA3IDIuNzYzMzkgMS45ODIyMyAzLjIzMjIzQzEuNTEzMzkgMy43MDEwNyAxLjI1IDQuMzM2OTYgMS4yNSA1VjUuNDY4NzVDMS4yNSA1LjUxMDE5IDEuMjY2NDYgNS41NDk5MyAxLjI5NTc2IDUuNTc5MjRDMS4zMjUwNyA1LjYwODU0IDEuMzY0ODEgNS42MjUgMS40MDYyNSA1LjYyNUgxOC41OTM4QzE4LjYzNTIgNS42MjUgMTguNjc0OSA1LjYwODU0IDE4LjcwNDIgNS41NzkyNEMxOC43MzM1IDUuNTQ5OTMgMTguNzUgNS41MTAxOSAxOC43NSA1LjQ2ODc1VjVaTTEuMjUgMTYuMjVDMS4yNSAxNi45MTMgMS41MTMzOSAxNy41NDg5IDEuOTgyMjMgMTguMDE3OEMyLjQ1MTA3IDE4LjQ4NjYgMy4wODY5NiAxOC43NSAzLjc1IDE4Ljc1SDE2LjI1QzE2LjkxMyAxOC43NSAxNy41NDg5IDE4LjQ4NjYgMTguMDE3OCAxOC4wMTc4QzE4LjQ4NjYgMTcuNTQ4OSAxOC43NSAxNi45MTMgMTguNzUgMTYuMjVWNi45OTIxOUMxOC43NSA2Ljk2MTExIDE4LjczNzcgNi45MzEzIDE4LjcxNTcgNi45MDkzMkMxOC42OTM3IDYuODg3MzUgMTguNjYzOSA2Ljg3NSAxOC42MzI4IDYuODc1SDEuMzY3MTlDMS4zMzYxMSA2Ljg3NSAxLjMwNjMgNi44ODczNSAxLjI4NDMyIDYuOTA5MzJDMS4yNjIzNSA2LjkzMTMgMS4yNSA2Ljk2MTExIDEuMjUgNi45OTIxOVYxNi4yNVpNMTQuNjg3NSA4LjEyNUMxNC44NzI5IDguMTI1IDE1LjA1NDIgOC4xNzk5OCAxNS4yMDgzIDguMjgzQzE1LjM2MjUgOC4zODYwMSAxNS40ODI3IDguNTMyNDMgMTUuNTUzNiA4LjcwMzczQzE1LjYyNDYgOC44NzUwNCAxNS42NDMyIDkuMDYzNTQgMTUuNjA3IDkuMjQ1NEMxNS41NzA4IDkuNDI3MjUgMTUuNDgxNSA5LjU5NDMgMTUuMzUwNCA5LjcyNTQxQzE1LjIxOTMgOS44NTY1MiAxNS4wNTIzIDkuOTQ1ODEgMTQuODcwNCA5Ljk4MTk5QzE0LjY4ODUgMTAuMDE4MiAxNC41IDkuOTk5NTkgMTQuMzI4NyA5LjkyODY0QzE0LjE1NzQgOS44NTc2OCAxNC4wMTEgOS43Mzc1MiAxMy45MDggOS41ODMzNUMxMy44MDUgOS40MjkxOCAxMy43NSA5LjI0NzkyIDEzLjc1IDkuMDYyNUMxMy43NSA4LjgxMzg2IDEzLjg0ODggOC41NzU0IDE0LjAyNDYgOC4zOTk1OUMxNC4yMDA0IDguMjIzNzcgMTQuNDM4OSA4LjEyNSAxNC42ODc1IDguMTI1Wk0xNC42ODc1IDExLjI1QzE0Ljg3MjkgMTEuMjUgMTUuMDU0MiAxMS4zMDUgMTUuMjA4MyAxMS40MDhDMTUuMzYyNSAxMS41MTEgMTUuNDgyNyAxMS42NTc0IDE1LjU1MzYgMTEuODI4N0MxNS42MjQ2IDEyIDE1LjY0MzIgMTIuMTg4NSAxNS42MDcgMTIuMzcwNEMxNS41NzA4IDEyLjU1MjMgMTUuNDgxNSAxMi43MTkzIDE1LjM1MDQgMTIuODUwNEMxNS4yMTkzIDEyLjk4MTUgMTUuMDUyMyAxMy4wNzA4IDE0Ljg3MDQgMTMuMTA3QzE0LjY4ODUgMTMuMTQzMiAxNC41IDEzLjEyNDYgMTQuMzI4NyAxMy4wNTM2QzE0LjE1NzQgMTIuOTgyNyAxNC4wMTEgMTIuODYyNSAxMy45MDggMTIuNzA4M0MxMy44MDUgMTIuNTU0MiAxMy43NSAxMi4zNzI5IDEzLjc1IDEyLjE4NzVDMTMuNzUgMTEuOTM4OSAxMy44NDg4IDExLjcwMDQgMTQuMDI0NiAxMS41MjQ2QzE0LjIwMDQgMTEuMzQ4OCAxNC40Mzg5IDExLjI1IDE0LjY4NzUgMTEuMjVaTTExLjU2MjUgOC4xMjVDMTEuNzQ3OSA4LjEyNSAxMS45MjkyIDguMTc5OTggMTIuMDgzMyA4LjI4M0MxMi4yMzc1IDguMzg2MDEgMTIuMzU3NyA4LjUzMjQzIDEyLjQyODYgOC43MDM3M0MxMi40OTk2IDguODc1MDQgMTIuNTE4MiA5LjA2MzU0IDEyLjQ4MiA5LjI0NTRDMTIuNDQ1OCA5LjQyNzI1IDEyLjM1NjUgOS41OTQzIDEyLjIyNTQgOS43MjU0MUMxMi4wOTQzIDkuODU2NTIgMTEuOTI3MyA5Ljk0NTgxIDExLjc0NTQgOS45ODE5OUMxMS41NjM1IDEwLjAxODIgMTEuMzc1IDkuOTk5NTkgMTEuMjAzNyA5LjkyODY0QzExLjAzMjQgOS44NTc2OCAxMC44ODYgOS43Mzc1MiAxMC43ODMgOS41ODMzNUMxMC42OCA5LjQyOTE4IDEwLjYyNSA5LjI0NzkyIDEwLjYyNSA5LjA2MjVDMTAuNjI1IDguODEzODYgMTAuNzIzOCA4LjU3NTQgMTAuODk5NiA4LjM5OTU5QzExLjA3NTQgOC4yMjM3NyAxMS4zMTM5IDguMTI1IDExLjU2MjUgOC4xMjVaTTExLjU2MjUgMTEuMjVDMTEuNzQ3OSAxMS4yNSAxMS45MjkyIDExLjMwNSAxMi4wODMzIDExLjQwOEMxMi4yMzc1IDExLjUxMSAxMi4zNTc3IDExLjY1NzQgMTIuNDI4NiAxMS44Mjg3QzEyLjQ5OTYgMTIgMTIuNTE4MiAxMi4xODg1IDEyLjQ4MiAxMi4zNzA0QzEyLjQ0NTggMTIuNTUyMyAxMi4zNTY1IDEyLjcxOTMgMTIuMjI1NCAxMi44NTA0QzEyLjA5NDMgMTIuOTgxNSAxMS45MjczIDEzLjA3MDggMTEuNzQ1NCAxMy4xMDdDMTEuNTYzNSAxMy4xNDMyIDExLjM3NSAxMy4xMjQ2IDExLjIwMzcgMTMuMDUzNkMxMS4wMzI0IDEyLjk4MjcgMTAuODg2IDEyLjg2MjUgMTAuNzgzIDEyLjcwODNDMTAuNjggMTIuNTU0MiAxMC42MjUgMTIuMzcyOSAxMC42MjUgMTIuMTg3NUMxMC42MjUgMTEuOTM4OSAxMC43MjM4IDExLjcwMDQgMTAuODk5NiAxMS41MjQ2QzExLjA3NTQgMTEuMzQ4OCAxMS4zMTM5IDExLjI1IDExLjU2MjUgMTEuMjVaTTExLjU2MjUgMTQuMzc1QzExLjc0NzkgMTQuMzc1IDExLjkyOTIgMTQuNDMgMTIuMDgzMyAxNC41MzNDMTIuMjM3NSAxNC42MzYgMTIuMzU3NyAxNC43ODI0IDEyLjQyODYgMTQuOTUzN0MxMi40OTk2IDE1LjEyNSAxMi41MTgyIDE1LjMxMzUgMTIuNDgyIDE1LjQ5NTRDMTIuNDQ1OCAxNS42NzczIDEyLjM1NjUgMTUuODQ0MyAxMi4yMjU0IDE1Ljk3NTRDMTIuMDk0MyAxNi4xMDY1IDExLjkyNzMgMTYuMTk1OCAxMS43NDU0IDE2LjIzMkMxMS41NjM1IDE2LjI2ODIgMTEuMzc1IDE2LjI0OTYgMTEuMjAzNyAxNi4xNzg2QzExLjAzMjQgMTYuMTA3NyAxMC44ODYgMTUuOTg3NSAxMC43ODMgMTUuODMzM0MxMC42OCAxNS42NzkyIDEwLjYyNSAxNS40OTc5IDEwLjYyNSAxNS4zMTI1QzEwLjYyNSAxNS4wNjM5IDEwLjcyMzggMTQuODI1NCAxMC44OTk2IDE0LjY0OTZDMTEuMDc1NCAxNC40NzM4IDExLjMxMzkgMTQuMzc1IDExLjU2MjUgMTQuMzc1Wk04LjQzNzUgMTEuMjVDOC42MjI5MiAxMS4yNSA4LjgwNDE4IDExLjMwNSA4Ljk1ODM1IDExLjQwOEM5LjExMjUyIDExLjUxMSA5LjIzMjY4IDExLjY1NzQgOS4zMDM2NCAxMS44Mjg3QzkuMzc0NTkgMTIgOS4zOTMxNiAxMi4xODg1IDkuMzU2OTkgMTIuMzcwNEM5LjMyMDgxIDEyLjU1MjMgOS4yMzE1MiAxMi43MTkzIDkuMTAwNDEgMTIuODUwNEM4Ljk2OTMgMTIuOTgxNSA4LjgwMjI1IDEzLjA3MDggOC42MjA0IDEzLjEwN0M4LjQzODU0IDEzLjE0MzIgOC4yNTAwNCAxMy4xMjQ2IDguMDc4NzMgMTMuMDUzNkM3LjkwNzQzIDEyLjk4MjcgNy43NjEwMSAxMi44NjI1IDcuNjU4IDEyLjcwODNDNy41NTQ5OCAxMi41NTQyIDcuNSAxMi4zNzI5IDcuNSAxMi4xODc1QzcuNSAxMS45Mzg5IDcuNTk4NzcgMTEuNzAwNCA3Ljc3NDU5IDExLjUyNDZDNy45NTA0IDExLjM0ODggOC4xODg4NiAxMS4yNSA4LjQzNzUgMTEuMjVaTTguNDM3NSAxNC4zNzVDOC42MjI5MiAxNC4zNzUgOC44MDQxOCAxNC40MyA4Ljk1ODM1IDE0LjUzM0M5LjExMjUyIDE0LjYzNiA5LjIzMjY4IDE0Ljc4MjQgOS4zMDM2NCAxNC45NTM3QzkuMzc0NTkgMTUuMTI1IDkuMzkzMTYgMTUuMzEzNSA5LjM1Njk5IDE1LjQ5NTRDOS4zMjA4MSAxNS42NzczIDkuMjMxNTIgMTUuODQ0MyA5LjEwMDQxIDE1Ljk3NTRDOC45NjkzIDE2LjEwNjUgOC44MDIyNSAxNi4xOTU4IDguNjIwNCAxNi4yMzJDOC40Mzg1NCAxNi4yNjgyIDguMjUwMDQgMTYuMjQ5NiA4LjA3ODczIDE2LjE3ODZDNy45MDc0MyAxNi4xMDc3IDcuNzYxMDEgMTUuOTg3NSA3LjY1OCAxNS44MzMzQzcuNTU0OTggMTUuNjc5MiA3LjUgMTUuNDk3OSA3LjUgMTUuMzEyNUM3LjUgMTUuMDYzOSA3LjU5ODc3IDE0LjgyNTQgNy43NzQ1OSAxNC42NDk2QzcuOTUwNCAxNC40NzM4IDguMTg4ODYgMTQuMzc1IDguNDM3NSAxNC4zNzVaTTUuMzEyNSAxMS4yNUM1LjQ5NzkyIDExLjI1IDUuNjc5MTggMTEuMzA1IDUuODMzMzUgMTEuNDA4QzUuOTg3NTIgMTEuNTExIDYuMTA3NjggMTEuNjU3NCA2LjE3ODY0IDExLjgyODdDNi4yNDk1OSAxMiA2LjI2ODE2IDEyLjE4ODUgNi4yMzE5OSAxMi4zNzA0QzYuMTk1ODEgMTIuNTUyMyA2LjEwNjUyIDEyLjcxOTMgNS45NzU0MSAxMi44NTA0QzUuODQ0MyAxMi45ODE1IDUuNjc3MjUgMTMuMDcwOCA1LjQ5NTQgMTMuMTA3QzUuMzEzNTQgMTMuMTQzMiA1LjEyNTA0IDEzLjEyNDYgNC45NTM3MyAxMy4wNTM2QzQuNzgyNDMgMTIuOTgyNyA0LjYzNjAxIDEyLjg2MjUgNC41MzMgMTIuNzA4M0M0LjQyOTk4IDEyLjU1NDIgNC4zNzUgMTIuMzcyOSA0LjM3NSAxMi4xODc1QzQuMzc1IDExLjkzODkgNC40NzM3NyAxMS43MDA0IDQuNjQ5NTkgMTEuNTI0NkM0LjgyNTQgMTEuMzQ4OCA1LjA2Mzg2IDExLjI1IDUuMzEyNSAxMS4yNVpNNS4zMTI1IDE0LjM3NUM1LjQ5NzkyIDE0LjM3NSA1LjY3OTE4IDE0LjQzIDUuODMzMzUgMTQuNTMzQzUuOTg3NTIgMTQuNjM2IDYuMTA3NjggMTQuNzgyNCA2LjE3ODY0IDE0Ljk1MzdDNi4yNDk1OSAxNS4xMjUgNi4yNjgxNiAxNS4zMTM1IDYuMjMxOTkgMTUuNDk1NEM2LjE5NTgxIDE1LjY3NzMgNi4xMDY1MiAxNS44NDQzIDUuOTc1NDEgMTUuOTc1NEM1Ljg0NDMgMTYuMTA2NSA1LjY3NzI1IDE2LjE5NTggNS40OTU0IDE2LjIzMkM1LjMxMzU0IDE2LjI2ODIgNS4xMjUwNCAxNi4yNDk2IDQuOTUzNzMgMTYuMTc4NkM0Ljc4MjQzIDE2LjEwNzcgNC42MzYwMSAxNS45ODc1IDQuNTMzIDE1LjgzMzNDNC40Mjk5OCAxNS42NzkyIDQuMzc1IDE1LjQ5NzkgNC4zNzUgMTUuMzEyNUM0LjM3NSAxNS4wNjM5IDQuNDczNzcgMTQuODI1NCA0LjY0OTU5IDE0LjY0OTZDNC44MjU0IDE0LjQ3MzggNS4wNjM4NiAxNC4zNzUgNS4zMTI1IDE0LjM3NVoiIGZpbGw9InZhcigtLWZpbGwtMCwgIzVBQzE1QykiLz4KPC9nPgo8L3N2Zz4K",
  mint: "data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iaW9uOmNhbGVuZGFyIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTE4Ljc1IDVDMTguNzUgNC4zMzY5NiAxOC40ODY2IDMuNzAxMDcgMTguMDE3OCAzLjIzMjIzQzE3LjU0ODkgMi43NjMzOSAxNi45MTMgMi41IDE2LjI1IDIuNUgxNS42MjVWMS44OTI1OEMxNS42MjUgMS41NTYyNSAxNS4zNjY0IDEuMjY3NTggMTUuMDMwMSAxLjI1MDc4QzE0Ljk0NTYgMS4yNDY3MSAxNC44NjExIDEuMjU5ODQgMTQuNzgxOCAxLjI4OTM3QzE0LjcwMjYgMS4zMTg5IDE0LjYzMDEgMS4zNjQyMiAxNC41Njg4IDEuNDIyNTlDMTQuNTA3NiAxLjQ4MDk1IDE0LjQ1ODggMS41NTExNCAxNC40MjU1IDEuNjI4OTFDMTQuMzkyMiAxLjcwNjY3IDE0LjM3NSAxLjc5MDQgMTQuMzc1IDEuODc1VjIuNUg1LjYyNVYxLjg5MjU4QzUuNjI1IDEuNTU2MjUgNS4zNjY0MSAxLjI2NzU4IDUuMDMwMDggMS4yNTA3OEM0Ljk0NTU3IDEuMjQ2NzEgNC44NjExMiAxLjI1OTg0IDQuNzgxODQgMS4yODkzN0M0LjcwMjU1IDEuMzE4OSA0LjYzMDA5IDEuMzY0MjIgNC41Njg4NCAxLjQyMjU5QzQuNTA3NTkgMS40ODA5NSA0LjQ1ODgzIDEuNTUxMTQgNC40MjU1MSAxLjYyODkxQzQuMzkyMTkgMS43MDY2NyA0LjM3NTAxIDEuNzkwNCA0LjM3NSAxLjg3NVYyLjVIMy43NUMzLjA4Njk2IDIuNSAyLjQ1MTA3IDIuNzYzMzkgMS45ODIyMyAzLjIzMjIzQzEuNTEzMzkgMy43MDEwNyAxLjI1IDQuMzM2OTYgMS4yNSA1VjUuNDY4NzVDMS4yNSA1LjUxMDE5IDEuMjY2NDYgNS41NDk5MyAxLjI5NTc2IDUuNTc5MjRDMS4zMjUwNyA1LjYwODU0IDEuMzY0ODEgNS42MjUgMS40MDYyNSA1LjYyNUgxOC41OTM4QzE4LjYzNTIgNS42MjUgMTguNjc0OSA1LjYwODU0IDE4LjcwNDIgNS41NzkyNEMxOC43MzM1IDUuNTQ5OTMgMTguNzUgNS41MTAxOSAxOC43NSA1LjQ2ODc1VjVaTTEuMjUgMTYuMjVDMS4yNSAxNi45MTMgMS41MTMzOSAxNy41NDg5IDEuOTgyMjMgMTguMDE3OEMyLjQ1MTA3IDE4LjQ4NjYgMy4wODY5NiAxOC43NSAzLjc1IDE4Ljc1SDE2LjI1QzE2LjkxMyAxOC43NSAxNy41NDg5IDE4LjQ4NjYgMTguMDE3OCAxOC4wMTc4QzE4LjQ4NjYgMTcuNTQ4OSAxOC43NSAxNi45MTMgMTguNzUgMTYuMjVWNi45OTIxOUMxOC43NSA2Ljk2MTExIDE4LjczNzcgNi45MzEzIDE4LjcxNTcgNi45MDkzMkMxOC42OTM3IDYuODg3MzUgMTguNjYzOSA2Ljg3NSAxOC42MzI4IDYuODc1SDEuMzY3MTlDMS4zMzYxMSA2Ljg3NSAxLjMwNjMgNi44ODczNSAxLjI4NDMyIDYuOTA5MzJDMS4yNjIzNSA2LjkzMTMgMS4yNSA2Ljk2MTExIDEuMjUgNi45OTIxOVYxNi4yNVpNMTQuNjg3NSA4LjEyNUMxNC44NzI5IDguMTI1IDE1LjA1NDIgOC4xNzk5OCAxNS4yMDgzIDguMjgzQzE1LjM2MjUgOC4zODYwMSAxNS40ODI3IDguNTMyNDMgMTUuNTUzNiA4LjcwMzczQzE1LjYyNDYgOC44NzUwNCAxNS42NDMyIDkuMDYzNTQgMTUuNjA3IDkuMjQ1NEMxNS41NzA4IDkuNDI3MjUgMTUuNDgxNSA5LjU5NDMgMTUuMzUwNCA5LjcyNTQxQzE1LjIxOTMgOS44NTY1MiAxNS4wNTIzIDkuOTQ1ODEgMTQuODcwNCA5Ljk4MTk5QzE0LjY4ODUgMTAuMDE4MiAxNC41IDkuOTk5NTkgMTQuMzI4NyA5LjkyODY0QzE0LjE1NzQgOS44NTc2OCAxNC4wMTEgOS43Mzc1MiAxMy45MDggOS41ODMzNUMxMy44MDUgOS40MjkxOCAxMy43NSA5LjI0NzkyIDEzLjc1IDkuMDYyNUMxMy43NSA4LjgxMzg2IDEzLjg0ODggOC41NzU0IDE0LjAyNDYgOC4zOTk1OUMxNC4yMDA0IDguMjIzNzcgMTQuNDM4OSA4LjEyNSAxNC42ODc1IDguMTI1Wk0xNC42ODc1IDExLjI1QzE0Ljg3MjkgMTEuMjUgMTUuMDU0MiAxMS4zMDUgMTUuMjA4MyAxMS40MDhDMTUuMzYyNSAxMS41MTEgMTUuNDgyNyAxMS42NTc0IDE1LjU1MzYgMTEuODI4N0MxNS42MjQ2IDEyIDE1LjY0MzIgMTIuMTg4NSAxNS42MDcgMTIuMzcwNEMxNS41NzA4IDEyLjU1MjMgMTUuNDgxNSAxMi43MTkzIDE1LjM1MDQgMTIuODUwNEMxNS4yMTkzIDEyLjk4MTUgMTUuMDUyMyAxMy4wNzA4IDE0Ljg3MDQgMTMuMTA3QzE0LjY4ODUgMTMuMTQzMiAxNC41IDEzLjEyNDYgMTQuMzI4NyAxMy4wNTM2QzE0LjE1NzQgMTIuOTgyNyAxNC4wMTEgMTIuODYyNSAxMy45MDggMTIuNzA4M0MxMy44MDUgMTIuNTU0MiAxMy43NSAxMi4zNzI5IDEzLjc1IDEyLjE4NzVDMTMuNzUgMTEuOTM4OSAxMy44NDg4IDExLjcwMDQgMTQuMDI0NiAxMS41MjQ2QzE0LjIwMDQgMTEuMzQ4OCAxNC40Mzg5IDExLjI1IDE0LjY4NzUgMTEuMjVaTTExLjU2MjUgOC4xMjVDMTEuNzQ3OSA4LjEyNSAxMS45MjkyIDguMTc5OTggMTIuMDgzMyA4LjI4M0MxMi4yMzc1IDguMzg2MDEgMTIuMzU3NyA4LjUzMjQzIDEyLjQyODYgOC43MDM3M0MxMi40OTk2IDguODc1MDQgMTIuNTE4MiA5LjA2MzU0IDEyLjQ4MiA5LjI0NTRDMTIuNDQ1OCA5LjQyNzI1IDEyLjM1NjUgOS41OTQzIDEyLjIyNTQgOS43MjU0MUMxMi4wOTQzIDkuODU2NTIgMTEuOTI3MyA5Ljk0NTgxIDExLjc0NTQgOS45ODE5OUMxMS41NjM1IDEwLjAxODIgMTEuMzc1IDkuOTk5NTkgMTEuMjAzNyA5LjkyODY0QzExLjAzMjQgOS44NTc2OCAxMC44ODYgOS43Mzc1MiAxMC43ODMgOS41ODMzNUMxMC42OCA5LjQyOTE4IDEwLjYyNSA5LjI0NzkyIDEwLjYyNSA5LjA2MjVDMTAuNjI1IDguODEzODYgMTAuNzIzOCA4LjU3NTQgMTAuODk5NiA4LjM5OTU5QzExLjA3NTQgOC4yMjM3NyAxMS4zMTM5IDguMTI1IDExLjU2MjUgOC4xMjVaTTExLjU2MjUgMTEuMjVDMTEuNzQ3OSAxMS4yNSAxMS45MjkyIDExLjMwNSAxMi4wODMzIDExLjQwOEMxMi4yMzc1IDExLjUxMSAxMi4zNTc3IDExLjY1NzQgMTIuNDI4NiAxMS44Mjg3QzEyLjQ5OTYgMTIgMTIuNTE4MiAxMi4xODg1IDEyLjQ4MiAxMi4zNzA0QzEyLjQ0NTggMTIuNTUyMyAxMi4zNTY1IDEyLjcxOTMgMTIuMjI1NCAxMi44NTA0QzEyLjA5NDMgMTIuOTgxNSAxMS45MjczIDEzLjA3MDggMTEuNzQ1NCAxMy4xMDdDMTEuNTYzNSAxMy4xNDMyIDExLjM3NSAxMy4xMjQ2IDExLjIwMzcgMTMuMDUzNkMxMS4wMzI0IDEyLjk4MjcgMTAuODg2IDEyLjg2MjUgMTAuNzgzIDEyLjcwODNDMTAuNjggMTIuNTU0MiAxMC42MjUgMTIuMzcyOSAxMC42MjUgMTIuMTg3NUMxMC42MjUgMTEuOTM4OSAxMC43MjM4IDExLjcwMDQgMTAuODk5NiAxMS41MjQ2QzExLjA3NTQgMTEuMzQ4OCAxMS4zMTM5IDExLjI1IDExLjU2MjUgMTEuMjVaTTExLjU2MjUgMTQuMzc1QzExLjc0NzkgMTQuMzc1IDExLjkyOTIgMTQuNDMgMTIuMDgzMyAxNC41MzNDMTIuMjM3NSAxNC42MzYgMTIuMzU3NyAxNC43ODI0IDEyLjQyODYgMTQuOTUzN0MxMi40OTk2IDE1LjEyNSAxMi41MTgyIDE1LjMxMzUgMTIuNDgyIDE1LjQ5NTRDMTIuNDQ1OCAxNS42NzczIDEyLjM1NjUgMTUuODQ0MyAxMi4yMjU0IDE1Ljk3NTRDMTIuMDk0MyAxNi4xMDY1IDExLjkyNzMgMTYuMTk1OCAxMS43NDU0IDE2LjIzMkMxMS41NjM1IDE2LjI2ODIgMTEuMzc1IDE2LjI0OTYgMTEuMjAzNyAxNi4xNzg2QzExLjAzMjQgMTYuMTA3NyAxMC44ODYgMTUuOTg3NSAxMC43ODMgMTUuODMzM0MxMC42OCAxNS42NzkyIDEwLjYyNSAxNS40OTc5IDEwLjYyNSAxNS4zMTI1QzEwLjYyNSAxNS4wNjM5IDEwLjcyMzggMTQuODI1NCAxMC44OTk2IDE0LjY0OTZDMTEuMDc1NCAxNC40NzM4IDExLjMxMzkgMTQuMzc1IDExLjU2MjUgMTQuMzc1Wk04LjQzNzUgMTEuMjVDOC42MjI5MiAxMS4yNSA4LjgwNDE4IDExLjMwNSA4Ljk1ODM1IDExLjQwOEM5LjExMjUyIDExLjUxMSA5LjIzMjY4IDExLjY1NzQgOS4zMDM2NCAxMS44Mjg3QzkuMzc0NTkgMTIgOS4zOTMxNiAxMi4xODg1IDkuMzU2OTkgMTIuMzcwNEM5LjMyMDgxIDEyLjU1MjMgOS4yMzE1MiAxMi43MTkzIDkuMTAwNDEgMTIuODUwNEM4Ljk2OTMgMTIuOTgxNSA4LjgwMjI1IDEzLjA3MDggOC42MjA0IDEzLjEwN0M4LjQzODU0IDEzLjE0MzIgOC4yNTAwNCAxMy4xMjQ2IDguMDc4NzMgMTMuMDUzNkM3LjkwNzQzIDEyLjk4MjcgNy43NjEwMSAxMi44NjI1IDcuNjU4IDEyLjcwODNDNy41NTQ5OCAxMi41NTQyIDcuNSAxMi4zNzI5IDcuNSAxMi4xODc1QzcuNSAxMS45Mzg5IDcuNTk4NzcgMTEuNzAwNCA3Ljc3NDU5IDExLjUyNDZDNy45NTA0IDExLjM0ODggOC4xODg4NiAxMS4yNSA4LjQzNzUgMTEuMjVaTTguNDM3NSAxNC4zNzVDOC42MjI5MiAxNC4zNzUgOC44MDQxOCAxNC40MyA4Ljk1ODM1IDE0LjUzM0M5LjExMjUyIDE0LjYzNiA5LjIzMjY4IDE0Ljc4MjQgOS4zMDM2NCAxNC45NTM3QzkuMzc0NTkgMTUuMTI1IDkuMzkzMTYgMTUuMzEzNSA5LjM1Njk5IDE1LjQ5NTRDOS4zMjA4MSAxNS42NzczIDkuMjMxNTIgMTUuODQ0MyA5LjEwMDQxIDE1Ljk3NTRDOC45NjkzIDE2LjEwNjUgOC44MDIyNSAxNi4xOTU4IDguNjIwNCAxNi4yMzJDOC40Mzg1NCAxNi4yNjgyIDguMjUwMDQgMTYuMjQ5NiA4LjA3ODczIDE2LjE3ODZDNy45MDc0MyAxNi4xMDc3IDcuNzYxMDEgMTUuOTg3NSA3LjY1OCAxNS44MzMzQzcuNTU0OTggMTUuNjc5MiA3LjUgMTUuNDk3OSA3LjUgMTUuMzEyNUM3LjUgMTUuMDYzOSA3LjU5ODc3IDE0LjgyNTQgNy43NzQ1OSAxNC42NDk2QzcuOTUwNCAxNC40NzM4IDguMTg4ODYgMTQuMzc1IDguNDM3NSAxNC4zNzVaTTUuMzEyNSAxMS4yNUM1LjQ5NzkyIDExLjI1IDUuNjc5MTggMTEuMzA1IDUuODMzMzUgMTEuNDA4QzUuOTg3NTIgMTEuNTExIDYuMTA3NjggMTEuNjU3NCA2LjE3ODY0IDExLjgyODdDNi4yNDk1OSAxMiA2LjI2ODE2IDEyLjE4ODUgNi4yMzE5OSAxMi4zNzA0QzYuMTk1ODEgMTIuNTUyMyA2LjEwNjUyIDEyLjcxOTMgNS45NzU0MSAxMi44NTA0QzUuODQ0MyAxMi45ODE1IDUuNjc3MjUgMTMuMDcwOCA1LjQ5NTQgMTMuMTA3QzUuMzEzNTQgMTMuMTQzMiA1LjEyNTA0IDEzLjEyNDYgNC45NTM3MyAxMy4wNTM2QzQuNzgyNDMgMTIuOTgyNyA0LjYzNjAxIDEyLjg2MjUgNC41MzMgMTIuNzA4M0M0LjQyOTk4IDEyLjU1NDIgNC4zNzUgMTIuMzcyOSA0LjM3NSAxMi4xODc1QzQuMzc1IDExLjkzODkgNC40NzM3NyAxMS43MDA0IDQuNjQ5NTkgMTEuNTI0NkM0LjgyNTQgMTEuMzQ4OCA1LjA2Mzg2IDExLjI1IDUuMzEyNSAxMS4yNVpNNS4zMTI1IDE0LjM3NUM1LjQ5NzkyIDE0LjM3NSA1LjY3OTE4IDE0LjQzIDUuODMzMzUgMTQuNTMzQzUuOTg3NTIgMTQuNjM2IDYuMTA3NjggMTQuNzgyNCA2LjE3ODY0IDE0Ljk1MzdDNi4yNDk1OSAxNS4xMjUgNi4yNjgxNiAxNS4zMTM1IDYuMjMxOTkgMTUuNDk1NEM2LjE5NTgxIDE1LjY3NzMgNi4xMDY1MiAxNS44NDQzIDUuOTc1NDEgMTUuOTc1NEM1Ljg0NDMgMTYuMTA2NSA1LjY3NzI1IDE2LjE5NTggNS40OTU0IDE2LjIzMkM1LjMxMzU0IDE2LjI2ODIgNS4xMjUwNCAxNi4yNDk2IDQuOTUzNzMgMTYuMTc4NkM0Ljc4MjQzIDE2LjEwNzcgNC42MzYwMSAxNS45ODc1IDQuNTMzIDE1LjgzMzNDNC40Mjk5OCAxNS42NzkyIDQuMzc1IDE1LjQ5NzkgNC4zNzUgMTUuMzEyNUM0LjM3NSAxNS4wNjM5IDQuNDczNzcgMTQuODI1NCA0LjY0OTU5IDE0LjY0OTZDNC44MjU0IDE0LjQ3MzggNS4wNjM4NiAxNC4zNzUgNS4zMTI1IDE0LjM3NVoiIGZpbGw9InZhcigtLWZpbGwtMCwgIzVBQzE1QykiLz4KPC9nPgo8L3N2Zz4K",
  amber: "data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0ic2k6bGlnaHRuaW5nLWZpbGwiPgo8cGF0aCBpZD0iVmVjdG9yIiBkPSJNMTAuOTQ0MiAxLjk4MjVDMTEuMDU4OSAxLjgzNzgxIDExLjIxODUgMS43MzUzNCAxMS4zOTc4IDEuNjkxMTlDMTEuNTc3MiAxLjY0NzA0IDExLjc2NjEgMS42NjM3MSAxMS45MzQ5IDEuNzM4NThDMTIuMTAzNyAxLjgxMzQ2IDEyLjI0MjkgMS45NDIyOSAxMi4zMzA2IDIuMTA0ODVDMTIuNDE4MiAyLjI2NzQgMTIuNDQ5NCAyLjQ1NDQ3IDEyLjQxOTIgMi42MzY2N0wxMS41NCA3LjkxNjY3SDE0LjcyMjVDMTQuODc5MSA3LjkxNjY0IDE1LjAzMjYgNy45NjA3NiAxNS4xNjU0IDguMDQzOThDMTUuMjk4MSA4LjEyNzIgMTUuNDA0NiA4LjI0NjE0IDE1LjQ3MjkgOC4zODcxN0MxNS41NDExIDguNTI4MTkgMTUuNTY4MSA4LjY4NTU4IDE1LjU1MSA4Ljg0MTI5QzE1LjUzMzggOC45OTcgMTUuNDczMSA5LjE0NDcyIDE1LjM3NTggOS4yNjc1TDguNzc4MzMgMTcuNjAwOEM4LjY2MzU3IDE3Ljc0NTUgOC41MDM5OCAxNy44NDggOC4zMjQ2NiAxNy44OTIxQzguMTQ1MzMgMTcuOTM2MyA3Ljk1NjQyIDE3LjkxOTYgNy43ODc1OSAxNy44NDQ3QzcuNjE4NzcgMTcuNzY5OSA3LjQ3OTYgMTcuNjQxIDcuMzkxOTUgMTcuNDc4NUM3LjMwNDMgMTcuMzE1OSA3LjI3MzEyIDE3LjEyODkgNy4zMDMzMyAxNi45NDY3TDguMTgyNSAxMS42NjY3SDVDNC44NDM0MiAxMS42NjY1IDQuNjkwMDQgMTEuNjIyMyA0LjU1NzQ1IDExLjUzOUM0LjQyNDg1IDExLjQ1NTcgNC4zMTg0IDExLjMzNjggNC4yNTAzIDExLjE5NThDNC4xODIxOSAxMS4wNTQ4IDQuMTU1MTkgMTAuODk3NSA0LjE3MjM4IDEwLjc0MThDNC4xODk1NyAxMC41ODYyIDQuMjUwMjYgMTAuNDM4NiA0LjM0NzUgMTAuMzE1OEwxMC45NDQyIDEuOTgyNVoiIGZpbGw9InZhcigtLWZpbGwtMCwgI0ZEOTg0MCkiLz4KPC9nPgo8L3N2Zz4K",
};

const PAGE_LIMIT = 5;

export default function ThongBaoPage() {
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);

  // Debounce the search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const listQuery =
    `/notifications?tab=${tab}` +
    (search ? `&search=${encodeURIComponent(search)}` : "") +
    `&page=${page}&limit=${PAGE_LIMIT}`;

  const { data: list, refetch: refetchList } = useApiData<ListResponse>(listQuery, [tab, search, page]);
  const { data: summary, refetch: refetchSummary } = useApiData<SummaryResponse>("/notifications/summary");

  const items = list?.items ?? [];
  const meta = list?.meta;
  const tabs: SummaryTab[] = summary?.tabs ?? [];
  const categories: SummaryCategory[] = summary?.categories ?? [];

  // Load detail when an item is selected; marks it read server-side, then refresh
  async function selectItem(id: string) {
    setSelectedId(id);
    try {
      const d = await apiGet<Detail>(`/notifications/${id}`);
      setDetail(d);
    } catch {
      setDetail(null);
    }
    refetchList();
    refetchSummary();
  }

  const markAll = useAction(async () => {
    await apiPost("/notifications/read-all");
    refetchList();
    refetchSummary();
  });

  function tabCount(key: TabKey): number | undefined {
    return tabs.find((t) => t.key === key)?.count;
  }

  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;
  const startIdx = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const endIdx = Math.min(page * PAGE_LIMIT, total);

  return (
    <div className="thongbao-page">
      <div className="col-main">
        <div className="page-head">
          <div>
            <h1 className="page-title">Thông báo</h1>
            <div className="page-sub">Cập nhật những thông tin mới nhất từ Ban quản trị</div>
          </div>
          <button className="mark-all" onClick={() => markAll.run()} disabled={markAll.loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Đánh dấu đã đọc tất cả
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#585c7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

        <div className="tabs">
          <div className={`tab ${tab === "all" ? "active" : ""}`} onClick={() => { setTab("all"); setPage(1); }}>
            Tất cả {tabCount("all") != null && <span className="count">{tabCount("all")}</span>}
          </div>
          <div className={`tab urgent ${tab === "urgent" ? "active" : ""}`} onClick={() => { setTab("urgent"); setPage(1); }}>
            Thông báo khẩn {tabCount("urgent") != null && <span className="count">{tabCount("urgent")}</span>}
          </div>
          <div className={`tab ${tab === "unread" ? "active" : ""}`} onClick={() => { setTab("unread"); setPage(1); }}>
            Chưa đọc {tabCount("unread") != null && <span className="count">{tabCount("unread")}</span>}
          </div>
          <div className={`tab ${tab === "read" ? "active" : ""}`} onClick={() => { setTab("read"); setPage(1); }}>
            Đã đọc {tabCount("read") != null && <span className="count">{tabCount("read")}</span>}
          </div>
        </div>

        <div className="work">
          {/* List */}
          <div>
            <div className="search-row">
              <div className="search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b4b7c9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>
                <input
                  placeholder="Tìm kiếm thông báo..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <button className="filter-icon-btn" aria-label="Bộ lọc">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
              </button>
            </div>

            <div className="list">
              {items.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px", color: "#585c7b", fontSize: "14px" }}>
                  Không có thông báo nào.
                </div>
              )}
              {items.map((n) => {
                const color = notifIconColor(n.category);
                return (
                  <div
                    key={n.id}
                    className={`item ${selectedId === n.id ? "active" : ""}`}
                    onClick={() => selectItem(n.id)}
                  >
                    <div className={`thumb ${color}`}>
                      <img src={THUMB_IMG[color] ?? THUMB_IMG.blue} alt="" width={20} height={20} />
                    </div>
                    <div className="body">
                      <div className="eyebrow">{n.eyebrow}</div>
                      <div className="title">{n.title}</div>
                      <div className="meta">{formatTime(n.time)}</div>
                    </div>
                    {n.status === "unread" && (
                      <span className={`status-dot ${n.isUrgent ? "red" : "blue"}`}></span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pager">
              <div>Hiển thị {startIdx} - {endIdx} của {total} thông báo</div>
              <div className="pages">
                <button
                  className="page-btn"
                  aria-label="Trang trước"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? "active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="page-btn"
                  aria-label="Trang sau"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Detail */}
          {detail ? (
            <div className="detail">
              <div className="detail-top">
                <div className="back" onClick={() => { setSelectedId(null); setDetail(null); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  Quay lại danh sách
                </div>
                <div className="top-actions">
                  <button className="share-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Chia sẻ
                  </button>
                  <button className="more-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
                  </button>
                </div>
              </div>

              <div className="title-row">
                <div>
                  <span className="kicker">{detail.eyebrow}</span>
                  <h2 className="h1">{detail.title}</h2>
                </div>
                {detail.isUrgent && <span className="urgent-badge">Khẩn cấp</span>}
              </div>

              <div className="author">
                <div className="avatar-org">
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAyMiAyNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTEgMS41TDIgNS41VjEyLjVDMiAxNy41IDYgMjIgMTEgMjMuNUMxNiAyMiAyMCAxNy41IDIwIDEyLjVWNS41TDExIDEuNVoiIHN0cm9rZT0iIzQxMzdGOSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNy41IDEyTDEwIDE0LjVMMTUgOS41IiBzdHJva2U9IiM0MTM3RjkiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="" width={22} height={25} style={{ display: "block" }} />
                </div>
                <div>
                  <div className="author-name">
                    {detail.author.name}
                    {detail.author.verified && (
                      <span className="verified">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    )}
                  </div>
                  <div className="author-meta">
                    {formatTime(detail.author.time)}
                    <span className="dot"></span>
                    {formatDate(detail.author.time)}
                    <span className="dot"></span>
                    <span className="views">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      {detail.author.viewCount.toLocaleString()} lượt xem
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose">
                {detail.body.map((p, i) => <p key={i}>{p}</p>)}
              </div>

              {detail.timeCard && (
                <div className="time-card">
                  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <div>
                    <div className="label">{detail.timeCard.heading}</div>
                    {detail.timeCard.rows.map((r, i) => (
                      <div key={i} className="row">{r}</div>
                    ))}
                  </div>
                </div>
              )}

              {detail.checklist && detail.checklist.length > 0 && (
                <>
                  <div className="section-h"><span className="info-icon">i</span> Nội dung công việc</div>
                  <ul className="check-list">
                    {detail.checklist.map((c, i) => (
                      <li key={i}><span className="check"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> {c}</li>
                    ))}
                  </ul>
                </>
              )}

              {detail.alertText && (
                <div className="alert">
                  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <div>{detail.alertText}</div>
                </div>
              )}

              {detail.signoff && (
                <div className="signoff">
                  {detail.signoff.lines.map((line, i) => <div key={i}>{line}</div>)}
                  <div><strong>{detail.signoff.signedBy}</strong></div>
                </div>
              )}

              {detail.attachments && detail.attachments.length > 0 && (
                <>
                  <div className="attach-title">Tài liệu đính kèm ({detail.attachments.length})</div>
                  <div className="attach-grid">
                    {detail.attachments.map((att) => (
                      <div className="attach" key={att.id}>
                        <div className={`filetype ${att.type}`}>{att.type.toUpperCase()}</div>
                        <div className="info">
                          <div className="name">{att.name}</div>
                          <div className="size">{att.type.toUpperCase()} • {att.sizeLabel}</div>
                        </div>
                        <a
                          className="download"
                          aria-label="Tải xuống"
                          href={att.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="detail" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px", color: "#585c7b", fontSize: "14px", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "32px" }}>📬</div>
              <div>Chọn một thông báo để xem chi tiết</div>
            </div>
          )}
        </div>
      </div>

      {/* Right rail */}
      <aside className="rail">
        <section className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Bộ lọc
            </div>
          </div>
          <div className="field">
            <div className="field-label">Loại thông báo</div>
            <div className="select">Tất cả <svg className="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>
          </div>
          <div className="field">
            <div className="field-label">Danh mục</div>
            <div className="select">Tất cả <svg className="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>
          </div>
          <div className="field">
            <div className="field-label">Khoảng thời gian</div>
            <div className="select">Tất cả thời gian <svg className="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>
          </div>
          <button className="btn-apply">Áp dụng</button>
          <button className="btn-reset">Đặt lại</button>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div className="panel-title">Thông báo nổi bật</div>
            <a href="#" className="link">Xem tất cả <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></a>
          </div>
          <div className="featured-list">
            {items.filter((n) => n.isUrgent).slice(0, 2).map((n) => {
              const color = notifIconColor(n.category);
              return (
                <div key={n.id} className="featured urgent" onClick={() => selectItem(n.id)}>
                  <div className={`thumb ${color}`}>
                    <img src={THUMB_IMG[color] ?? THUMB_IMG.blue} alt="" width={18} height={18} />
                  </div>
                  <div className="body">
                    <div className="kicker-sm">{n.eyebrow}</div>
                    <div className="ftitle">{n.title}</div>
                    <div className="fmeta">{formatDateLong(n.time)} • {formatTime(n.time)}</div>
                  </div>
                </div>
              );
            })}
            {items.filter((n) => n.isUrgent).length === 0 && items.slice(0, 2).map((n) => {
              const color = notifIconColor(n.category);
              return (
                <div key={n.id} className="featured" onClick={() => selectItem(n.id)}>
                  <div className={`thumb ${color}`}>
                    <img src={THUMB_IMG[color] ?? THUMB_IMG.blue} alt="" width={18} height={18} />
                  </div>
                  <div className="body">
                    <div className="ftitle">{n.title}</div>
                    <div className="fmeta">{formatDate(n.time)} • {formatTime(n.time)}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#585c7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div className="panel-title">Danh mục phổ biến</div>
          </div>
          <div className="cat-list">
            {categories.map((c) => (
              <div className="cat" key={c.category}>
                <span>{NOTIF_CATEGORY_LABEL[c.category] ?? c.category}</span>
                <span className="cat-count">{c.count}</span>
              </div>
            ))}
          </div>
          <a href="#" className="cat-link">
            Xem tất cả danh mục
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </section>
      </aside>
    </div>
  );
}
