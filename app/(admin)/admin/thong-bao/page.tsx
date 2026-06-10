export default function AdminThongBaoPage() {
  return (
    <div className="adm-r-thong-bao">
      <div className="mg-page">
            <div className="mg-hd">
              <div><h1 className="mg-title">Thông báo & Truyền thông</h1><p className="mg-sub">Tạo, lên lịch và theo dõi hiệu quả các thông báo gửi đến cư dân</p></div>
              <button className="mg-btn"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Tạo thông báo</button>
            </div>
            <div className="mg-stats">
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#efeeff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg></div><div><div className="mg-stat-val">156</div><div className="mg-stat-lbl">Đã gửi tháng này</div></div></div>
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#fff3da" }}><svg viewBox="0 0 24 24" fill="none" stroke="#c8761b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div><div><div className="mg-stat-val">4</div><div className="mg-stat-lbl">Đang lên lịch</div></div></div>
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#e6f7f1" }}><svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></div><div><div className="mg-stat-val">87%</div><div className="mg-stat-lbl">Tỉ lệ đọc TB</div></div></div>
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#eef0f7" }}><svg viewBox="0 0 24 24" fill="none" stroke="#3e4265" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div><div><div className="mg-stat-val">8</div><div className="mg-stat-lbl">Bản nháp</div></div></div>
            </div>
            <div className="mg-tabs">
              <div className="mg-tab active">Tất cả<span className="cnt">156</span></div>
              <div className="mg-tab">Đã gửi<span className="cnt">144</span></div>
              <div className="mg-tab">Lên lịch<span className="cnt">4</span></div>
              <div className="mg-tab">Nháp<span className="cnt">8</span></div>
            </div>
            <div className="mg-toolbar">
              <div className="mg-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" /></svg><input placeholder="Tìm thông báo theo tiêu đề..." /></div>
              <div className="mg-filter">Loại <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg></div>
              <div className="mg-filter">Đối tượng <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg></div>
            </div>
            <div className="mg-card">
              <table className="mg-tbl">
                <thead><tr><th>Tiêu đề</th><th>Loại</th><th>Đối tượng</th><th>Thời gian gửi</th><th>Tỉ lệ đọc</th><th>Trạng thái</th><th>Tác vụ</th></tr></thead>
                <tbody><tr>
            <td><div className="mg-pname">Bảo trì hệ thống PCCC định kỳ</div></td>
            <td><span className="mg-pill s-red">Khẩn cấp</span></td>
            <td>Toàn bộ cư dân</td>
            <td>25/05 10:30</td>
            <td style={{ fontWeight: "600", color: "var(--text-272727)" }}>94%</td>
            <td><span className="mg-pill s-green">Đã gửi</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr><tr>
            <td><div className="mg-pname">Điều chỉnh phí giữ xe tháng 6</div></td>
            <td><span className="mg-pill s-blue">Thông báo</span></td>
            <td>Chủ phương tiện</td>
            <td>24/05 09:15</td>
            <td style={{ fontWeight: "600", color: "var(--text-272727)" }}>87%</td>
            <td><span className="mg-pill s-green">Đã gửi</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr><tr>
            <td><div className="mg-pname">Lịch cắt điện khu Block A</div></td>
            <td><span className="mg-pill s-red">Khẩn cấp</span></td>
            <td>Tháp A</td>
            <td>23/05 16:00</td>
            <td style={{ fontWeight: "600", color: "var(--text-272727)" }}>91%</td>
            <td><span className="mg-pill s-green">Đã gửi</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr><tr>
            <td><div className="mg-pname">Ngày hội cư dân 2026</div></td>
            <td><span className="mg-pill s-violet">Sự kiện</span></td>
            <td>Toàn bộ cư dân</td>
            <td>—</td>
            <td style={{ fontWeight: "600", color: "var(--text-272727)" }}>—</td>
            <td><span className="mg-pill s-amber">Lên lịch</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr><tr>
            <td><div className="mg-pname">Kết quả họp BQT tháng 5</div></td>
            <td><span className="mg-pill s-gray">Tài liệu</span></td>
            <td>Toàn bộ cư dân</td>
            <td>22/05 14:20</td>
            <td style={{ fontWeight: "600", color: "var(--text-272727)" }}>78%</td>
            <td><span className="mg-pill s-green">Đã gửi</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr><tr>
            <td><div className="mg-pname">Nhắc nộp phí dịch vụ T5</div></td>
            <td><span className="mg-pill s-amber">Nhắc nhở</span></td>
            <td>Còn nợ phí</td>
            <td>—</td>
            <td style={{ fontWeight: "600", color: "var(--text-272727)" }}>—</td>
            <td><span className="mg-pill s-gray">Nháp</span></td>
            <td><div className="mg-act-btns"><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button><button className="mg-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button></div></td>
          </tr></tbody>
              </table>
              <div className="mg-foot"><div className="mg-count">Hiển thị 1 - 8 của 156 thông báo</div><div className="mg-pages"><span className="mg-pg">‹</span><span className="mg-pg active">1</span><span className="mg-pg">2</span><span className="mg-pg">3</span><span className="mg-pg">›</span></div></div>
            </div>
          </div>
    </div>
  );
}
