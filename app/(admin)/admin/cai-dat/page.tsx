export default function AdminCaiDatPage() {
  return (
    <div className="adm-r-cai-dat">
      <div className="st-page">
            <div className="st-hd">
              <div className="st-title">Cài đặt hệ thống</div>
              <div className="st-sub">Cấu hình thông tin tòa nhà, biểu phí, thông báo và bảo mật</div>
            </div>
      
            <div className="st-card">
              <div className="st-card-hd"><div className="st-card-ic" style={{ background: "#efeeff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg></div><div><div className="st-card-title">Thông tin tòa nhà</div><div className="st-card-desc">Thông tin cơ bản về dự án và tòa nhà</div></div></div>
              <div className="st-grid">
                <div className="st-field"><label className="st-label">Tên tòa nhà</label><input className="st-input" defaultValue="Landmark 1 - Vinhomes Central Park" /></div>
                <div className="st-field"><label className="st-label">Mã dự án</label><input className="st-input" defaultValue="LM1-2026" /></div>
                <div className="st-field full"><label className="st-label">Địa chỉ</label><input className="st-input" defaultValue="720A Điện Biên Phủ, P.22, Q.Bình Thạnh, TP.HCM" /></div>
                <div className="st-field"><label className="st-label">Số tháp</label><input className="st-input" defaultValue="3 (A, B, C)" /></div>
                <div className="st-field"><label className="st-label">Tổng số căn hộ</label><input className="st-input" defaultValue="1.024" /></div>
              </div>
            </div>
      
            <div className="st-card">
              <div className="st-card-hd"><div className="st-card-ic" style={{ background: "#e6f7f1" }}><svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div><div><div className="st-card-title">Cấu hình phí dịch vụ</div><div className="st-card-desc">Đơn giá và quy định thu phí hàng tháng</div></div></div>
              <div className="st-grid">
                <div className="st-field"><label className="st-label">Phí dịch vụ (đ/m²/tháng)</label><input className="st-input" defaultValue="16.500" /></div>
                <div className="st-field"><label className="st-label">Phí giữ ô tô (đ/tháng)</label><input className="st-input" defaultValue="1.250.000" /></div>
                <div className="st-field"><label className="st-label">Phí giữ xe máy (đ/tháng)</label><input className="st-input" defaultValue="120.000" /></div>
                <div className="st-field"><label className="st-label">Hạn nộp phí (ngày)</label><input className="st-input" defaultValue="Ngày 31 hàng tháng" /></div>
                <div className="st-field"><label className="st-label">Phí trễ hạn (%/tháng)</label><input className="st-input" defaultValue="2%" /></div>
                <div className="st-field"><label className="st-label">Trích quỹ bảo trì (%)</label><input className="st-input" defaultValue="2%" /></div>
              </div>
            </div>
      
            <div className="st-card">
              <div className="st-card-hd"><div className="st-card-ic" style={{ background: "#fff3da" }}><svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg></div><div><div className="st-card-title">Thông báo & Nhắc nhở</div><div className="st-card-desc">Kênh gửi và cấu hình nhắc nhở tự động</div></div></div>
              <div className="st-row"><div className="st-row-info"><div className="n">Gửi qua ứng dụng</div><div className="d">Push notification tới app cư dân</div></div><div className="sw on"></div></div>
              <div className="st-row"><div className="st-row-info"><div className="n">Gửi qua Email</div><div className="d">Đồng thời gửi email cho thông báo quan trọng</div></div><div className="sw on"></div></div>
              <div className="st-row"><div className="st-row-info"><div className="n">Gửi qua Zalo OA</div><div className="d">Tích hợp Zalo Official Account</div></div><div className="sw on"></div></div>
              <div className="st-row"><div className="st-row-info"><div className="n">Tự động nhắc nợ phí</div><div className="d">Nhắc cư dân chưa nộp phí trước hạn 3 ngày</div></div><div className="sw on"></div></div>
              <div className="st-row"><div className="st-row-info"><div className="n">Gửi qua SMS</div><div className="d">Tin nhắn SMS (tính phí theo nhà mạng)</div></div><div className="sw "></div></div>
            </div>
      
            <div className="st-card">
              <div className="st-card-hd"><div className="st-card-ic" style={{ background: "#ffeded" }}><svg viewBox="0 0 24 24" fill="none" stroke="#f5222d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div><div><div className="st-card-title">Bảo mật</div><div className="st-card-desc">Cấu hình bảo mật và phiên đăng nhập</div></div></div>
              <div className="st-row"><div className="st-row-info"><div className="n">Xác thực 2 lớp (2FA)</div><div className="d">Yêu cầu OTP khi đăng nhập tài khoản quản trị</div></div><div className="sw on"></div></div>
              <div className="st-row"><div className="st-row-info"><div className="n">Tự động đăng xuất</div><div className="d">Đăng xuất sau 30 phút không hoạt động</div></div><div className="sw on"></div></div>
              <div className="st-row"><div className="st-row-info"><div className="n">Giới hạn IP truy cập</div><div className="d">Chỉ cho phép truy cập từ IP nội bộ tòa nhà</div></div><div className="sw "></div></div>
              <div className="st-row"><div className="st-row-info"><div className="n">Ghi log hoạt động</div><div className="d">Lưu lịch sử thao tác của tài khoản quản trị</div></div><div className="sw on"></div></div>
            </div>
      
            <div className="st-save">
              <button className="st-btn">Hủy</button>
              <button className="st-btn primary">Lưu thay đổi</button>
            </div>
          </div>
    </div>
  );
}
