"use client";

import { useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPatch } from "@/lib/api";
import { useAdminList, inputStyle } from "@/lib/admin";
import { useToast } from "@/components/ui/Toast";
import { AdminPagination } from "@/components/admin/Pagination";
import { StatCard } from "@/components/admin/ui";

interface Member {
  id: string;
  accountId: string;
  fullName: string;
  email: string;
  role: string;
  isOwner: boolean;
}

const ROLE_LABEL: Record<string, string> = {
  resident: "Cư dân",
  manager: "Ban quản lý",
  admin: "Quản trị",
};
const ROLE_PILL: Record<string, string> = {
  resident: "s-gray",
  manager: "s-blue",
  admin: "s-violet",
};
const PALETTE = ["#4137f9", "#1c9d5f", "#c8761b", "#2f7bf6", "#5a3ad9", "#e8736d"];
function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[p.length - 2]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase() || name.slice(0, 2).toUpperCase();
}

export default function AdminPhanQuyenPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { items, meta, loading, refetch } = useAdminList<Member>("/admin/roles", {
    page,
    limit: 10,
    search: search || undefined,
  });
  const { data: summary, refetch: refetchSummary } = useApiData<Record<string, number>>("/admin/roles/summary");
  const setRole = useAction((id: string, role: string) => apiPatch(`/admin/roles/${id}`, { role }));

  async function changeRole(m: Member, role: string) {
    if (role === m.role) return;
    const res = await setRole.run(m.id, role);
    if (res !== undefined) {
      toast.success(`Đã đổi vai trò ${m.fullName} → ${ROLE_LABEL[role] ?? role}`);
      refetch();
      refetchSummary();
    }
  }

  const adminCount = (summary?.admin ?? 0) + (summary?.manager ?? 0);

  return (
    <div className="adm-r-phan-quyen">
      <div className="mg-page">
        <div className="mg-hd">
          <div>
            <h1 className="mg-title">Phân quyền & Tài khoản</h1>
            <p className="mg-sub">Quản lý vai trò và phân quyền truy cập của thành viên tòa nhà</p>
          </div>
        </div>

        <div className="mg-stats">
          <StatCard bg="#efeeff" color="#4137f9" label="Tài khoản quản trị" value={adminCount}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          </StatCard>
          <StatCard bg="#efeaff" color="#5a3ad9" label="Ban quản lý" value={summary?.manager ?? 0}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </StatCard>
          <StatCard bg="#e6f7f1" color="#1c9d5f" label="Cư dân" value={summary?.resident ?? 0}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          </StatCard>
        </div>

        <div className="mg-toolbar">
          <div className="mg-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Tìm theo tên, email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="mg-card">
          <table className="mg-tbl">
            <thead>
              <tr><th>Tài khoản</th><th>Vai trò hiện tại</th><th>Đổi vai trò</th></tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: 24, color: "#585c7b" }}>Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: 24, color: "#585c7b" }}>Không có thành viên nào</td></tr>
              ) : (
                items.map((m, i) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: PALETTE[i % PALETTE.length], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{initials(m.fullName)}</div>
                        <div>
                          <div className="mg-pname">{m.fullName}</div>
                          <div className="mg-pmeta">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`mg-pill ${ROLE_PILL[m.role] ?? "s-gray"}`}>{ROLE_LABEL[m.role] ?? m.role}</span></td>
                    <td>
                      <select
                        value={m.role}
                        onChange={(e) => changeRole(m, e.target.value)}
                        disabled={setRole.loading}
                        style={{ ...inputStyle, width: "auto", height: 36 }}
                      >
                        <option value="resident">Cư dân</option>
                        <option value="manager">Ban quản lý</option>
                        <option value="admin">Quản trị</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <AdminPagination meta={meta} page={page} onPage={setPage} unit="tài khoản" loading={loading} />
        </div>
      </div>
    </div>
  );
}
