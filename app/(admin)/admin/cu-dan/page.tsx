export default function AdminCuDanPage() {
  return (
    <div className="adm-r-cu-dan">
      <div className="mg-page">
            <div className="mg-hd">
              <div><h1 className="mg-title">Quản lý cư dân</h1><p className="mg-sub">Quản lý thông tin, vai trò và trạng thái xác minh của cư dân tòa nhà</p></div>
              <button className="mg-btn"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Thêm cư dân</button>
            </div>
            <div className="mg-stats">
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#efeeff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div><div><div className="mg-stat-val">1.248</div><div className="mg-stat-lbl">Tổng cư dân</div></div></div>
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#efeaff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#5a3ad9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg></div><div><div className="mg-stat-val">1.024</div><div className="mg-stat-lbl">Chủ hộ</div></div></div>
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#e6f7f1" }}><svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div><div><div className="mg-stat-val">1.180</div><div className="mg-stat-lbl">Đã xác minh</div></div></div>
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#fff3da" }}><svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div><div><div className="mg-stat-val">12</div><div className="mg-stat-lbl">Chờ duyệt</div></div></div>
            </div>
            <div className="mg-toolbar">
              <div className="mg-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" /></svg><input placeholder="Tìm theo tên, email, căn hộ, SĐT..." /></div>
              <div className="mg-filter">Tòa nhà <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg></div>
              <div className="mg-filter">Trạng thái <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg></div>
              <div className="mg-filter"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg> Bộ lọc</div>
            </div>
            <div className="mg-card">
              <table className="mg-tbl">
                <thead><tr><th>Cư dân</th><th>Căn hộ</th><th>Số điện thoại</th><th>Vai trò</th><th>Trạng thái</th><th>Tác vụ</th></tr></thead>
                <tbody><tr>
            <td><div className="mg-person"><div className="mg-ava" style={{ background: "#4137f9" }}>NM</div><div><div className="mg-pname">Nguyễn Hoàng Nam</div><div className="mg-pmeta">nam.nguyen@gmail.com</div></div></div></td>
            <td><span className="mg-code" style={{ fontWeight: "600", color: "var(--text-272727)" }}>A-12.05</span></td>
            <td>0901 234 567</td>
            <td><span className="mg-pill s-violet">Chủ hộ</span></td>
            <td><span className="mg-pill s-green">Đã xác minh</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr><tr>
            <td><div className="mg-person"><div className="mg-ava" style={{ background: "#e8736d" }}>TH</div><div><div className="mg-pname">Trần Thị Hương</div><div className="mg-pmeta">huong.tran@gmail.com</div></div></div></td>
            <td><span className="mg-code" style={{ fontWeight: "600", color: "var(--text-272727)" }}>B-08.12</span></td>
            <td>0912 345 678</td>
            <td><span className="mg-pill s-violet">Chủ hộ</span></td>
            <td><span className="mg-pill s-green">Đã xác minh</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr><tr>
            <td><div className="mg-person"><div className="mg-ava" style={{ background: "#41c69c" }}>LV</div><div><div className="mg-pname">Lê Văn Minh</div><div className="mg-pmeta">minh.le@gmail.com</div></div></div></td>
            <td><span className="mg-code" style={{ fontWeight: "600", color: "var(--text-272727)" }}>A-05.03</span></td>
            <td>0923 456 789</td>
            <td><span className="mg-pill s-blue">Thành viên</span></td>
            <td><span className="mg-pill s-green">Đã xác minh</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr><tr>
            <td><div className="mg-person"><div className="mg-ava" style={{ background: "#c8761b" }}>PQ</div><div><div className="mg-pname">Phạm Quốc Bảo</div><div className="mg-pmeta">bao.pham@gmail.com</div></div></div></td>
            <td><span className="mg-code" style={{ fontWeight: "600", color: "var(--text-272727)" }}>C-15.08</span></td>
            <td>0934 567 890</td>
            <td><span className="mg-pill s-violet">Chủ hộ</span></td>
            <td><span className="mg-pill s-amber">Chờ duyệt</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr><tr>
            <td><div className="mg-person"><div className="mg-ava" style={{ background: "#5a3ad9" }}>VT</div><div><div className="mg-pname">Vũ Thanh Tâm</div><div className="mg-pmeta">tam.vu@gmail.com</div></div></div></td>
            <td><span className="mg-code" style={{ fontWeight: "600", color: "var(--text-272727)" }}>B-03.11</span></td>
            <td>0945 678 901</td>
            <td><span className="mg-pill s-gray">Người thuê</span></td>
            <td><span className="mg-pill s-green">Đã xác minh</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr><tr>
            <td><div className="mg-person"><div className="mg-ava" style={{ background: "#2f7bf6" }}>HM</div><div><div className="mg-pname">Hoàng Mai Lan</div><div className="mg-pmeta">lan.hoang@gmail.com</div></div></div></td>
            <td><span className="mg-code" style={{ fontWeight: "600", color: "var(--text-272727)" }}>A-20.02</span></td>
            <td>0956 789 012</td>
            <td><span className="mg-pill s-violet">Chủ hộ</span></td>
            <td><span className="mg-pill s-amber">Chờ duyệt</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr><tr>
            <td><div className="mg-person"><div className="mg-ava" style={{ background: "#1c9d5f" }}>ĐK</div><div><div className="mg-pname">Đặng Khôi Nguyên</div><div className="mg-pmeta">nguyen.dang@gmail.com</div></div></div></td>
            <td><span className="mg-code" style={{ fontWeight: "600", color: "var(--text-272727)" }}>C-09.07</span></td>
            <td>0967 890 123</td>
            <td><span className="mg-pill s-blue">Thành viên</span></td>
            <td><span className="mg-pill s-green">Đã xác minh</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr></tbody>
              </table>
              <div className="mg-foot">
                <div className="mg-count">Hiển thị 1 - 7 của 1.248 cư dân</div>
                <div className="mg-pages"><span className="mg-pg">‹</span><span className="mg-pg active">1</span><span className="mg-pg">2</span><span className="mg-pg">3</span><span className="mg-pg">…</span><span className="mg-pg">178</span><span className="mg-pg">›</span></div>
              </div>
            </div>
          </div>
    </div>
  );
}
