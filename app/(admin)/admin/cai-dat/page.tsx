"use client";

import { useEffect, useState } from "react";
import { useApiData, useAction } from "@/lib/hooks";
import { apiPatch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface BuildingSettings {
  id: string;
  name: string;
  location: string | null;
  address: string | null;
  description: string | null;
}

export default function AdminCaiDatPage() {
  const toast = useToast();
  const { data, loading, refetch } = useApiData<BuildingSettings>("/admin/settings");

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name ?? "");
      setLocation(data.location ?? "");
      setAddress(data.address ?? "");
      setDescription(data.description ?? "");
    }
  }, [data]);

  const save = useAction(() =>
    apiPatch("/admin/settings", {
      name: name.trim(),
      location: location.trim() || undefined,
      address: address.trim() || undefined,
      description: description.trim() || undefined,
    }),
  );

  function reset() {
    if (data) {
      setName(data.name ?? "");
      setLocation(data.location ?? "");
      setAddress(data.address ?? "");
      setDescription(data.description ?? "");
    }
  }
  async function handleSave() {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên tòa nhà");
      return;
    }
    const res = await save.run();
    if (res !== undefined) {
      toast.success("Đã lưu cấu hình tòa nhà");
      refetch();
    } else if (save.error) toast.error(save.error);
  }

  return (
    <div className="adm-r-cai-dat">
      <div className="st-page">
        <div className="st-hd">
          <div className="st-title">Cài đặt hệ thống</div>
          <div className="st-sub">Cấu hình thông tin tòa nhà, biểu phí, thông báo và bảo mật</div>
        </div>

        <div className="st-card">
          <div className="st-card-hd">
            <div className="st-card-ic" style={{ background: "#efeeff" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
            </div>
            <div>
              <div className="st-card-title">Thông tin tòa nhà</div>
              <div className="st-card-desc">{loading ? "Đang tải..." : "Thông tin cơ bản về dự án và tòa nhà"}</div>
            </div>
          </div>
          <div className="st-grid">
            <div className="st-field">
              <label className="st-label">Tên tòa nhà</label>
              <input className="st-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="st-field">
              <label className="st-label">Khu vực</label>
              <input className="st-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Quận / Khu" />
            </div>
            <div className="st-field full">
              <label className="st-label">Địa chỉ</label>
              <input className="st-input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="st-field full">
              <label className="st-label">Mô tả</label>
              <input className="st-input" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Các cấu hình nâng cao (phí, thông báo, bảo mật) — hiển thị tham khảo */}
        <div className="st-card">
          <div className="st-card-hd">
            <div className="st-card-ic" style={{ background: "#fff3da" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            </div>
            <div>
              <div className="st-card-title">Thông báo & Bảo mật</div>
              <div className="st-card-desc">Cấu hình kênh gửi và bảo mật (đang phát triển)</div>
            </div>
          </div>
          <div className="st-row"><div className="st-row-info"><div className="n">Gửi qua ứng dụng</div><div className="d">Push notification tới app cư dân</div></div><div className="sw on"></div></div>
          <div className="st-row"><div className="st-row-info"><div className="n">Tự động nhắc nợ phí</div><div className="d">Nhắc cư dân chưa nộp phí trước hạn 3 ngày</div></div><div className="sw on"></div></div>
          <div className="st-row"><div className="st-row-info"><div className="n">Ghi log hoạt động</div><div className="d">Lưu lịch sử thao tác của tài khoản quản trị</div></div><div className="sw on"></div></div>
        </div>

        <div className="st-save">
          <button className="st-btn" onClick={reset} disabled={save.loading}>Hủy</button>
          <button className="st-btn primary" onClick={handleSave} disabled={save.loading}>
            {save.loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
