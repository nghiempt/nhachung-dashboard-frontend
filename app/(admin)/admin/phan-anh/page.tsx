export default function AdminPhanAnhPage() {
  return (
    <div className="adm-r-phan-anh">
      <div className="mg-page">
            <div className="mg-hd">
              <div><h1 className="mg-title">Xử lý phản ánh</h1><p className="mg-sub">Tiếp nhận, phân công và theo dõi tiến độ xử lý phản ánh từ cư dân</p></div>
              <button className="mg-btn mg-btn-ghost"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg> Xuất báo cáo</button>
            </div>
            <div className="mg-stats">
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#efeeff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div><div><div className="mg-stat-val">89</div><div className="mg-stat-lbl">Tổng phản ánh</div></div></div>
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#fff3da" }}><svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div><div><div className="mg-stat-val">18</div><div className="mg-stat-lbl">Chờ xử lý</div></div></div>
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#eaf1ff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#2f7bf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" /></svg></div><div><div className="mg-stat-val">24</div><div className="mg-stat-lbl">Đang xử lý</div></div></div>
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#e6f7f1" }}><svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div><div><div className="mg-stat-val">47</div><div className="mg-stat-lbl">Hoàn thành</div></div></div>
            </div>
            <div className="mg-tabs">
              <div className="mg-tab active">Tất cả<span className="cnt">89</span></div>
              <div className="mg-tab">Chờ xử lý<span className="cnt">18</span></div>
              <div className="mg-tab">Đang xử lý<span className="cnt">24</span></div>
              <div className="mg-tab">Hoàn thành<span className="cnt">47</span></div>
              <div className="mg-tab">Từ chối<span className="cnt">3</span></div>
            </div>
            <div className="mg-toolbar">
              <div className="mg-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" /></svg><input placeholder="Tìm theo mã, nội dung, cư dân..." /></div>
              <div className="mg-filter">Danh mục <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg></div>
              <div className="mg-filter">Ưu tiên <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg></div>
            </div>
            <div className="mg-card">
              <table className="mg-tbl">
                <thead><tr><th>Mã</th><th>Nội dung</th><th>Danh mục</th><th>Ưu tiên</th><th>Thời gian</th><th>Trạng thái</th><th>Tác vụ</th></tr></thead>
                <tbody><tr>
            <td><span style={{ fontWeight: "600", color: "var(--text-272727)" }}>#PA-0012</span></td>
            <td><div className="mg-pname">Rác thải không được dọn ở tầng hầm B2</div><div className="mg-pmeta">Nguyễn Hoàng Nam • A-12.05</div></td>
            <td>Vệ sinh - Môi trường</td>
            <td><span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px" }}><i style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f5222d", display: "inline-block" }}></i>Cao</span></td>
            <td>Hôm nay 10:30</td>
            <td><span className="mg-pill s-amber">Đang xử lý</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></button></div></td>
          </tr><tr>
            <td><span style={{ fontWeight: "600", color: "var(--text-272727)" }}>#PA-0011</span></td>
            <td><div className="mg-pname">Thang máy số 2 bị kẹt và dừng đột ngột</div><div className="mg-pmeta">Trần Thị Hương • B-08.12</div></td>
            <td>Kỹ thuật - Hạ tầng</td>
            <td><span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px" }}><i style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f5222d", display: "inline-block" }}></i>Cao</span></td>
            <td>Hôm qua 16:45</td>
            <td><span className="mg-pill s-blue">Chờ phản hồi</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></button></div></td>
          </tr><tr>
            <td><span style={{ fontWeight: "600", color: "var(--text-272727)" }}>#PA-0010</span></td>
            <td><div className="mg-pname">Đèn hành lang tầng 15 không hoạt động</div><div className="mg-pmeta">Lê Văn Minh • A-05.03</div></td>
            <td>Kỹ thuật - Hạ tầng</td>
            <td><span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px" }}><i style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#c8761b", display: "inline-block" }}></i>TB</span></td>
            <td>2 ngày trước</td>
            <td><span className="mg-pill s-green">Hoàn thành</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></button></div></td>
          </tr><tr>
            <td><span style={{ fontWeight: "600", color: "var(--text-272727)" }}>#PA-0009</span></td>
            <td><div className="mg-pname">Xe lạ thường xuyên ra vào khu căn hộ</div><div className="mg-pmeta">Phạm Quốc Bảo • C-15.08</div></td>
            <td>An ninh</td>
            <td><span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px" }}><i style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f5222d", display: "inline-block" }}></i>Cao</span></td>
            <td>2 ngày trước</td>
            <td><span className="mg-pill s-amber">Đang xử lý</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></button></div></td>
          </tr><tr>
            <td><span style={{ fontWeight: "600", color: "var(--text-272727)" }}>#PA-0008</span></td>
            <td><div className="mg-pname">Phòng gym thiếu máy và thiết bị hỏng</div><div className="mg-pmeta">Vũ Thanh Tâm • B-03.11</div></td>
            <td>Tiện ích - Dịch vụ</td>
            <td><span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px" }}><i style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#959595", display: "inline-block" }}></i>Thấp</span></td>
            <td>3 ngày trước</td>
            <td><span className="mg-pill s-gray">Từ chối</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></button></div></td>
          </tr><tr>
            <td><span style={{ fontWeight: "600", color: "var(--text-272727)" }}>#PA-0007</span></td>
            <td><div className="mg-pname">Tiếng ồn thi công ngoài giờ quy định</div><div className="mg-pmeta">Hoàng Mai Lan • A-20.02</div></td>
            <td>An ninh</td>
            <td><span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px" }}><i style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#c8761b", display: "inline-block" }}></i>TB</span></td>
            <td>4 ngày trước</td>
            <td><span className="mg-pill s-green">Hoàn thành</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></button></div></td>
          </tr></tbody>
              </table>
              <div className="mg-foot"><div className="mg-count">Hiển thị 1 - 8 của 89 phản ánh</div><div className="mg-pages"><span className="mg-pg">‹</span><span className="mg-pg active">1</span><span className="mg-pg">2</span><span className="mg-pg">3</span><span className="mg-pg">›</span></div></div>
            </div>
          </div>
    </div>
  );
}
