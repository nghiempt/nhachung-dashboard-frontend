"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useApiData, useAction } from "@/lib/hooks";
import { formatDate, timeAgo } from "@/lib/format";
import { GENDER_LABEL, ID_TYPE_LABEL, VEHICLE_TYPE_LABEL } from "@/lib/ui-maps";
import { useUser } from "@/components/providers/UserProvider";

interface Vehicle {
  id: string;
  vehicleName: string | null;
  licensePlate: string;
  vehicleType: string;
  parkingLocation: string | null;
}

interface EmergencyContact {
  id: string;
  contactName: string;
  relationship: string | null;
  location: string | null;
  phoneNumber: string;
}

interface ProfileData {
  id: string;
  avatarUrl: string | null;
  fullName: string;
  displayName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  occupation: string | null;
  permanentAddress: string | null;
  location: string | null;
  isVerifiedResident: boolean;
  completionPercentage: number;
  idType: string | null;
  idNumber: string | null;
  idVerified: boolean;
  idIssueDate: string | null;
  idIssueLocation: string | null;
  phoneNumber: string | null;
  phoneVerified: boolean;
  secondaryPhone: string | null;
  email: string | null;
  emailVerified: boolean;
  zaloNumber: string | null;
  zaloLinked: boolean;
  vehicles: Vehicle[];
  emergencyContacts: EmergencyContact[];
}

interface Activity {
  id: string;
  type: string;
  text: string;
  color: string;
  createdAt: string;
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const VerifiedBadge = () => (
  <span className="verified-badge">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    Đã xác minh
  </span>
);

const CarIcon = ({ stroke }: { stroke: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 11l2-5h10l2 5H5z" />
    <rect x="2" y="11" width="20" height="5" rx="1" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
    <line x1="9" y1="16" x2="15" y2="16" />
  </svg>
);

const MotorbikeIcon = ({ stroke }: { stroke: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <path d="M15 6h3l3 6M9 17h6l-3-10h-2M5.5 14L8 9h7" />
  </svg>
);

// Inline styles to keep edit forms visually consistent with the page.
const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 14,
  fontWeight: 500,
  color: "#272727",
  padding: "8px 10px",
  border: "1px solid #d8dae6",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
};
const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#585c7b",
  textTransform: "uppercase",
  letterSpacing: ".4px",
};
const btnSave: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#fff",
  background: "#4137f9",
  border: "none",
  borderRadius: 8,
  padding: "6px 14px",
  cursor: "pointer",
};
const btnCancel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#585c7b",
  background: "#f0f0f5",
  border: "none",
  borderRadius: 8,
  padding: "6px 14px",
  cursor: "pointer",
};
const btnRemove: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#f5222d",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};

const vehicleAccent: Record<string, { iconBg: string; iconStroke: string; badgeBg: string; badgeColor: string }> = {
  car: { iconBg: "#efeeff", iconStroke: "#4137f9", badgeBg: "#e3fbed", badgeColor: "#1c9d5f" },
  motorbike: { iconBg: "#e4f1ff", iconStroke: "#1870c4", badgeBg: "#e4f1ff", badgeColor: "#1870c4" },
  bicycle: { iconBg: "#e3fbed", iconStroke: "#1c9d5f", badgeBg: "#e3fbed", badgeColor: "#1c9d5f" },
  other: { iconBg: "#f0f0f5", iconStroke: "#585c7b", badgeBg: "#f0f0f5", badgeColor: "#585c7b" },
};

