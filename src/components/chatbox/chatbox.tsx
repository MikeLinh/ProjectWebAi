import React, { useState, useRef, useEffect, useCallback } from "react";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const CONTEXT_API = "http://localhost:8080/api/chat/context";

export default function AIChatbot() {
  const [isOpen, setIsOpen]       = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping]   = useState(false);
  const [aiContext, setAiContext]  = useState<string | null>(null);
  const [contextError, setContextError] = useState(false);
  const [messages, setMessages]   = useState<Message[]>([
    {
      id: 1,
      text: "Xin chào! Mình là trợ lý AI của BIKECYC STORE 🚲\nBạn cần tư vấn về mẫu xe nào ạ?",
      sender: "bot",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống cuối mỗi khi có tin mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Fetch context từ backend 1 lần khi mở chatbot lần đầu
  const fetchContext = useCallback(async () => {
    if (aiContext !== null) return; // đã có rồi, không fetch lại
    try {
      const res = await fetch(CONTEXT_API);
      if (!res.ok) throw new Error("Context API lỗi");
      const text = await res.text();
      setAiContext(text);
      setContextError(false);
    } catch (err) {
      console.error("Không lấy được context:", err);
      setContextError(true);
      // Dùng fallback tĩnh nếu backend chưa sẵn sàng
      setAiContext(
        "Bạn là trợ lý AI của BIKECYC STORE. Hãy tư vấn xe đạp một cách nhiệt tình và ngắn gọn."
      );
    }
  }, [aiContext]);

  const handleOpen = () => {
    setIsOpen(true);
    fetchContext();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: userText, sender: "user" },
    ]);
    setInputValue("");
    setIsTyping(true);

    const apiKey  = import.meta.env.VITE_GEMINI_API_KEY;
    const baseUrl = import.meta.env.VITE_GEMINI_API_URL;
    const url     = `${baseUrl}?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  // Nhúng context DB thật vào mỗi prompt
                  text: `${aiContext}\n\nKhách hàng hỏi: ${userText}`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("Lỗi Gemini:", err);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (botReply) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: botReply, sender: "bot" },
        ]);
      } else {
        throw new Error("Phản hồi Gemini không hợp lệ");
      }
    } catch (err) {
      console.error("Lỗi gửi tin:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Hệ thống đang bận, bạn thử lại sau nhé! 🙏",
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[500px] bg-[#1a1a1a] text-white border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-blue-950 p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg text-white">
                <SmartToyIcon />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">BIKECYC AI Assistant</h3>
                <p className="text-xs flex items-center gap-1">
                  {aiContext === null ? (
                    <span className="text-amber-400 animate-pulse">⏳ Đang tải dữ liệu...</span>
                  ) : contextError ? (
                    <span className="text-red-400">⚠ Chế độ offline</span>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
                      <span className="text-green-400">Trực tuyến · Dữ liệu thật</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
            >
              <CloseIcon style={{ fontSize: 20 }} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#fffefe]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-800 text-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-400 px-4 py-2 rounded-2xl rounded-bl-none text-xs animate-pulse">
                  AI đang xử lý...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#1a1a1a] border-t border-gray-800 flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping || aiContext === null}
              placeholder={
                aiContext === null
                  ? "Đang tải dữ liệu sản phẩm..."
                  : isTyping
                  ? "AI đang gõ..."
                  : "Nhập câu hỏi của bạn..."
              }
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isTyping || aiContext === null}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              <SendIcon style={{ fontSize: 18 }} />
            </button>
          </form>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen ? "bg-red-500 rotate-90" : "bg-blue-600"
        }`}
      >
        {isOpen ? (
          <CloseIcon style={{ fontSize: 26 }} />
        ) : (
          <SmartToyIcon style={{ fontSize: 26 }} />
        )}
      </button>
    </div>
  );
}