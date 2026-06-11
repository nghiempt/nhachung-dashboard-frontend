"use client";

import { useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useAdminList, inputStyle, labelStyle } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AdminPagination } from "@/components/admin/Pagination";
import { AdminModal, StatCard } from "@/components/admin/ui";

interface DocItem {
  id: string;
  name: string;
  fileType: string;
  sizeBytes: number | null;
  url: string;
  categoryId: string | null;
  categoryName: string | null;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
}
interface Category {
  id: string;
  name: string;
  documentCount: number;
}
interface UploadResult {
  url: string;
  key: string;
  sizeBytes: number;
}

function fileTypeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "PDF";
  if (ext === "doc" || ext === "docx") return "DOCX";
  if (ext === "xls" || ext === "xlsx") return "XLSX";
  if (ext === "ppt" || ext === "pptx") return "PPTX";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "IMG";
  return "OTHER";
}
function fmtSize(b: number | null) {
  if (!b) return "—";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminTaiLieuPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { items, meta, loading, refetch } = useAdminList<DocItem>("/admin/documents", {
    page,
    limit: 10,
    search: search || undefined,
    categoryId: categoryId || undefined,
  });
  const { data: categories, refetch: refetchCats } = useApiData<Category[]>("/admin/documents/categories");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cat, setCat] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const save = useAction(async () => {
    if (!file) throw new Error("Vui lòng chọn tệp");
    const fd = new FormData();
    fd.append("file", file);
    const up = await apiPost<UploadResult>("/uploads?folder=documents", fd);
    try {
      await apiPost("/admin/documents", {
        name: name.trim() || file.name,
        url: up.url,
        sizeBytes: up.sizeBytes,
        fileType: fileTypeFromName(file.name),
        categoryId: cat || undefined,
      });
    } catch (err) {
      // Metadata save failed — remove the just-uploaded file so it doesn't
      // become an orphaned object in storage.
      try {
        await apiDelete("/uploads", { body: { key: up.key } });
      } catch {
        /* best-effort cleanup; surface the original error below */
      }
      throw err;
    }
  });
  const remove = useAction((id: string) => apiDelete(`/admin/documents/${id}`));

  function openAdd() {
    setName("");
    setCat("");
    setFile(null);
    save.setError(null);
    setOpen(true);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      save.setError("Vui lòng chọn tệp tài liệu");
      return;
    }
    const res = await save.run();
    if (res !== undefined) {
      setOpen(false);
      toast.success("Đã tải lên tài liệu");
      refetch();
      refetchCats();
    } else if (save.error) toast.error(save.error);
  }
  async function handleDelete(d: DocItem) {
    if (typeof window !== "undefined" && !window.confirm(`Xoá tài liệu "${d.name}"?`)) return;
    const res = await remove.run(d.id);
    if (res !== undefined) {
      toast.success("Đã xoá tài liệu");
      refetch();
      refetchCats();
    }
  }

  return (
    <div className="adm-r-tai-lieu">
      <div className="mg-page">
        <div className="mg-hd">
          <div>
            <h1 className="mg-title">Quản lý tài liệu</h1>
            <p className="mg-sub">Lưu trữ, phân loại và phân quyền truy cập tài liệu tòa nhà</p>
          </div>
          <button className="mg-btn" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Tải lên tài liệu
          </button>
        </div>

        <div className="mg-toolbar">
          <div className="mg-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Tìm theo tên tài liệu..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} style={{ ...inputStyle, width: "auto", height: 40 }}>
            <option value="">Mọi danh mục</option>
            {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="mg-card">
          <table className="mg-tbl">
            <thead>
              <tr><th>Tài liệu</th><th>Danh mục</th><th>Dung lượng</th><th>Lượt tải</th><th>Ngày tải lên</th><th>Tác vụ</th></tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24, color: "#585c7b" }}>Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24, color: "#585c7b" }}>Chưa có tài liệu nào</td></tr>
              ) : (
                items.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-272727)" }}>
                      <a href={d.url} target="_blank" rel="noreferrer" style={{ color: "#4137f9", textDecoration: "none" }}>{d.name}</a>
                      <span className="mg-pill s-gray" style={{ marginLeft: 8 }}>{d.fileType}</span>
                    </td>
                    <td>{d.categoryName ?? "—"}</td>
                    <td>{fmtSize(d.sizeBytes)}</td>
                    <td>{d.downloadCount}</td>
                    <td>{formatDate(d.createdAt)}</td>
                    <td>
                      <div className="mg-act-btns">
                        <button className="mg-icon-btn" title="Xoá" onClick={() => handleDelete(d)} disabled={remove.loading}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <AdminPagination meta={meta} page={page} onPage={setPage} unit="tài liệu" loading={loading} />
        </div>
      </div>

      {open && (
        <AdminModal title="Tải lên tài liệu" onClose={() => setOpen(false)} onSubmit={submit} submitting={save.loading} submitLabel="Tải lên" error={save.error}>
          <div>
            <label style={labelStyle}>Tệp tài liệu *</label>
            <input type="file" style={{ ...inputStyle, height: "auto", padding: 10 }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <label style={labelStyle}>Tên hiển thị</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder={file?.name ?? "Tên tài liệu"} />
          </div>
          <div>
            <label style={labelStyle}>Danh mục</label>
            <select style={inputStyle} value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">— Không phân loại —</option>
              {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
