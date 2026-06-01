// Maps the backend's SEMANTIC enums back to the presentational values the
// existing UI expects, so pages stay visually identical after wiring real data.

// ── Notifications ────────────────────────────────────────────
export type IconColor = "red" | "blue" | "orange" | "violet" | "green" | "mint" | "amber";

const NOTIF_CATEGORY_COLOR: Record<string, IconColor> = {
  urgent: "red",
  security: "red",
  maintenance: "red",
  finance: "blue",
  announcement: "orange",
  community: "violet",
  event: "green",
};

export function notifIconColor(category?: string): IconColor {
  return NOTIF_CATEGORY_COLOR[category ?? ""] ?? "blue";
}

export const NOTIF_CATEGORY_LABEL: Record<string, string> = {
  urgent: "Khẩn cấp",
  security: "An ninh",
  maintenance: "Bảo trì & Vận hành",
  finance: "Tài chính & Phí",
  announcement: "Thông báo chung",
  community: "Sự kiện cộng đồng",
  event: "Sự kiện",
};

// ── Feedback status ──────────────────────────────────────────
export interface BadgeStyle {
  label: string;
  bg: string;
  color: string;
  dot: string;
}

export const FEEDBACK_STATUS: Record<string, BadgeStyle> = {
  processing: { label: "Đang xử lý", bg: "#e7eeff", color: "#2f7bf6", dot: "#2f7bf6" },
  awaiting: { label: "Chờ phản hồi", bg: "#fff1de", color: "#c87a13", dot: "#f5a623" },
  completed: { label: "Đã hoàn thành", bg: "#e3fbed", color: "#1c9d5f", dot: "#1cbf6a" },
  rejected: { label: "Từ chối", bg: "#ffeded", color: "#ef4444", dot: "#ef4444" },
};

export function feedbackStatus(status?: string): BadgeStyle {
  return FEEDBACK_STATUS[status ?? ""] ?? FEEDBACK_STATUS.processing;
}

export const FEEDBACK_PRIORITY: Record<string, { label: string; color: string }> = {
  low: { label: "Thấp", color: "#1c9d5f" },
  medium: { label: "Trung bình", color: "#f5a623" },
  high: { label: "Cao", color: "#ef7a13" },
  urgent: { label: "Khẩn cấp", color: "#ef4444" },
};

export function feedbackPriority(p?: string) {
  return FEEDBACK_PRIORITY[p ?? ""] ?? FEEDBACK_PRIORITY.medium;
}

// ── Documents ────────────────────────────────────────────────
export const DOC_FILETYPE_COLOR: Record<string, string> = {
  pdf: "#ef4444",
  docx: "#2f7bf6",
  doc: "#2f7bf6",
  xlsx: "#1cbf6a",
  xls: "#1cbf6a",
  pptx: "#f5a623",
  img: "#8b5cf6",
  other: "#737373",
};

export function docColor(fileType?: string): string {
  return DOC_FILETYPE_COLOR[fileType ?? ""] ?? "#737373";
}

export function docTypeLabel(fileType?: string): string {
  return (fileType ?? "file").toUpperCase();
}

// Category accent classes mirror the original hardcoded UI buckets.
export const DOC_CATEGORY_CLASS: Record<string, string> = {
  "Nội quy - Quy định": "purple",
  "Biên bản họp": "green",
  "Hợp đồng - Biểu mẫu": "orange",
  "Hướng dẫn sử dụng": "blue",
  "Tài liệu khác": "gray",
};

// ── News ─────────────────────────────────────────────────────
export const NEWS_CATEGORY: Record<string, { label: string; bg: string; color: string }> = {
  announcement: { label: "Thông báo BQT", bg: "#e4f1ff", color: "#1561c0" },
  event: { label: "Sự kiện", bg: "#e0f7f4", color: "#0d7a6a" },
  maintenance: { label: "Bảo trì", bg: "#fff3e0", color: "#b45309" },
  community: { label: "Cộng đồng", bg: "#e3fbed", color: "#1c9d5f" },
  emergency: { label: "Khẩn cấp", bg: "#fff0f0", color: "#f5222d" },
};

export function newsCategory(category?: string) {
  return NEWS_CATEGORY[category ?? ""] ?? NEWS_CATEGORY.announcement;
}

// ── Gender / verification (personal pages) ───────────────────
export const GENDER_LABEL: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

export const ID_TYPE_LABEL: Record<string, string> = {
  cccd: "CCCD",
  cmnd: "CMND",
  passport: "Hộ chiếu",
  birth_certificate: "Giấy khai sinh",
};

export const VERIFICATION_LABEL: Record<string, string> = {
  verified: "Đã xác minh",
  pending: "Chờ xác minh",
  missing: "Chưa có",
};

