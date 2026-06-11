import React, { useState, useRef, useEffect } from "react";
import SmartToyIcon from "@mui/icons-material/SmartToy"; // Icon robot AI
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

interface Message {
    id: number;
    text: string;
    sender: "user" | "bot";
}

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false); // Trạng thái đóng/mở hộp chat
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Xin chào! Mình là trợ lý AI của BIKECYC STORE. Bạn cần tư vấn về mẫu xe nào ạ? 🚴‍♂️", sender: "bot" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Tự động cuộn xuống tin nhắn mới nhất khi hội thoại dài ra
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    // Hàm xử lý gửi tin nhắn của người dùng
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            text: inputValue,
            sender: "user"
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");

        // Giả lập phản hồi tự động của AI sau 1 giây
        setTimeout(() => {
            const botReply: Message = {
                id: Date.now() + 1,
                text: `Cảm ơn bạn đã quan tâm đến "${userMessage.text}". Hiện tại cửa hàng đang có sẵn dòng Specialized Roubaix và Canyon Spectral với ưu đãi trả góp 0%. Bạn có muốn xem cấu hình chi tiết không?`,
                sender: "bot"
            };
            setMessages((prev) => [...prev, botReply]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            
            {/* CỬA SỔ CHAT AI */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[500px] bg-[#1a1a1a] text-white border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform translate-y-0 scale-100">
                    
                    {/* Header Hộp Chat */}
                    <div className="bg-blue-950 p-4 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500 rounded-lg text-white">
                                <SmartToyIcon />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide">BIKECYC AI Assistant</h3>
                                <p className="text-xs text-green-400 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Trực tuyến
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
                        >
                            <CloseIcon style={{ fontSize: 20 }} />
                        </button>
                    </div>

                    {/* Vùng chứa các nội dung tin nhắn */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#121212]">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    msg.sender === "user" 
                                        ? "bg-blue-600 text-white rounded-br-none" 
                                        : "bg-gray-800 text-gray-200 rounded-bl-none"
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Thanh nhập dữ liệu chat */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-[#1a1a1a] border-t border-gray-800 flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Nhập câu hỏi của bạn tại đây..."
                            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button 
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl transition-colors flex items-center justify-center shrink-0"
                        >
                            <SendIcon style={{ fontSize: 18 }} />
                        </button>
                    </form>
                </div>
            )}

            {/*NÚT BẤM TRÒN AI*/}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isOpen 
                        ? "bg-red-500 hover:bg-red-600 rotate-90" 
                        : "bg-blue-600 hover:bg-blue-700 animate-bounce-slow"
                }`}
                title="Trò chuyện với AI"
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