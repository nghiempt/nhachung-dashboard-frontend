export default function AdminDashboardPage() {
  return (
    <div className="adm-r-dashboard">
      <div className="adm-page">
            <div className="adm-hd">
              <div>
                <h1 className="adm-title">Tổng quan điều hành</h1>
                <p className="adm-sub">Toàn cảnh vận hành tòa nhà Landmark 1 — cập nhật theo thời gian thực</p>
              </div>
              <div className="adm-period">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                Tháng 5/2026
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
      
            
            <div className="adm-kpis">
              <div className="adm-kpi">
                <div className="adm-kpi-top">
                  <div className="adm-kpi-ic" style={{ background: "#efeeff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
                  <span className="adm-kpi-badge adm-up">▲ 32</span>
                </div>
                <div className="adm-kpi-val">1.248</div>
                <div className="adm-kpi-lbl">Tổng cư dân</div>
              </div>
              <div className="adm-kpi">
                <div className="adm-kpi-top">
                  <div className="adm-kpi-ic" style={{ background: "#e6f7f1" }}><svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                  <span className="adm-kpi-badge adm-up">▲ 2.1%</span>
                </div>
                <div className="adm-kpi-val">94.2%</div>
                <div className="adm-kpi-lbl">Tỉ lệ thu phí tháng</div>
              </div>
              <div className="adm-kpi">
                <div className="adm-kpi-top">
                  <div className="adm-kpi-ic" style={{ background: "#fff1de" }}><svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
                  <span className="adm-kpi-badge adm-down">▼ 5</span>
                </div>
                <div className="adm-kpi-val">18</div>
                <div className="adm-kpi-lbl">Phản ánh chờ xử lý</div>
              </div>
              <div className="adm-kpi">
                <div className="adm-kpi-top">
                  <div className="adm-kpi-ic" style={{ background: "#ffeded" }}><svg viewBox="0 0 24 24" fill="none" stroke="#f5222d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
                  <span className="adm-kpi-badge adm-down">▲ 2</span>
                </div>
                <div className="adm-kpi-val">5</div>
                <div className="adm-kpi-lbl">Sự cố đang mở</div>
              </div>
            </div>
      
            
            <div className="adm-row c2">
              <div className="adm-card">
                <div className="adm-card-hd">
                  <div className="adm-card-title">Thu chi 6 tháng gần nhất</div>
                  <a className="adm-card-link" href="/admin/thu-chi">Chi tiết <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></a>
                </div>
                <svg width="100%" viewBox="0 0 620 220" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="30" y1="30" x2="590" y2="30" stroke="#eff2fc" /><line x1="30" y1="83" x2="590" y2="83" stroke="#eff2fc" /><line x1="30" y1="137" x2="590" y2="137" stroke="#eff2fc" /><line x1="30" y1="190" x2="590" y2="190" stroke="#eff2fc" /><rect x="53" y="62" width="22" height="128" rx="4" fill="#8b80f9" /><rect x="79" y="83" width="22" height="107" rx="4" fill="#ef6b7c" /><text x="77" y="206" textAnchor="middle" fontSize="12" fill="#959595">T12</text><rect x="146" y="51" width="22" height="139" rx="4" fill="#8b80f9" /><rect x="172" y="78" width="22" height="112" rx="4" fill="#ef6b7c" /><text x="170" y="206" textAnchor="middle" fontSize="12" fill="#959595">T1</text><rect x="239" y="57" width="22" height="133" rx="4" fill="#8b80f9" /><rect x="265" y="86" width="22" height="104" rx="4" fill="#ef6b7c" /><text x="263" y="206" textAnchor="middle" fontSize="12" fill="#959595">T2</text><rect x="333" y="46" width="22" height="144" rx="4" fill="#8b80f9" /><rect x="359" y="75" width="22" height="115" rx="4" fill="#ef6b7c" /><text x="357" y="206" textAnchor="middle" fontSize="12" fill="#959595">T3</text><rect x="426" y="49" width="22" height="141" rx="4" fill="#8b80f9" /><rect x="452" y="83" width="22" height="107" rx="4" fill="#ef6b7c" /><text x="450" y="206" textAnchor="middle" fontSize="12" fill="#959595">T4</text><rect x="519" y="38" width="22" height="152" rx="4" fill="#8b80f9" /><rect x="545" y="76" width="22" height="114" rx="4" fill="#ef6b7c" /><text x="543" y="206" textAnchor="middle" fontSize="12" fill="#959595">T5</text></svg>
                <div className="adm-chart-legend"><span><i style={{ background: "#8b80f9" }}></i>Tổng thu</span><span><i style={{ background: "#ef6b7c" }}></i>Tổng chi</span></div>
              </div>
              <div className="adm-card">
                <div className="adm-card-hd"><div className="adm-card-title">Cơ cấu căn hộ</div></div>
                <div className="adm-donut-wrap">
                  <div className="adm-donut-c">
                    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="90.0" cy="90.0" r="62" fill="none" stroke="#4137f9" strokeWidth="30" strokeDasharray="303.85 85.70" strokeDashoffset="-0.00" transform="rotate(-90 90.0 90.0)" /><circle cx="90.0" cy="90.0" r="62" fill="none" stroke="#41c69c" strokeWidth="30" strokeDasharray="58.43 331.12" strokeDashoffset="-303.85" transform="rotate(-90 90.0 90.0)" /><circle cx="90.0" cy="90.0" r="62" fill="none" stroke="#d4d7e5" strokeWidth="30" strokeDasharray="27.27 362.29" strokeDashoffset="-362.29" transform="rotate(-90 90.0 90.0)" /></svg>
                    <div className="adm-donut-ctr"><b>1.024</b><span>căn hộ</span></div>
                  </div>
                  <div className="adm-legend" style={{ flex: "1" }}>
                    <div className="adm-leg-row"><span className="adm-leg-dot" style={{ background: "#4137f9" }}></span><span className="adm-leg-name">Đang ở</span><span className="adm-leg-val">78%</span></div>
                    <div className="adm-leg-row"><span className="adm-leg-dot" style={{ background: "#41c69c" }}></span><span className="adm-leg-name">Cho thuê</span><span className="adm-leg-val">15%</span></div>
                    <div className="adm-leg-row"><span className="adm-leg-dot" style={{ background: "#d4d7e5" }}></span><span className="adm-leg-name">Trống</span><span className="adm-leg-val">7%</span></div>
                  </div>
                </div>
              </div>
            </div>
      
            
            <div className="adm-row c2b">
              <div className="adm-card">
                <div className="adm-card-hd">
                  <div className="adm-card-title">Phản ánh cần xử lý</div>
                  <a className="adm-card-link" href="/admin/phan-anh">Xem tất cả <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></a>
                </div>
                <table className="adm-tbl">
                  <thead><tr><th>Mã</th><th>Nội dung</th><th>Danh mục</th><th>Ưu tiên</th><th>Trạng thái</th></tr></thead>
                  <tbody>
                    <tr><td className="adm-code">#PA-0012</td><td>Rác thải tầng hầm B2</td><td>Vệ sinh</td><td><span className="adm-prio"><i style={{ background: "#f5222d" }}></i>Cao</span></td><td><span className="adm-pill p-amber">Đang xử lý</span></td></tr>
                    <tr><td className="adm-code">#PA-0011</td><td>Thang máy số 2 bị kẹt</td><td>Kỹ thuật</td><td><span className="adm-prio"><i style={{ background: "#f5222d" }}></i>Cao</span></td><td><span className="adm-pill p-blue">Chờ phản hồi</span></td></tr>
                    <tr><td className="adm-code">#PA-0010</td><td>Đèn hành lang tầng 15 hỏng</td><td>Hạ tầng</td><td><span className="adm-prio"><i style={{ background: "#c8761b" }}></i>TB</span></td><td><span className="adm-pill p-green">Hoàn thành</span></td></tr>
                    <tr><td className="adm-code">#PA-0009</td><td>Xe lạ ra vào khu căn hộ</td><td>An ninh</td><td><span className="adm-prio"><i style={{ background: "#f5222d" }}></i>Cao</span></td><td><span className="adm-pill p-amber">Đang xử lý</span></td></tr>
                    <tr><td className="adm-code">#PA-0008</td><td>Phòng gym thiếu thiết bị</td><td>Tiện ích</td><td><span className="adm-prio"><i style={{ background: "#959595" }}></i>Thấp</span></td><td><span className="adm-pill p-gray">Từ chối</span></td></tr>
                  </tbody>
                </table>
              </div>
              <div className="adm-card">
                <div className="adm-card-hd"><div className="adm-card-title">Hoạt động gần đây</div></div>
                <div className="adm-act">
                  <div className="adm-act-item"><div className="adm-act-dot" style={{ background: "#efeeff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div><div className="adm-act-body"><div className="adm-act-txt"><b>Thu phí tháng 5</b> đã hoàn tất cho 964/1024 căn hộ</div><div className="adm-act-time">10 phút trước</div></div></div>
                  <div className="adm-act-item"><div className="adm-act-dot" style={{ background: "#fff1de" }}><svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div><div className="adm-act-body"><div className="adm-act-txt">Phản ánh mới <b>#PA-0012</b> từ căn hộ A-12.05</div><div className="adm-act-time">25 phút trước</div></div></div>
                  <div className="adm-act-item"><div className="adm-act-dot" style={{ background: "#e6f7f1" }}><svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div><div className="adm-act-body"><div className="adm-act-txt">Hoàn thành bảo trì <b>thang máy số 1</b></div><div className="adm-act-time">1 giờ trước</div></div></div>
                  <div className="adm-act-item"><div className="adm-act-dot" style={{ background: "#eaf1ff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#2f7bf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg></div><div className="adm-act-body"><div className="adm-act-txt">Gửi <b>thông báo cắt nước</b> tới 320 cư dân</div><div className="adm-act-time">2 giờ trước</div></div></div>
                  <div className="adm-act-item"><div className="adm-act-dot" style={{ background: "#efeeff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg></div><div className="adm-act-body"><div className="adm-act-txt">Cư dân mới <b>Trần Thị Hương</b> đăng ký căn B-08.12</div><div className="adm-act-time">3 giờ trước</div></div></div>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
}