export const VEHICLE_TYPE_LABEL: Record<string, string> = {
  car: "Ô tô",
  motorbike: "Xe máy",
  bicycle: "Xe đạp",
  other: "Khác",
};

export const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  paid: { label: "Đã thanh toán", color: "#1c9d5f" },
  unpaid: { label: "Chưa thanh toán", color: "#ef4444" },
  overdue: { label: "Quá hạn", color: "#ef4444" },
};

// ── Transparency section ─────────────────────────────────────
export const TREND: Record<string, { color: string; arrow: string }> = {
  up: { color: "#1c9d5f", arrow: "↑" },
  down: { color: "#ef4444", arrow: "↓" },
  neutral: { color: "#959595", arrow: "→" },
};
export function trendDir(pct?: number | null, direction?: string): { color: string; arrow: string } {
  if (direction) return TREND[direction] ?? TREND.neutral;
  if (pct == null || pct === 0) return TREND.neutral;
  return pct > 0 ? TREND.up : TREND.down;
}

export const WORKORDER_STATUS: Record<string, BadgeStyle> = {
  processing: { label: "Đang xử lý", bg: "#e7eeff", color: "#2f7bf6", dot: "#2f7bf6" },
  completed: { label: "Hoàn thành", bg: "#e3fbed", color: "#1c9d5f", dot: "#1cbf6a" },
  overdue: { label: "Quá hạn", bg: "#ffeded", color: "#ef4444", dot: "#ef4444" },
};
export const WORKORDER_PRIORITY: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: "Khẩn cấp", color: "#ef4444", bg: "#ffeded" },
  medium: { label: "Trung bình", color: "#c8761b", bg: "#fff1de" },
  low: { label: "Thấp", color: "#1c9d5f", bg: "#e3fbed" },
};
export const WORKORDER_CATEGORY: Record<string, string> = {
  electricity: "Điện", water: "Nước", elevator: "Thang máy",
  fire_safety: "PCCC", common_area: "Khu chung", other: "Khác",
};
export const SYSTEM_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  normal: { label: "Bình thường", color: "#1c9d5f", bg: "#e3fbed" },
  maintenance: { label: "Bảo trì", color: "#c8761b", bg: "#fff1de" },
  warning: { label: "Cảnh báo", color: "#ef4444", bg: "#ffeded" },
};
export const MAINTENANCE_STATUS: Record<string, BadgeStyle> = {
  completed: { label: "Hoàn thành", bg: "#e3fbed", color: "#1c9d5f", dot: "#1cbf6a" },
  in_progress: { label: "Đang thực hiện", bg: "#e7eeff", color: "#2f7bf6", dot: "#2f7bf6" },
  planned: { label: "Đã lên KH", bg: "#e7eeff", color: "#2f7bf6", dot: "#2f7bf6" },
  tentative: { label: "Dự kiến", bg: "#f0f0f3", color: "#737373", dot: "#b4b7c9" },
};
export const KPI_GRADE: Record<string, { label: string; color: string; bg: string }> = {
  excellent: { label: "Xuất sắc", color: "#1c9d5f", bg: "#e3fbed" },
  good: { label: "Tốt", color: "#2f7bf6", bg: "#e7eeff" },
  needs_improvement: { label: "Cần cải thiện", color: "#c8761b", bg: "#fff1de" },
};
export const KPI_RESULT: Record<string, { label: string; color: string; bg: string }> = {
  exceeded: { label: "Vượt", color: "#1c9d5f", bg: "#e3fbed" },
  achieved: { label: "Đạt", color: "#2f7bf6", bg: "#e7eeff" },
  needs_improvement: { label: "Cần cải thiện", color: "#ef4444", bg: "#ffeded" },
};
export const REPORT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Chưa soạn", color: "#737373", bg: "#f0f0f3" },
  pending: { label: "Chờ duyệt", color: "#c8761b", bg: "#fff1de" },
  published: { label: "Đã phát hành", color: "#1c9d5f", bg: "#e3fbed" },
};
export const REPORT_PERIOD: Record<string, string> = {
  month: "Báo cáo tháng", quarter: "Báo cáo quý", year: "Báo cáo năm",
};
export const ARCHIVE_CATEGORY: Record<string, { label: string; color: string }> = {
  finance: { label: "Tài chính", color: "#1c9d5f" },
  operations: { label: "Vận hành", color: "#1870c4" },
  security: { label: "An ninh", color: "#f5222d" },
  board: { label: "Ban quản trị", color: "#5a3ad9" },
  maintenance: { label: "Bảo trì", color: "#c8761b" },
  other: { label: "Khác", color: "#737373" },
};
