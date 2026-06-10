"use client";

import { useRef, useState } from "react";
import { apiPost } from "@/lib/api";

interface Msg {
  role: "user" | "assistant";
  content: string;
}
interface ChatResponse {
  reply: string;
  degraded?: boolean;
}

const SUGGESTIONS: Record<string, string[]> = {
  resident: [
    "Quy định về giờ yên tĩnh?",
    "Phí gửi xe ô tô hiện tại?",
    "Cách đăng ký thẻ từ cho người thân?",
    "Quy định về nuôi thú cưng?",
  ],
  admin: [
    "Quy trình xử lý phản ánh khẩn cấp?",
    "Cách lập hóa đơn phí hàng loạt?",
    "Gợi ý nội dung thông báo cắt nước?",
    "Checklist bàn giao căn hộ mới?",
  ],
};

export function AiChat({ scope, title, subtitle }: { scope: "resident" | "admin"; title: string; subtitle: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<ChatResponse>("/ai/chat", { scope, messages: next });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch {
      setError("Không gửi được câu hỏi. Vui lòng thử lại.");
      setMessages(messages);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }

  function newChat() {
    setMessages([]);
    setInput("");
    setError(null);
  }

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, height: "100%", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: "36px", color: "#272727" }}>{title}</h1>
          <p style={{ fontSize: 16, color: "#585c7b", marginTop: 6, lineHeight: "24px", fontWeight: 500 }}>{subtitle}</p>
        </div>
        <button
          onClick={newChat}
          style={{ background: "#4137f9", color: "#fff", border: 0, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        >
          + Đoạn chat mới
        </button>
      </div>

      <div
        ref={threadRef}
        className="nc-scroll"
        style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "#fff", border: "1px solid #e2e5f1", borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}
      >
        {messages.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center", maxWidth: 520 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#272727", marginBottom: 6 }}>Xin chào! Tôi có thể giúp gì cho bạn?</div>
            <div style={{ fontSize: 14, color: "#585c7b", marginBottom: 16 }}>Chọn một gợi ý hoặc nhập câu hỏi của bạn</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {SUGGESTIONS[scope].map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  style={{ background: "#f3f4fb", border: "1px solid #e2e5f1", borderRadius: 12, padding: "8px 14px", fontSize: 13, color: "#3e4265", cursor: "pointer" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "78%",
                  padding: "11px 15px",
                  borderRadius: 14,
                  fontSize: 14,
                  lineHeight: "21px",
                  whiteSpace: "pre-wrap",
                  background: m.role === "user" ? "#4137f9" : "#f3f4fb",
                  color: m.role === "user" ? "#fff" : "#272727",
                }}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "11px 15px", borderRadius: 14, fontSize: 14, background: "#f3f4fb", color: "#585c7b" }}>Đang soạn trả lời…</div>
          </div>
        )}
        {error && <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 500 }}>{error}</div>}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        style={{ flexShrink: 0, display: "flex", gap: 10 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi của bạn..."
          style={{ flex: 1, height: 46, border: "1px solid #d4d7e5", borderRadius: 12, padding: "0 16px", fontSize: 14, color: "#272727", outline: "none", background: "#fff" }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{ background: "#4137f9", color: "#fff", border: 0, borderRadius: 12, padding: "0 22px", fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer", opacity: loading || !input.trim() ? 0.6 : 1 }}
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
