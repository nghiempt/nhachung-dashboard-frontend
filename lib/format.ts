// Vietnamese-friendly formatting helpers shared across dashboard pages.

const MONTHS = [
  "tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
  "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12",
];

function toDate(input?: string | Date | null): Date | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/** "20/05/2026" */
export function formatDate(input?: string | Date | null): string {
  const d = toDate(input);
  if (!d) return "";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** "20 tháng 5, 2026" */
export function formatDateLong(input?: string | Date | null): string {
  const d = toDate(input);
  if (!d) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

/** "10:30 AM" */
export function formatTime(input?: string | Date | null): string {
  const d = toDate(input);
  if (!d) return "";
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${pad(h)}:${pad(m)} ${ap}`;
}

/** "10:30 AM • 20/05/2026" */
export function formatDateTime(input?: string | Date | null): string {
  const d = toDate(input);
  if (!d) return "";
  return `${formatTime(d)} • ${formatDate(d)}`;
}

/** Relative label: "2 giờ trước", "Hôm qua", "20/05/2026" */
export function timeAgo(input?: string | Date | null): string {
  const d = toDate(input);
  if (!d) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hôm qua";
  if (days < 7) return `${days} ngày trước`;
  return formatDate(d);
}

/** 7080000 -> "7.080.000đ" */
export function formatVnd(amount?: number | null): string {
  if (amount == null) return "—";
  return `${amount.toLocaleString("vi-VN")}đ`;
}

/** 1256 -> "1.256" */
export function formatNumber(n?: number | null): string {
  if (n == null) return "0";
  return n.toLocaleString("vi-VN");
}

/** Age in years from a date of birth. */
export function ageFrom(input?: string | Date | null): number | null {
  const d = toDate(input);
  if (!d) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
