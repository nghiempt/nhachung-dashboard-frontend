"use client";

export default function AIAssistantPage() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", height: "100%", overflow: "hidden" }}>

      {/* Page header */}
      <div style={{ flexShrink: 0 }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, lineHeight: "36px", color: "#272727" }}>AI Assistant</h1>
        <p style={{ fontSize: "16px", color: "#585c7b", marginTop: "6px", lineHeight: "24px", fontWeight: 500 }}>Trợ lý AI của cư dân Sunshine Riverside</p>
      </div>

      {/* Body: left panel + chat panel */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: "20px", alignItems: "stretch" }}>

        {/* Left panel */}
        <div style={{
          width: "198px", flexShrink: 0,
          background: "#ffffff", border: "1px solid #e2e5f1", borderRadius: "20px",
          padding: "15px", display: "flex", flexDirection: "column", gap: "16px",
          overflowY: "auto",
        }}>
          <button style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            background: "#4137f9", color: "#fff", border: 0,
            borderRadius: "10px", padding: "10px 18px", width: "100%",
            fontSize: "14px", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
          }}>
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE3Ljg4IDQuNTFDMTcuOTYgNC42MyAxNy45OSA0Ljc4IDE3Ljk4IDQuOTJDMTcuOTYgNS4wNiAxNy45IDUuMiAxNy44IDUuM0wxMC4xNCAxMi45NkMxMC4wNiAxMy4wNCA5Ljk2IDEzLjA5IDkuODYgMTMuMTJMNi42NiAxMy45NkM2LjU2IDEzLjk4IDYuNDUgMTMuOTggNi4zNCAxMy45NUM2LjI0IDEzLjkyIDYuMTQgMTMuODcgNi4wNiAxMy43OUM1Ljk5IDEzLjcyIDUuOTMgMTMuNjIgNS45IDEzLjUxQzUuODggMTMuNDEgNS44NyAxMy4zIDUuOSAxMy4xOUw2Ljc0IDEwTDYuODcgOS43NEwxNC41NiAyLjA2QzE0LjY4IDEuOTQgMTQuODMgMS44OCAxNSAxLjg4QzE1LjE3IDEuODggMTUuMzIgMS45NCAxNS40NCAyLjA2TDE3LjggNC40MkMxNy44MyA0LjQ1IDE3Ljg2IDQuNDggMTcuODggNC41MVpNMTYuNDcgNC44NkwxNSAzLjM4TDcuOSAxMC40OEw3LjM4IDEyLjQ4TDkuMzggMTEuOTZMMTYuNDcgNC44NloiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTE2LjM3IDE0LjNDMTYuNTkgMTIuMzUgMTYuNjcgMTAuMzkgMTYuNTggOC40M0MxNi41OCA4LjM5IDE2LjU5IDguMzQgMTYuNjEgOC4zQzE2LjYyIDguMjYgMTYuNjUgOC4yMiAxNi42OCA4LjE4TDE3LjUgNy4zNkMxNy41MiA3LjM0IDE3LjU1IDcuMzMgMTcuNTggNy4zMkMxNy42MiA3LjMxIDE3LjY1IDcuMzEgMTcuNjggNy4zM0MxNy43MSA3LjM0IDE3LjczIDcuMzYgMTcuNzUgNy4zOEMxNy43NyA3LjQxIDE3Ljc4IDcuNDQgMTcuNzggNy40N0MxNy45NCA5LjggMTcuODggMTIuMTMgMTcuNjEgMTQuNDVDMTcuNDEgMTYuMTMgMTYuMDYgMTcuNDUgMTQuMzggMTcuNjRDMTEuNDcgMTcuOTYgOC41MyAxNy45NiA1LjYyIDE3LjY0QzMuOTQgMTcuNDUgMi41OSAxNi4xMyAyLjM5IDE0LjQ1QzIuMDUgMTEuNDkgMi4wNSA4LjUxIDIuMzkgNS41NUMyLjU5IDMuODcgMy45NCAyLjU1IDUuNjIgMi4zNkM3LjgzIDIuMTIgMTAuMDYgMi4wNiAxMi4yOCAyLjE4QzEyLjMxIDIuMTkgMTIuMzQgMi4yIDEyLjM2IDIuMjJDMTIuMzkgMi4yNCAxMi40MSAyLjI2IDEyLjQyIDIuMjlDMTIuNDMgMi4zMiAxMi40MyAyLjM1IDEyLjQzIDIuMzhDMTIuNDIgMi40MiAxMi40IDIuNDQgMTIuMzggMi40N0wxMS41NSAzLjI5QzExLjUyIDMuMzMgMTEuNDggMy4zNSAxMS40NCAzLjM3QzExLjQgMy4zOCAxMS4zNSAzLjM5IDExLjMxIDMuMzlDOS40NSAzLjMzIDcuNiAzLjQgNS43NiAzLjZDNS4yMiAzLjY2IDQuNzIgMy45IDQuMzMgNC4yOEMzLjk1IDQuNjYgMy43IDUuMTYgMy42MyA1LjdDMy4zIDguNTYgMy4zIDExLjQ0IDMuNjMgMTQuM0MzLjcgMTQuODQgMy45NSAxNS4zNCA0LjMzIDE1LjcyQzQuNzIgMTYuMSA1LjIyIDE2LjM0IDUuNzYgMTYuNEM4LjU1IDE2LjcxIDExLjQ1IDE2LjcxIDE0LjI0IDE2LjRDMTQuNzggMTYuMzQgMTUuMjggMTYuMSAxNS42NyAxNS43MkMxNi4wNiAxNS4zNCAxNi4zIDE0Ljg0IDE2LjM3IDE0LjNaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==" alt="" width={20} height={20} style={{ flex: "0 0 20px" }} />
            Đoạn chat mới
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#272727", whiteSpace: "nowrap" }}>Câu hỏi gần đây</div>
            <div>
              {[
                { q: "Quy định về giờ yên tĩnh?", time: "10:30 AM" },
                { q: "Phí gửi xe ô tô hiện tại?", time: "Hôm qua" },
                { q: "Cách đăng ký thẻ từ cho người thân?", time: "2 ngày trước" },
                { q: "Quy định về nuôi thú cưng?", time: "3 ngày trước" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", gap: "4px",
                  padding: "8px 0",
                  borderTop: i === 0 ? "none" : "1px solid #eff2fc",
                  paddingTop: i === 0 ? 0 : "8px",
                  cursor: "pointer",
                }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#272727", lineHeight: "18px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.q}</div>
                  <div style={{ fontSize: "11px", color: "#585c7b" }}>{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Chat thread */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: "16px", padding: "12px 0 4px" }}>

            {/* User message */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ background: "#f7f5ff", borderRadius: "18px 18px 4px 18px", padding: "14px 18px", maxWidth: "60%", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "14px", color: "#272727", lineHeight: "22px" }}>Quy định về giờ yên tĩnh tại chung cư là như thế nào?</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#585c7b" }}>10:30 AM</span>
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMiA4TDUuNSAxMS41TDEwIDUiIHN0cm9rZT0iIzQxMzdGOSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik02IDhMOS41IDExLjVMMTQgNSIgc3Ryb2tlPSIjNDEzN0Y5IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="" width={12} height={12} style={{ flex: "0 0 12px" }} />
                </div>
              </div>
            </div>

            {/* Bot message */}
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", paddingRight: "60px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", flex: "0 0 36px", overflow: "hidden" }}>
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNCIgY3k9IjE0IiByPSIxMiIgZmlsbD0iIzQxMzdGOSIvPjxwYXRoIGQ9Ik05IDE0LjVDOSAxNC41IDEwLjUgMTMgMTQgMTNDMTcuNSAxMyAxOSAxNC41IDE5IDE0LjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSIxMSIgY3k9IjExIiByPSIxLjUiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iMTciIGN5PSIxMSIgcj0iMS41IiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0xNCAxN1YxOSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==" alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0, background: "#ffffff", border: "1px solid #e2e5f1", borderRadius: "4px 18px 18px 18px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>

                {/* Intro */}
                <div style={{ fontSize: "14px", color: "#272727", lineHeight: "22px" }}>
                  Theo <strong>Nội quy quản lý, sử dụng chung cư Sunshine Riverside</strong>, quy định về giờ yên tĩnh như sau:
                </div>

                {/* Highlight card */}
                <div style={{ background: "#f7f5ff", border: "1px solid #d3c5fd", borderRadius: "12px", padding: "15px 17px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "28px", height: "28px", background: "#ffffff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQgMkwxNiA5SDIzTDE3LjUgMTMuNUwxOS41IDIxTDE0IDE2LjVMOC41IDIxTDEwLjUgMTMuNUw1IDlIMTJMMTQgMloiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="" width={16} height={16} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#272727", lineHeight: "22px" }}>Giờ yên tĩnh</div>
                    <div style={{ fontSize: "13.5px", color: "#3e4265", lineHeight: "22px" }}>Từ <strong>22:00</strong> đến <strong>06:00</strong> sáng hôm sau</div>
                  </div>
                </div>

                <div style={{ fontSize: "14px", color: "#272727", lineHeight: "22px" }}>Trong khoảng thời gian này, cư dân vui lòng:</div>

                {/* Checklist */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {["Hạn chế gây tiếng ồn lớn", "Không sử dụng thiết bị âm thanh công suất lớn", "Không tổ chức tiệc tùng, hát karaoke", "Không làm việc gây tiếng động mạnh"].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "18px", height: "18px", background: "#52c41a", borderRadius: "9px", flex: "0 0 18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAuNiAxMy44TDguNDUgMTEuNjVDOC4yNyAxMS40NyA4LjAzIDExLjM4IDcuNzUgMTEuMzhDNy40NyAxMS4zOCA3LjIzIDExLjQ3IDcuMDUgMTEuNjVDNi44NyAxMS44MyA2Ljc4IDEyLjA3IDYuNzggMTIuMzVDNi43OCAxMi42MyA2Ljg3IDEyLjg3IDcuMDUgMTMuMDVMOS45IDE1LjlDMTAuMSAxNi4xIDEwLjMzIDE2LjIgMTAuNiAxNi4yQzEwLjg3IDE2LjIgMTEuMSAxNi4xIDExLjMgMTUuOUwxNi45NSAxMC4yNUMxNy4xMyAxMC4wNyAxNy4yMiA5LjgzIDE3LjIyIDkuNTVDMTcuMjIgOS4yNyAxNy4xMyA5LjAzIDE2Ljk1IDguODVDMTYuNzcgOC42NyAxNi41MyA4LjU4IDE2LjI1IDguNThDMTUuOTcgOC41OCAxNS43MyA4LjY3IDE1LjU1IDguODVMMTAuNiAxMy44Wk0xMiAyMkMxMC42MiAyMiA5LjMyIDIxLjc0IDguMSAyMS4yMUM2Ljg4IDIwLjY5IDUuODMgMTkuOTcgNC45MyAxOS4wOEM0LjAzIDE4LjE4IDMuMzEgMTcuMTIgMi43OSAxNS45QzIuMjYgMTQuNjggMiAxMy4zOCAyIDEyQzIgMTAuNjIgMi4yNiA5LjMyIDIuNzkgOC4xQzMuMzEgNi44OCA0LjAzIDUuODIgNC45MyA0LjkzQzUuODIgNC4wMyA2Ljg4IDMuMzEgOC4xIDIuNzlDOS4zMiAyLjI2IDEwLjYyIDIgMTIgMkMxMy4zOCAyIDE0LjY4IDIuMjYgMTUuOSAyLjc5QzE3LjEyIDMuMzEgMTguMTggNC4wMyAxOS4wOCA0LjkzQzE5Ljk3IDUuODIgMjAuNjkgNi44OCAyMS4yMSA4LjFDMjEuNzQgOS4zMiAyMiAxMC42MiAyMiAxMkMyMiAxMy4zOCAyMS43NCAxNC42OCAyMS4yMSAxNS45QzIwLjY5IDE3LjEyIDE5Ljk4IDE4LjE4IDE5LjA4IDE5LjA4QzE4LjE3IDE5Ljk3IDE3LjEyIDIwLjY5IDE1LjkgMjEuMjFDMTQuNjggMjEuNzQgMTMuMzggMjIgMTIgMjJaIiBmaWxsPSIjNjIzOEREIi8+PC9zdmc+" alt="" width={10} height={10} />
                      </div>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#3e4265", lineHeight: "22px" }}>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: "14px", color: "#272727", lineHeight: "22px" }}>
                  Quy định này nhằm đảm bảo không gian nghỉ ngơi, sinh hoạt chung văn minh và thoải mái cho tất cả cư dân.
                </div>

                {/* Source */}
                <div style={{ fontSize: "13px", color: "#3e4265", lineHeight: "21px" }}>
                  Nguồn: <a href="#" style={{ color: "#4137f9", fontWeight: 500 }}>Nội quy quản lý, sử dụng chung cư Sunshine Riverside (Điều 12.3)</a>
                </div>

                {/* Footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "13px", borderTop: "1px solid #eff2fc" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {[
                      { icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTEuODc1IDE0LjM3NUwxNC4zNzUgOC43NUMxNC44NzIgOC43NSAxNS4zNSA4Ljk0OCAxNS43MDEgOS4yOTlDMTYuMDUzIDkuNjUxIDE2LjI1IDEwLjEyOCAxNi4yNSAxMC42MjVWMTMuMTI1SDE5LjgxM0MxOS45OTIgMTMuMTI3IDIwLjE2OCAxMy4xNjcgMjAuMzMxIDEzLjI0MkMyMC40OTMgMTMuMzE4IDIwLjYzNyAxMy40MjggMjAuNzUzIDEzLjU2NEMyMC44NjkgMTMuNyAyMC45NTUgMTMuODYgMjEuMDA0IDE0LjAzMkMyMS4wNTMgMTQuMjA1IDIxLjA2NCAxNC4zODUgMjEuMDM4IDE0LjU2M0wyMC4xNzUgMjAuMTg4QzIwLjEzIDIwLjQ4NiAxOS45NzggMjAuNzU3IDE5Ljc0OSAyMC45NTNDMTkuNTE5IDIxLjE0OCAxOS4yMjcgMjEuMjUzIDE4LjkyNSAyMS4yNUgxMS44NzVNMTEuODc1IDE0LjM3NVYyMS4yNU0xMS44NzUgMTQuMzc1SDEwQzkuNjY4IDE0LjM3NSA5LjM1MSAxNC41MDcgOS4xMTYgMTQuNzQxQzguODgyIDE0Ljk3NiA4Ljc1IDE1LjI5NCA4Ljc1IDE1LjYyNVYyMEM4Ljc1IDIwLjMzMiA4Ljg4MiAyMC42NSA5LjExNiAyMC44ODRDOS4zNTEgMjEuMTE4IDkuNjY4IDIxLjI1IDEwIDIxLjI1SDExLjg3NSIgc3Ryb2tlPSIjNTg1QzdCIiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=", title: "Hữu ích" },
                      { icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTguMTI1IDE1LjYyNUwxNS42MjUgMjEuMjVDMTUuMTI4IDIxLjI1IDE0LjY1MSAyMS4wNTIgMTQuMjk5IDIwLjcwMUMxMy45NDcgMjAuMzQ5IDEzLjc1IDE5Ljg3MiAxMy43NSAxOS4zNzVWMTYuODc1SDEwLjE4OEMxMC4wMDggMTYuODc0IDkuODMyIDE2LjgzNCA5LjY2OSAxNi43NThDOS41MDcgMTYuNjgyIDkuMzYzIDE2LjU3MiA5LjI0NyAxNi40MzZDOS4xMzEgMTYuMyA5LjA0NSAxNi4xNCA4Ljk5NiAxNS45NjhDOC45NDcgMTUuNzk1IDguOTM2IDE1LjYxNSA4Ljk2MiAxNS40MzdMOS44MjUgOS44MTNDOS44NyA5LjUxNSAxMC4wMjIgOS4yNDMgMTAuMjUxIDkuMDQ4QzEwLjQ4MSA4Ljg1MiAxMC43NzQgOC43NDcgMTEuMDc1IDguNzVIMTguMTI1TTE4LjEyNSAxNS42MjVWOC43NU0xOC4xMjUgMTUuNjI1SDIwQzIwLjMzMSAxNS42MjUgMjAuNjQ5IDE1LjQ5MyAyMC44ODQgMTUuMjU5QzIxLjExOCAxNS4wMjUgMjEuMjUgMTQuNzA2IDIxLjI1IDE0LjM3NVYxMEMyMS4yNSA5LjY2OSAyMS4xMTggOS4zNTEgMjAuODg0IDkuMTE2QzIwLjY0OSA4Ljg4MiAyMC4zMzEgOC43NSAyMCA4Ljc1SDE4LjEyNSIgc3Ryb2tlPSIjNTg1QzdCIiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=", title: "Không hữu ích" },
                      { icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNi44NzUgNi4yNUg1LjYyNUM0LjU5IDYuMjUgMy43NSA3LjA5IDMuNzUgOC4xMjVWMTQuMzc1QzMuNzUgMTUuNDEgNC41OSAxNi4yNSA1LjYyNSAxNi4yNUgxMS44NzVDMTIuOTEgMTYuMjUgMTMuNzUgMTUuNDEgMTMuNzUgMTQuMzc1VjguMTI1QzEzLjc1IDcuMDkgMTIuOTEgNi4yNSAxMS44NzUgNi4yNUgxMS4yNU02LjI1IDMuNzVMOC43NSAxLjI1TDExLjI1IDMuNzVNOC43NSAxLjI1VjEwLjYyNU0xMy43NSA4Ljc1SDE0LjM3NUMxNS40MSA4Ljc1IDE2LjI1IDkuNTkgMTYuMjUgMTAuNjI1VjE2Ljg3NUMxNi4yNSAxNy45MSAxNS40MSAxOC43NSAxNC4zNzUgMTguNzVIOC4xMjVDNy4wOSAxOC43NSA2LjI1IDE3LjkxIDYuMjUgMTYuODc1VjE2LjI1IiBzdHJva2U9IiMyNDY2QzkiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=", title: "Sao chép" },
                      { icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNi4wMTQgMTAuOTExQzYuMTY0IDEwLjY0MSA2LjI1IDEwLjMzIDYuMjUgMTBDNi4yNSA5LjY2OSA2LjE2NCA5LjM1OSA2LjAxNCA5LjA4OUM1LjY5NCA4LjUxNCA1LjA4IDguMTI1IDQuMzc1IDguMTI1QzMuMzQgOC4xMjUgMi41IDguOTY1IDIuNSAxMEMyLjUgMTEuMDM2IDMuMzQgMTEuODc1IDQuMzc1IDExLjg3NUM1LjA4IDExLjg3NSA1LjY5NCAxMS40ODYgNi4wMTQgMTAuOTExWk02LjAxNCA5LjA4OUwxMy45ODYgNC42NjFNNi4wMTQgMTAuOTExTDEzLjk4NiAxNS4zMzlNMTMuOTg2IDE1LjMzOUMxMy44MzYgMTUuNjA5IDEzLjc1IDE1LjkyIDEzLjc1IDE2LjI1QzEzLjc1IDE3LjI4NiAxNC41OSAxOC4xMjUgMTUuNjI1IDE4LjEyNUMxNi42NjEgMTguMTI1IDE3LjUgMTcuMjg2IDE3LjUgMTYuMjVDMTcuNSAxNS4yMTQgMTYuNjYxIDE0LjM3NSAxNS42MjUgMTQuMzc1QzE0LjkyIDE0LjM3NSAxNC4zMDYgMTQuNzY0IDEzLjk4NiAxNS4zMzlaTTEzLjk4NiA0LjY2MUMxNC4zMDYgNS4yMzYgMTQuOTIgNS42MjUgMTUuNjI1IDUuNjI1QzE2LjY2MSA1LjYyNSAxNy41IDQuNzg2IDE3LjUgMy43NUMxNy41IDIuNzE0IDE2LjY2MSAxLjg3NSAxNS42MjUgMS44NzVDMTQuNTkgMS44NzUgMTMuNzUgMi43MTQgMTMuNzUgMy43NUMxMy43NSA0LjA4MSAxMy44MzYgNC4zOTEgMTMuOTg2IDQuNjYxWiIgc3Ryb2tlPSIjMjQ2NkM5IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+", title: "Chia sẻ" },
                    ].map((btn) => (
                      <div key={btn.title} title={btn.title} style={{ width: "30px", height: "30px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <img src={btn.icon} alt={btn.title} width={15} height={15} />
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: "11.5px", color: "#585c7b" }}>10:30 AM</span>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom: chips + composer */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Follow-up chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
              {[
                "Quy định về nuôi thú cưng?",
                "Phí quản lý hàng tháng là bao nhiêu?",
                "Quy trình xử lý khi mất thẻ từ?",
              ].map((chip) => (
                <button key={chip} style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "#ffffff", border: "1px solid #d4d7e5",
                  borderRadius: "999px", padding: "12px 19px",
                  fontSize: "13.5px", fontWeight: 500, color: "#272727",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}>
                  {chip}
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAxMS4yQzcuNTMgMTEuMiA3LjA3IDExLjAyIDYuNzEgMTAuNjdMMi4zNyA2LjMyQzIuMTcgNi4xMyAyLjE3IDUuODEgMi4zNyA1LjYxQzIuNTYgNS40MiAyLjg4IDUuNDIgMy4wNyA1LjYxTDcuNDIgOS45NkM3Ljc0IDEwLjI4IDguMjYgMTAuMjggOC41OCA5Ljk2TDEyLjkzIDUuNjFDMTMuMTIgNS40MiAxMy40NCA1LjQyIDEzLjYzIDUuNjFDMTMuODMgNS44MSAxMy44MyA2LjEzIDEzLjYzIDYuMzJMOS4yOSAxMC42N0M4LjkzIDExLjAyIDguNDcgMTEuMiA4IDExLjJaIiBmaWxsPSIjMTcxNzE3Ii8+PC9zdmc+" alt="" width={14} height={14} style={{ flex: "0 0 14px" }} />
                </button>
              ))}
            </div>

            {/* Composer */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "12px",
                background: "#ffffff", border: "1px solid #d3c5fd",
                borderRadius: "16px", padding: "15px 19px",
                boxShadow: "0 2px 7px rgba(65,55,249,.05)", width: "100%",
              }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", flex: "0 0 34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOS4xNSA4Ljg1TDguMDkgOS45MUM3LjUxIDEwLjQ5IDcuNTEgMTEuNDQgOC4wOSAxMi4wM0M4LjY4IDEyLjYxIDkuNjMgMTIuNjEgMTAuMjIgMTIuMDNMMTEuODggMTAuMzZDMTMuMDUgOS4xOSAxMy4wNSA3LjMgMTEuODggNi4xMkMxMC43MSA0Ljk1IDguODEgNC45NSA3LjY0IDYuMTJMNS44MiA3LjkzQzQuODIgOC45NCA0LjgyIDEwLjU3IDUuODIgMTEuNTciIHN0cm9rZT0iIzIyNjJFQSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTkgMTYuNUMxMy4xNDIgMTYuNSAxNi41IDEzLjE0MiAxNi41IDlDMTYuNSA0Ljg1OCAxMy4xNDIgMS41IDkgMS41QzQuODU4IDEuNSAxLjUgNC44NTggMS41IDlDMS41IDEzLjE0MiA0Ljg1OCAxNi41IDkgMTYuNVoiIHN0cm9rZT0iIzIyNjJFQSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="" width={18} height={18} />
                </div>
                <input
                  type="text"
                  placeholder="Nhập câu hỏi của bạn..."
                  style={{ flex: 1, minWidth: 0, border: 0, outline: 0, fontSize: "14px", color: "#272727", background: "transparent" }}
                />
                <div style={{ width: "42px", height: "42px", background: "#4137f9", borderRadius: "10px", flex: "0 0 42px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOC4zMyAxMS45MlY0LjE3TDUuNjcgNi45OUM1LjQxIDcuMjYgNC45OCA3LjI3IDQuNzEgNy4wMkM0LjQ0IDYuNzYgNC40MyA2LjMzIDQuNjkgNi4wNkw4LjUxIDIuMDFDOC42NCAxLjg4IDguODEgMS44IDkgMS44QzkuMTkgMS44IDkuMzYgMS44OCA5LjQ5IDIuMDFMMTMuMzIgNi4wNkMxMy41NyA2LjMzIDEzLjU3IDYuNzYgMTMuMjkgNy4wMkMxMy4wMiA3LjI3IDEyLjU5IDcuMjYgMTIuMzQgNi45OUw5LjY4IDQuMTdWMTEuOTJDOS42OCAxMi4zIDkuMzcgMTIuNiA5IDEyLjZDOC42MyAxMi42IDguMzMgMTIuMyA4LjMzIDExLjkyWk0zLjE1IDExLjQ3VjEzLjcyQzMuMTUgMTUuMDkgNC4yNiAxNi4yIDUuNjMgMTYuMkgxMy43M0MxNS4wOSAxNi4yIDE2LjIgMTUuMDkgMTYuMiAxMy43MlYxMS40N0MxNi4yIDExLjEgMTUuOSAxMC44IDE1LjUzIDEwLjhDMTUuMTUgMTAuOCAxNC44NSAxMS4xIDE0Ljg1IDExLjQ3VjEzLjcyQzE0Ljg1IDE0LjM1IDE0LjM1IDE0Ljg1IDEzLjczIDE0Ljg1SDUuNjNDNS4wIDE0Ljg1IDQuNSAxNC4zNSA0LjUgMTMuNzJWMTEuNDdDNC41IDExLjEgNC4yIDEwLjggMy44MyAxMC44QzMuNDUgMTAuOCAzLjE1IDExLjEgMy4xNSAxMS40N1oiIGZpbGw9IiMyNzI3MjciLz48L3N2Zz4=" alt="" width={18} height={18} />
                </div>
              </div>
              <span style={{ fontSize: "12px", color: "#585c7b", textAlign: "center", whiteSpace: "nowrap" }}>
                AI có thể mắc sai sót. Vui lòng kiểm tra lại thông tin quan trọng.
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
