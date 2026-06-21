import React, { useState, useRef, useEffect } from "react";
import SmartToyIcon from "@mui/icons-material/SmartToy"; 
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const AI_CONTEXT = `
Bạn là trợ lý AI thông minh của BIKECYC STORE. Hãy dùng danh sách sản phẩm sau để tư vấn ngắn gọn, nhiệt tình:
- Mountain Bike X1: Giá $1200 (Gốc $1500), giảm 20%. Đánh giá 5 sao.
- Road Bike Pro: Giá $950 (Gốc $1100), giảm 15%.
- Electric Bike E7: Giá $1800 (Gốc $2200), giảm 18%. Xe điện bán chạy.
Chỉ tư vấn thông tin xoay quanh các sản phẩm này. Nếu khách hỏi sản phẩm không có, hãy khéo léo hướng họ về các mẫu trên.
`;

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false); 
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Xin chào! Mình là trợ lý AI của BIKECYC STORE. Bạn cần tư vấn về mẫu xe nào ạ?", sender: "bot" }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    setMessages((prev) => [...prev, { id: Date.now(), text: userText, sender: "user" }]);
    setInputValue("");
    setIsTyping(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const baseUrl = import.meta.env.VITE_GEMINI_API_URL;
    const url = `${baseUrl}?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { 
                  text: `${AI_CONTEXT}\n\nKhách hàng hỏi: ${userText}` 
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Chi tiết phản hồi lỗi từ Google:", errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const botReply = data.candidates[0].content.parts[0].text;
        setMessages((prev) => [...prev, { id: Date.now() + 1, text: botReply, sender: "bot" }]);
      } else {
        throw new Error("Cấu trúc JSON phản hồi không như mong đợi");
      }

    } catch (err) {
      console.error("Lỗi bắt được:", err);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: "Hệ thống bận, bạn thử lại nhé!", sender: "bot" }]);
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
              <div className="p-2 bg-blue-500 rounded-lg text-white"><SmartToyIcon /></div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">BIKECYC AI Assistant</h3>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Trực tuyến
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800">
              <CloseIcon style={{ fontSize: 20 }} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#fffefe]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-800 text-gray-200 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-400 px-4 py-2 rounded-2xl rounded-bl-none text-xs flex gap-1 animate-pulse">
                  <span>AI đang xử lý...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#1a1a1a] border-t border-gray-800 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              placeholder={isTyping ? "AI đang gõ..." : "Nhập câu hỏi của bạn..."}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button type="submit" disabled={isTyping} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50">
              <SendIcon style={{ fontSize: 18 }} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen ? "bg-red-500 rotate-90" : "bg-blue-600"
        }`}
      >
        {isOpen ? <CloseIcon style={{ fontSize: 26 }} /> : <SmartToyIcon style={{ fontSize: 26 }} />}
      </button>
    </div>
  );
}