const contactAvatarColors = [
  { background: "#efeeff", color: "#4137f9" },
  { background: "#e3fbed", color: "#1c9d5f" },
  { background: "#fff1de", color: "#c8761b" },
  { background: "#e4f1ff", color: "#1870c4" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function HoSoPage() {
  const { refreshProfile } = useUser();
  const { data: profile, loading, refetch } = useApiData<ProfileData>("/profile/me");
  const { data: activities } = useApiData<Activity[]>("/profile/activities");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Edit basic info ──
  const [editBasic, setEditBasic] = useState(false);
  const [basicForm, setBasicForm] = useState<Partial<ProfileData>>({});

  // ── Edit ID ──
  const [editId, setEditId] = useState(false);
  const [idForm, setIdForm] = useState<Partial<ProfileData>>({});

  // ── Edit contact ──
  const [editContact, setEditContact] = useState(false);
  const [contactForm, setContactForm] = useState<Partial<ProfileData>>({});

  // ── Vehicle add form ──
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ vehicleName: "", licensePlate: "", vehicleType: "car", parkingLocation: "" });

  // ── Contact add form ──
  const [showContactForm, setShowContactForm] = useState(false);
  const [newContact, setNewContact] = useState({ contactName: "", relationship: "", location: "", phoneNumber: "" });

  useEffect(() => {
    if (profile && editBasic) {
      setBasicForm({
        fullName: profile.fullName,
        displayName: profile.displayName,
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
        gender: profile.gender ?? "male",
        nationality: profile.nationality,
        occupation: profile.occupation,
        permanentAddress: profile.permanentAddress,
      });
    }
  }, [editBasic, profile]);

  useEffect(() => {
    if (profile && editId) {
      setIdForm({
        idType: profile.idType ?? "cccd",
        idNumber: profile.idNumber,
        idIssueDate: profile.idIssueDate ? profile.idIssueDate.slice(0, 10) : "",
        idIssueLocation: profile.idIssueLocation,
      });
    }
  }, [editId, profile]);

  useEffect(() => {
    if (profile && editContact) {
      setContactForm({
        phoneNumber: profile.phoneNumber,
        secondaryPhone: profile.secondaryPhone,
        email: profile.email,
        zaloNumber: profile.zaloNumber,
      });
    }
  }, [editContact, profile]);

  const reload = async () => {
    refetch();
    await refreshProfile();
  };

  const saveBasic = useAction(async () => {
    await apiPatch("/profile", basicForm);
    await reload();
    setEditBasic(false);
  });
  const saveId = useAction(async () => {
    await apiPatch("/profile", idForm);
    await reload();
    setEditId(false);
  });
  const saveContact = useAction(async () => {
    await apiPatch("/profile", contactForm);
    await reload();
    setEditContact(false);
  });

  const addVehicle = useAction(async () => {
    await apiPost("/profile/vehicles", {
      vehicleName: vehicleForm.vehicleName || undefined,
      licensePlate: vehicleForm.licensePlate,
      vehicleType: vehicleForm.vehicleType,
      parkingLocation: vehicleForm.parkingLocation || undefined,
    });
    await reload();
    setShowVehicleForm(false);
    setVehicleForm({ vehicleName: "", licensePlate: "", vehicleType: "car", parkingLocation: "" });
  });
  const removeVehicle = useAction(async (id: string) => {
    await apiDelete(`/profile/vehicles/${id}`);
    await reload();
  });

  const addContact = useAction(async () => {
    await apiPost("/profile/contacts", {
      contactName: newContact.contactName,
      relationship: newContact.relationship || undefined,
      location: newContact.location || undefined,
      phoneNumber: newContact.phoneNumber,
    });
    await reload();
    setShowContactForm(false);
    setNewContact({ contactName: "", relationship: "", location: "", phoneNumber: "" });
  });
  const removeContact = useAction(async (id: string) => {
    await apiDelete(`/profile/contacts/${id}`);
    await reload();
  });

  const uploadAvatar = useAction(async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiPost<{ url: string }>("/uploads?folder=avatars", fd);
    await apiPatch("/profile", { avatarUrl: res.url });
    await reload();
  });

  const onAvatarClick = () => fileInputRef.current?.click();
  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatar.run(file);
    e.target.value = "";
  };

  if (loading && !profile) {
    return (
      <div className="profile-page">
        <div style={{ padding: 40, color: "#585c7b", fontSize: 14 }}>Đang tải...</div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="profile-page">
        <div style={{ padding: 40, color: "#585c7b", fontSize: 14 }}>Không có dữ liệu.</div>
      </div>
    );
  }

  const vehicles = profile.vehicles ?? [];
  const contacts = profile.emergencyContacts ?? [];
  const pct = profile.completionPercentage ?? 0;

  return (
    <div className="profile-page">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarChange} style={{ display: "none" }} />

      {/* ── Banner ── */}
      <div className="profile-banner">
        <div className="banner-avatar-wrap">
          <img
            className="banner-avatar"
            src={profile.avatarUrl ?? "https://www.figma.com/api/mcp/asset/ee21e768-a070-4e15-ad43-73a28943d4ee"}
            alt={profile.fullName}
          />
          <div className="banner-avatar-edit" onClick={onAvatarClick} style={{ cursor: "pointer" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
        </div>
        <div className="banner-info">
          <div className="banner-name">{profile.fullName}</div>
          <div className="banner-tags">
            <div className="banner-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              Căn hộ A-12.05
            </div>
            <div className="banner-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {profile.location ?? "—"}
            </div>
            {profile.isVerifiedResident && (
              <div className="banner-tag" style={{ background: "rgba(74,222,128,.2)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ color: "#4ade80" }}>Cư dân đã xác minh</span>
              </div>
            )}
          </div>
        </div>
        <div className="banner-actions">
          <button className="btn-banner-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Tải thẻ cư dân
          </button>
          <button className="btn-banner-primary" onClick={() => setEditBasic(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Chỉnh sửa hồ sơ
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="profile-body">
        {/* Left main */}
        <div className="profile-main">
          {/* Hoàn thiện hồ sơ */}
          <div className="section-card" style={{ padding: "18px 22px" }}>
            <div className="completion-wrap">
              <div className="completion-hd">
                <span className="completion-lbl">Độ hoàn thiện hồ sơ</span>
                <span className="completion-pct">{pct}%</span>
              </div>
              <div className="completion-bar"><div className="completion-fill" style={{ width: `${pct}%` }}></div></div>
            </div>
            <div className="completion-items">
              <div className={`comp-item ${profile.fullName ? "comp-done" : "comp-miss"}`}><CheckIcon /><span>Thông tin cơ bản</span></div>
              <div className={`comp-item ${profile.phoneVerified ? "comp-done" : "comp-miss"}`}><CheckIcon /><span>Số điện thoại đã xác minh</span></div>
              <div className={`comp-item ${profile.idVerified ? "comp-done" : "comp-miss"}`}><CheckIcon /><span>CCCD đã tải lên</span></div>
              <div className={`comp-item ${vehicles.length ? "comp-done" : "comp-miss"}`}><CheckIcon /><span>Phương tiện đã đăng ký</span></div>
              {!profile.emailVerified && (
                <div className="comp-item comp-miss" style={{ color: "#c8761b" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>Email chưa xác minh</span>
                </div>
              )}
              {contacts.length === 0 && (
                <div className="comp-item comp-miss" style={{ color: "#585c7b" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Thêm liên hệ khẩn cấp</span>
                </div>
              )}
            </div>
          </div>

          {/* Thông tin cơ bản */}
          <div className="section-card">
            <div className="section-hd">
              <div className="section-title">
                <div className="section-title-icon" style={{ background: "#efeeff" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                Thông tin cơ bản
              </div>
              {!editBasic && (
                <button className="section-edit" onClick={() => setEditBasic(true)}><EditIcon />Chỉnh sửa</button>
              )}
            </div>
            {!editBasic ? (
              <div className="info-grid">
                {[
                  { l: "Họ và tên", v: profile.fullName || "—" },
                  { l: "Tên hiển thị", v: profile.displayName || "—" },
                  { l: "Ngày sinh", v: profile.dateOfBirth ? formatDate(profile.dateOfBirth) : "—" },
                  { l: "Giới tính", v: GENDER_LABEL[profile.gender ?? ""] ?? "—" },
                  { l: "Quốc tịch", v: profile.nationality || "—" },
                  { l: "Nghề nghiệp", v: profile.occupation || "—" },
                ].map((i) => (
                  <div className="info-item" key={i.l}>
                    <div className="info-label">{i.l}</div>
                    <div className="info-value">{i.v}</div>
                  </div>
                ))}
                <div className="info-divider"></div>
                <div className="info-item info-full">
                  <div className="info-label">Địa chỉ thường trú</div>
                  <div className="info-value">{profile.permanentAddress || "—"}</div>
                </div>
              </div>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <div style={labelStyle}>Họ và tên</div>
                  <input style={inputStyle} value={basicForm.fullName ?? ""} onChange={(e) => setBasicForm({ ...basicForm, fullName: e.target.value })} />
                </div>
                <div className="info-item">
                  <div style={labelStyle}>Tên hiển thị</div>
                  <input style={inputStyle} value={basicForm.displayName ?? ""} onChange={(e) => setBasicForm({ ...basicForm, displayName: e.target.value })} />
                </div>
                <div className="info-item">
                  <div style={labelStyle}>Ngày sinh</div>
                  <input type="date" style={inputStyle} value={(basicForm.dateOfBirth as string) ?? ""} onChange={(e) => setBasicForm({ ...basicForm, dateOfBirth: e.target.value })} />
                </div>
                <div className="info-item">
                  <div style={labelStyle}>Giới tính</div>
                  <select style={inputStyle} value={basicForm.gender ?? "male"} onChange={(e) => setBasicForm({ ...basicForm, gender: e.target.value })}>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="info-item">
                  <div style={labelStyle}>Quốc tịch</div>
                  <input style={inputStyle} value={basicForm.nationality ?? ""} onChange={(e) => setBasicForm({ ...basicForm, nationality: e.target.value })} />
                </div>
                <div className="info-item">
                  <div style={labelStyle}>Nghề nghiệp</div>
                  <input style={inputStyle} value={basicForm.occupation ?? ""} onChange={(e) => setBasicForm({ ...basicForm, occupation: e.target.value })} />
                </div>
                <div className="info-divider"></div>
                <div className="info-item info-full">
                  <div style={labelStyle}>Địa chỉ thường trú</div>
                  <input style={inputStyle} value={basicForm.permanentAddress ?? ""} onChange={(e) => setBasicForm({ ...basicForm, permanentAddress: e.target.value })} />
                </div>
                <div className="info-item info-full" style={{ display: "flex", gap: 8, flexDirection: "row", alignItems: "center" }}>
                  <button style={btnSave} disabled={saveBasic.loading} onClick={() => saveBasic.run()}>{saveBasic.loading ? "Đang lưu..." : "Lưu"}</button>
                  <button style={btnCancel} onClick={() => setEditBasic(false)}>Hủy</button>
                  {saveBasic.error && <span style={{ color: "#f5222d", fontSize: 12 }}>{saveBasic.error}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Giấy tờ tùy thân */}
          <div className="section-card">
            <div className="section-hd">
              <div className="section-title">
                <div className="section-title-icon" style={{ background: "#e4f1ff" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1870c4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                Giấy tờ tùy thân
              </div>
              {!editId && (
                <button className="section-edit" onClick={() => setEditId(true)}><EditIcon />Cập nhật</button>
              )}
            </div>
            {!editId ? (
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Số {ID_TYPE_LABEL[profile.idType ?? ""] ?? "giấy tờ"}</div>
                  <div className="info-value mono">
                    {profile.idNumber || "—"}
                    {profile.idVerified && <VerifiedBadge />}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Ngày cấp</div>
                  <div className="info-value">{profile.idIssueDate ? formatDate(profile.idIssueDate) : "—"}</div>
                </div>
                <div className="info-item info-full">
                  <div className="info-label">Nơi cấp</div>
                  <div className="info-value">{profile.idIssueLocation || "—"}</div>
                </div>
              </div>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <div style={labelStyle}>Loại giấy tờ</div>
                  <select style={inputStyle} value={idForm.idType ?? "cccd"} onChange={(e) => setIdForm({ ...idForm, idType: e.target.value })}>
                    <option value="cccd">CCCD</option>
                    <option value="cmnd">CMND</option>
                    <option value="passport">Hộ chiếu</option>
                    <option value="birth_certificate">Giấy khai sinh</option>
                  </select>
                </div>
                <div className="info-item">
                  <div style={labelStyle}>Số giấy tờ</div>
                  <input style={inputStyle} value={idForm.idNumber ?? ""} onChange={(e) => setIdForm({ ...idForm, idNumber: e.target.value })} />
                </div>
                <div className="info-item">
                  <div style={labelStyle}>Ngày cấp</div>
                  <input type="date" style={inputStyle} value={(idForm.idIssueDate as string) ?? ""} onChange={(e) => setIdForm({ ...idForm, idIssueDate: e.target.value })} />
                </div>
                <div className="info-item info-full">
                  <div style={labelStyle}>Nơi cấp</div>
                  <input style={inputStyle} value={idForm.idIssueLocation ?? ""} onChange={(e) => setIdForm({ ...idForm, idIssueLocation: e.target.value })} />
                </div>
                <div className="info-item info-full" style={{ display: "flex", gap: 8, flexDirection: "row", alignItems: "center" }}>
                  <button style={btnSave} disabled={saveId.loading} onClick={() => saveId.run()}>{saveId.loading ? "Đang lưu..." : "Lưu"}</button>
                  <button style={btnCancel} onClick={() => setEditId(false)}>Hủy</button>
                  {saveId.error && <span style={{ color: "#f5222d", fontSize: 12 }}>{saveId.error}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Thông tin liên hệ */}
          <div className="section-card">
            <div className="section-hd">
              <div className="section-title">
                <div className="section-title-icon" style={{ background: "#e3fbed" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                Thông tin liên hệ
              </div>
              {!editContact && (
                <button className="section-edit" onClick={() => setEditContact(true)}><EditIcon />Chỉnh sửa</button>
              )}
            </div>
            {!editContact ? (
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Số điện thoại</div>
                  <div className="info-value">
                    {profile.phoneNumber || "—"}
                    {profile.phoneVerified && <VerifiedBadge />}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Điện thoại phụ</div>
                  <div className="info-value">{profile.secondaryPhone || "—"}</div>
                </div>
                <div className="info-item info-full">
                  <div className="info-label">Email</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div className="info-value">{profile.email || "—"}</div>
                    {profile.email && !profile.emailVerified && (
                      <>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fff1de", borderRadius: 10, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#c8761b", whiteSpace: "nowrap", flexShrink: 0 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          Chưa xác minh
                        </div>
                        <button style={{ fontSize: 12, color: "#4137f9", fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: 0 }}>Xác minh ngay →</button>
                      </>
                    )}
                    {profile.email && profile.emailVerified && <VerifiedBadge />}
                  </div>
                </div>
                <div className="info-item info-full">
                  <div className="info-label">Zalo</div>
                  <div className="info-value primary">{profile.zaloNumber ? `${profile.zaloNumber}${profile.zaloLinked ? " · Đã liên kết" : ""}` : "—"}</div>
                </div>
              </div>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <div style={labelStyle}>Số điện thoại</div>
                  <input style={inputStyle} value={contactForm.phoneNumber ?? ""} onChange={(e) => setContactForm({ ...contactForm, phoneNumber: e.target.value })} />
                </div>
                <div className="info-item">
                  <div style={labelStyle}>Điện thoại phụ</div>
                  <input style={inputStyle} value={contactForm.secondaryPhone ?? ""} onChange={(e) => setContactForm({ ...contactForm, secondaryPhone: e.target.value })} />
                </div>
                <div className="info-item info-full">
                  <div style={labelStyle}>Email</div>
                  <input style={inputStyle} value={contactForm.email ?? ""} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                </div>
                <div className="info-item info-full">
                  <div style={labelStyle}>Zalo</div>
                  <input style={inputStyle} value={contactForm.zaloNumber ?? ""} onChange={(e) => setContactForm({ ...contactForm, zaloNumber: e.target.value })} />
                </div>
                <div className="info-item info-full" style={{ display: "flex", gap: 8, flexDirection: "row", alignItems: "center" }}>
                  <button style={btnSave} disabled={saveContact.loading} onClick={() => saveContact.run()}>{saveContact.loading ? "Đang lưu..." : "Lưu"}</button>
                  <button style={btnCancel} onClick={() => setEditContact(false)}>Hủy</button>
                  {saveContact.error && <span style={{ color: "#f5222d", fontSize: 12 }}>{saveContact.error}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="profile-sidebar">
          {/* Phương tiện */}
          <div className="section-card" style={{ gap: 14 }}>
            <div className="section-hd">
              <div className="section-title" style={{ fontSize: 14 }}>
                <div className="section-title-icon" style={{ background: "#fff1de" }}>
                  <CarIcon stroke="#c8761b" />
                </div>
                Phương tiện
              </div>
              <button className="section-edit" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setShowVehicleForm((v) => !v)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Thêm
              </button>
            </div>
            {showVehicleForm && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "#f7f7fb", borderRadius: 10 }}>
                <input style={inputStyle} placeholder="Tên phương tiện" value={vehicleForm.vehicleName} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleName: e.target.value })} />
                <input style={inputStyle} placeholder="Biển số xe *" value={vehicleForm.licensePlate} onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })} />
                <select style={inputStyle} value={vehicleForm.vehicleType} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}>
                  <option value="car">Ô tô</option>
                  <option value="motorbike">Xe máy</option>
                  <option value="bicycle">Xe đạp</option>
                  <option value="other">Khác</option>
                </select>
                <input style={inputStyle} placeholder="Vị trí đỗ" value={vehicleForm.parkingLocation} onChange={(e) => setVehicleForm({ ...vehicleForm, parkingLocation: e.target.value })} />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button style={btnSave} disabled={addVehicle.loading || !vehicleForm.licensePlate} onClick={() => addVehicle.run()}>{addVehicle.loading ? "Đang lưu..." : "Thêm"}</button>
                  <button style={btnCancel} onClick={() => setShowVehicleForm(false)}>Hủy</button>
                  {addVehicle.error && <span style={{ color: "#f5222d", fontSize: 12 }}>{addVehicle.error}</span>}
                </div>
              </div>
            )}
            <div className="vehicle-list">
              {vehicles.length === 0 && !showVehicleForm && (
                <div style={{ fontSize: 13, color: "#585c7b" }}>Chưa có phương tiện.</div>
              )}
              {vehicles.map((v) => {
                const a = vehicleAccent[v.vehicleType] ?? vehicleAccent.other;
                return (
                  <div className="vehicle-item" key={v.id}>
                    <div className="vehicle-icon" style={{ background: a.iconBg }}>
                      {v.vehicleType === "motorbike" || v.vehicleType === "bicycle" ? (
                        <MotorbikeIcon stroke={a.iconStroke} />
                      ) : (
                        <CarIcon stroke={a.iconStroke} />
                      )}
                    </div>
                    <div className="vehicle-body">
                      <div className="vehicle-name">{v.vehicleName || v.licensePlate}</div>
                      <div className="vehicle-plate">
                        {v.licensePlate}
                        {v.parkingLocation ? ` · ${v.parkingLocation}` : ""}
                      </div>
                      <button style={{ ...btnRemove, marginTop: 4 }} disabled={removeVehicle.loading} onClick={() => removeVehicle.run(v.id)}>Xóa</button>
                    </div>
                    <span className="vehicle-badge" style={{ background: a.badgeBg, color: a.badgeColor }}>{VEHICLE_TYPE_LABEL[v.vehicleType] ?? "Khác"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Liên hệ */}
          <div className="section-card" style={{ gap: 14 }}>
            <div className="section-hd">
              <div className="section-title" style={{ fontSize: 14 }}>
                <div className="section-title-icon" style={{ background: "#ffeded" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f5222d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                Liên hệ
              </div>
              <button className="section-edit" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setShowContactForm((v) => !v)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Thêm
              </button>
            </div>
            {showContactForm && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "#f7f7fb", borderRadius: 10 }}>
                <input style={inputStyle} placeholder="Họ tên *" value={newContact.contactName} onChange={(e) => setNewContact({ ...newContact, contactName: e.target.value })} />
                <input style={inputStyle} placeholder="Quan hệ" value={newContact.relationship} onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })} />
                <input style={inputStyle} placeholder="Địa chỉ" value={newContact.location} onChange={(e) => setNewContact({ ...newContact, location: e.target.value })} />
                <input style={inputStyle} placeholder="Số điện thoại *" value={newContact.phoneNumber} onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })} />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button style={btnSave} disabled={addContact.loading || !newContact.contactName || !newContact.phoneNumber} onClick={() => addContact.run()}>{addContact.loading ? "Đang lưu..." : "Thêm"}</button>
                  <button style={btnCancel} onClick={() => setShowContactForm(false)}>Hủy</button>
                  {addContact.error && <span style={{ color: "#f5222d", fontSize: 12 }}>{addContact.error}</span>}
                </div>
              </div>
            )}
            <div className="contact-list">
              {contacts.length === 0 && !showContactForm && (
                <div style={{ fontSize: 13, color: "#585c7b" }}>Chưa có liên hệ khẩn cấp.</div>
              )}
              {contacts.map((c, idx) => {
                const col = contactAvatarColors[idx % contactAvatarColors.length];
                return (
                  <div className="contact-item" key={c.id}>
                    <div className="contact-avatar" style={{ background: col.background, color: col.color }}>{initials(c.contactName)}</div>
                    <div className="contact-body">
                      <div className="contact-name">{c.contactName}</div>
                      <div className="contact-rel">
                        {[c.relationship, c.location].filter(Boolean).join(" · ") || "—"}
                      </div>
                      <div className="contact-phone">{c.phoneNumber}</div>
                      <button style={{ ...btnRemove, marginTop: 4 }} disabled={removeContact.loading} onClick={() => removeContact.run(c.id)}>Xóa</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hoạt động gần đây */}
          <div className="section-card" style={{ gap: 14 }}>
            <div className="section-hd">
              <div className="section-title" style={{ fontSize: 14 }}>
                <div className="section-title-icon" style={{ background: "#f0f0f5" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#585c7b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                Hoạt động gần đây
              </div>
            </div>
            <div className="activity-list">
              {(activities ?? []).length === 0 && (
                <div style={{ fontSize: 13, color: "#585c7b" }}>Chưa có hoạt động.</div>
              )}
              {(activities ?? []).map((a) => (
                <div className="act-row" key={a.id}>
                  <div className="act-dot-col"><div className="act-dot" style={{ background: a.color }}></div></div>
                  <div className="act-body">
                    <div className="act-text">{a.text}</div>
                    <div className="act-time">{timeAgo(a.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
