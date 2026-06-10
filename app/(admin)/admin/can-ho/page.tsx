export default function AdminCanHoPage() {
  return (
    <div className="adm-r-can-ho">
      <div className="mg-page">
            <div className="mg-hd">
              <div><h1 className="mg-title">Quản lý căn hộ</h1><p className="mg-sub">Theo dõi tình trạng, chủ hộ và thông tin 1020+ căn hộ trong tòa nhà</p></div>
              <button className="mg-btn"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Thêm căn hộ</button>
            </div>
            <div className="mg-stats">
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#efeeff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#4137f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg></div><div><div className="mg-stat-val">1.024</div><div className="mg-stat-lbl">Tổng căn hộ</div></div></div>
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#e6f7f1" }}><svg viewBox="0 0 24 24" fill="none" stroke="#1c9d5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21V9h6v12" /><path d="M3 9l9-7 9 7" /></svg></div><div><div className="mg-stat-val">799</div><div className="mg-stat-lbl">Đang ở</div></div></div>
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#eaf1ff" }}><svg viewBox="0 0 24 24" fill="none" stroke="#2f7bf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6v6H9z" /></svg></div><div><div className="mg-stat-val">154</div><div className="mg-stat-lbl">Cho thuê</div></div></div>
              <div className="mg-stat"><div className="mg-stat-ic" style={{ background: "#eef0f7" }}><svg viewBox="0 0 24 24" fill="none" stroke="#3e4265" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /></svg></div><div><div className="mg-stat-val">71</div><div className="mg-stat-lbl">Trống</div></div></div>
            </div>
            <div className="mg-toolbar">
              <div className="mg-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" /></svg><input placeholder="Tìm theo mã căn hộ, chủ hộ..." /></div>
              <div className="mg-filter">Tháp <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg></div>
              <div className="mg-filter">Trạng thái <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg></div>
            </div>
            <div className="mg-grid"><div className="mg-apt">
            <div className="mg-apt-top"><div><div className="mg-apt-code">A-12.05</div><div className="mg-apt-floor">Tầng 12 • Tháp A</div></div><span className="mg-pill s-green">Đang ở</span></div>
            <div className="mg-apt-row"><span>Diện tích</span><span>95 m²</span></div>
            <div className="mg-apt-row"><span>Phòng ngủ</span><span>3PN</span></div>
            <div className="mg-apt-row"><span>Chủ hộ</span><span>Nguyễn Hoàng Nam</span></div>
          </div><div className="mg-apt">
            <div className="mg-apt-top"><div><div className="mg-apt-code">B-08.12</div><div className="mg-apt-floor">Tầng 8 • Tháp B</div></div><span className="mg-pill s-green">Đang ở</span></div>
            <div className="mg-apt-row"><span>Diện tích</span><span>78 m²</span></div>
            <div className="mg-apt-row"><span>Phòng ngủ</span><span>2PN</span></div>
            <div className="mg-apt-row"><span>Chủ hộ</span><span>Trần Thị Hương</span></div>
          </div><div className="mg-apt">
            <div className="mg-apt-top"><div><div className="mg-apt-code">A-05.03</div><div className="mg-apt-floor">Tầng 5 • Tháp A</div></div><span className="mg-pill s-blue">Cho thuê</span></div>
            <div className="mg-apt-row"><span>Diện tích</span><span>120 m²</span></div>
            <div className="mg-apt-row"><span>Phòng ngủ</span><span>3PN</span></div>
            <div className="mg-apt-row"><span>Chủ hộ</span><span>Lê Văn Minh</span></div>
          </div><div className="mg-apt">
            <div className="mg-apt-top"><div><div className="mg-apt-code">C-15.08</div><div className="mg-apt-floor">Tầng 15 • Tháp C</div></div><span className="mg-pill s-green">Đang ở</span></div>
            <div className="mg-apt-row"><span>Diện tích</span><span>65 m²</span></div>
            <div className="mg-apt-row"><span>Phòng ngủ</span><span>2PN</span></div>
            <div className="mg-apt-row"><span>Chủ hộ</span><span>Phạm Quốc Bảo</span></div>
          </div><div className="mg-apt">
            <div className="mg-apt-top"><div><div className="mg-apt-code">B-03.11</div><div className="mg-apt-floor">Tầng 3 • Tháp B</div></div><span className="mg-pill s-gray">Trống</span></div>
            <div className="mg-apt-row"><span>Diện tích</span><span>88 m²</span></div>
            <div className="mg-apt-row"><span>Phòng ngủ</span><span>2PN</span></div>
            <div className="mg-apt-row"><span>Chủ hộ</span><span>— (Trống)</span></div>
          </div><div className="mg-apt">
            <div className="mg-apt-top"><div><div className="mg-apt-code">A-20.02</div><div className="mg-apt-floor">Tầng 20 • Tháp A</div></div><span className="mg-pill s-green">Đang ở</span></div>
            <div className="mg-apt-row"><span>Diện tích</span><span>145 m²</span></div>
            <div className="mg-apt-row"><span>Phòng ngủ</span><span>4PN</span></div>
            <div className="mg-apt-row"><span>Chủ hộ</span><span>Hoàng Mai Lan</span></div>
          </div></div>
          </div>
    </div>
  );
}
