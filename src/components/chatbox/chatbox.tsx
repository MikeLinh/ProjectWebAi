import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

// Kiểu dữ liệu cấu trúc cho một sản phẩm trong hệ thống
interface Product {
  productId: number;
  productName: string;
  brand?: string;
  price?: number;
  description?: string;
  stockQuantity?: number;
  imageUrl?: string;
}
// Kiểu dữ liệu cấu trúc cho một tin nhắn chat
interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  matchedProducts?: Product[];
}
// Đường dẫn API lấy ngữ cảnh AI và lấy danh sách sản phẩm từ Backend
const CONTEXT_API = "http://localhost:8080/api/chat/context";
const PRODUCTS_API = "http://localhost:8080/api/products";

//tạo những từ khoá nhạy cảm thành mã Base64
const ENCRYPTED_KEYWORDS = "Z2nhur90LGtpbGwsY2jhur90LHQresourcevIHPDoXQsdOG7sSBo4bqhaSxib21iLG7hu58sZMOBbmgsxJHDom0saGnhur9wLHJhcGUscG9ybixzZXgsbnVkZSxjaOG7rWksxJHhu4t0LG3hurUgbcOgeSxmdWNrLSRtLHZjbCx2bCxjbCvxkW1tLGPhurdjLGzhu5NuLGLFAyxzbWw=";


//Hàm giải mã chuỗi Base64
const getHarmfulKeywords = (): string[] => {
  try {
    // Giải mã Base64 thành chuỗi decodeURIComponent(UTF-8), sau đó tách ra thành mảng bằng dấu phẩy, escape(xử lý ký tự đặc biệt)
    const decoded = decodeURIComponent(escape(atob(ENCRYPTED_KEYWORDS))); //atob (viết tắt của ASCII to Binary) là một hàm có sẵn của trình duyệt, nhận chuỗi và dịch ngược, 
    return decoded.split(","); //Chuyển thành mảng cách nhau bằng dấu ","
  } catch (error) {
    console.log(error)
    return [];
  }
};
//Hàm kiểm tra xem văn bản người dùng nhập vào có chứa từ khóa cấm nào không
const isHarmfulContent = (text: string): boolean => {
  const lower = text.toLowerCase().trim(); //Chuyển thành chữ thường
  const keywords = getHarmfulKeywords(); // Lấy mảng từ khóa đã giải mã
  return keywords.some((word) => lower.includes(word)); // Trả về true nếu văn bản chứa ít nhất một từ trong danh sách cấm
};

//Hàm xử lý lấy đường dẫn ảnh đầy đủ cho sản phẩm
const getFullImageUrl = (imageName?: string): string => {
  if (!imageName) {
    // Nếu không có ảnh, trả về ảnh mặc định của xe đạp trong thư mục local
    return new URL("../../assets/images/bike1.png", import.meta.url).href;
  }
  // Nếu đường dẫn ảnh đã là một link trực tuyến (http), trả về chính nó
  if (imageName.startsWith("http")) return imageName;
  // Nếu là tên file cục bộ, gộp với thư mục chứa ảnh cục bộ
  return new URL(`../../assets/images/${imageName}`, import.meta.url).href;
};

//Hàm tìm tên sản phẩm xuất hiện trong câu trả lời của AI để tự động hiển thị thẻ sản phẩm đó bên dưới
function matchProductsInText(text: string, products: Product[]): Product[] {
  const lower = text.toLowerCase();
  const found: Product[] = [];
  const seen = new Set<number>(); // Set để kiểm tra trùng lặp ID sản phẩm

  // Sắp xếp sản phẩm theo độ dài tên giảm dần, tránh nhận diện sai
  const sorted = [...products].sort((a, b) => b.productName.length - a.productName.length);

  for (const p of sorted) {
    if (seen.has(p.productId)) continue; // Nếu sản phẩm này đã được thêm rồi thì bỏ qua
    // Nếu trong câu thoại của AI có chứa tên sản phẩm
    if (lower.includes(p.productName.toLowerCase())) {
      found.push(p);
      seen.add(p.productId); // Đánh dấu sản phẩm này đã khớp
    }
  }
  return found;
}
//Hàm tìm kiếm Offline dự phòng khi không thể kết nối tới API AI
function offlineSearch(query: string, products: Product[]) {
  const q = query.toLowerCase();
  const matched = products
  // Lọc sản phẩm trùng khớp với từ khóa người dùng nhập ở các trường: tên, thương hiệu hoặc mô tả
    .filter((p) =>
      p.productName.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    )
    .slice(0, 3); 
  //Trường hợp nếu AI chưa hiểu và tìm thấy từ khoá thích hợp
  if (matched.length === 0) {
    return {
      reply: "Hệ thống đang bận, mình chưa tìm được sản phẩm phù hợp! \nBạn thử hỏi lại sau nhé!",
      matched: [],
    };
  }
  //Trường hợp API của AI không hoạt động sẽ sử dụng những data được lấy từ CSDL
  return {
    reply: `Hệ thống AI đang bận, nhưng mình tìm thấy ${matched.length} sản phẩm có thể phù hợp:`,
    matched,
  };
}
//Hàm xóa bỏ định dạng in đậm/in nghiêng Markdown của AI trước khi hiển thị
function renderBotText(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
}
//Định nghĩa thẻ hiển thị sản phẩm
interface ProductCardProps {
  product: Product;
  onNavigate: (product: Product) => void;
}

function ProductCard({ product, onNavigate }: ProductCardProps) {
  return (
    <div className="mt-2 bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm max-w-[85%] w-full">
      {/* Hiển thị ảnh sản phẩm nếu có*/}
      {product.imageUrl && (
        <img
          src={getFullImageUrl(product.imageUrl)}
          alt={product.productName}
          className="w-full h-32 object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}
       {/* Hiển thị tên, giá, mô tả sản phẩm*/}
      <div className="px-3 pt-2 pb-1 space-y-0.5">
        <p className="text-[12px] font-bold text-gray-900 leading-snug">
          {product.productName}
        </p>
        {product.price != null && (
          <p className="text-[12px] font-semibold text-red-500">
            ${Number(product.price).toLocaleString()}
          </p>
        )}
        {product.description && (
          <p className="text-[11px] text-gray-500 line-clamp-2 leading-snug">
            {product.description}
          </p>
        )}
      </div>
     {/* Nút di chuyển tới trang product*/}
      <button
        onClick={() => onNavigate(product)}
        className="w-full text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 py-1.5 transition-colors mt-1"
      >
        Xem chi tiết
      </button>
    </div>
  );
}
//Component AI
export default function AIChatbot() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(""); // Dữ liệu khi người dùng gõ vào ô chat
  const [isTyping, setIsTyping] = useState(false); //Phần AI xử lý thông tin/ gõ chữ
  const [aiContext, setAiContext] = useState<string | null>(null); // Ngữ cảnh (System Prompt) huấn luyện AI
  const [contextError, setContextError] = useState(false); // Trạng thái kết nối API lỗi(offline)
  const [products, setProducts] = useState<Product[]>([]); // Danh sách sản phẩm load từ Backend

  // Khởi tạo mảng hội thoại ban đầu kèm tin chào mừng của Bot
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Xin chào! Mình là trợ lý AI của BIKECYC STORE 🚲\nBạn cần tư vấn về mẫu xe nào ạ?",
      sender: "bot",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null); // Tham chiếu dùng để điều khiển cuộn trang

  // Tự động cuộn xuống tin nhắn mới nhất mỗi khi có tin nhắn mới hoặc mở chatbox
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages, isOpen]);

  //Hàm gọi API lấy ngữ cảnh AI và danh sách sản phẩm
  const fetchContext = useCallback(async () => {
    if (aiContext !== null) return; //Nếu đã có dữ liệu rồi thì không gọi lại nữa
    try {
      const [ctxRes, prodRes] = await Promise.all([
        fetch(CONTEXT_API),
        fetch(PRODUCTS_API),
      ]);

      if (!ctxRes.ok) throw new Error("Context API lỗi");

      const [text, prodData] = await Promise.all([
        ctxRes.text(),
        prodRes.ok ? prodRes.json() : Promise.resolve([]), // Dự phòng mảng rỗng nếu API sản phẩm lỗi
      ]);

      setAiContext(text);
      setProducts(prodData);
      setContextError(false);
    } catch (err) {
      console.error("Không lấy được context:", err);
      setContextError(true);
      // Nạp cấu trúc Prompt cứng phòng hờ (Fallback) để đảm bảo bot vẫn hoạt động an toàn
      setAiContext(
        `Bạn là trợ lý AI của BIKECYC STORE - một cửa hàng xe đạp chuyên nghiệp và thân thiện.
        
        QUY TẮC BẮT BUỘC:
        - Tuyệt đối KHÔNG trả lời, KHÔNG tham gia, KHÔNG đùa giỡn với nội dung bạo lực, giết người, tự hại, tội phạm, khiêu dâm, chửi bới hoặc bất kỳ nội dung phản cảm nào.
        - Nếu phát hiện nội dung nguy hiểm hoặc phản cảm, hãy trả lời ngắn gọn: "Xin lỗi, mình không thể hỗ trợ chủ đề này." và chuyển hướng về tư vấn xe đạp.
        - Luôn giữ giọng điệu chuyên nghiệp, tích cực, chỉ tập trung vào xe đạp, phụ kiện và dịch vụ khách hàng.`
      );
    }
  }, [aiContext]);
  // Nhấn nút mở Chatbox
  const handleOpen = () => {
    setIsOpen(true);
    fetchContext(); // Bắt đầu load dữ liệu ngay khi mở hộp thoại
  };

  //Hàm điều hướng người dùng tới trang chi tiết sản phẩm cụ thể
  const goToProduct = (product: Product) => {
    setIsOpen(false);

    // Định dạng lại đối tượng Product cho đúng cấu trúc dữ liệu mà trang đích yêu cầu
    const formattedProduct = {
      id: product.productId,
      name: product.productName,
      price: product.price || 0,
      originalPrice: product.price || 0,
      discount: 0,
      rating: 5,
      reviewCount: 0,
      category: "Bicycles",
      image: getFullImageUrl(product.imageUrl),
      description: product.description || "",
    };
    // Chuyển hướng trang và đính kèm theo dữ liệu sản phẩm qua Router State
    navigate(`/product/${product.productId}`, {
      state: { product: formattedProduct }
    });
  };

  //Hàm xử lý khi người dùng gửi tin nhắn đi
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    //Phát hiện thô tục/bạo lực
    if (isHarmfulContent(userText)) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: userText, sender: "user" },
        {
          id: Date.now() + 1,
          text: "Xin lỗi, mình không thể hỗ trợ những chủ đề bạo lực hoặc phản cảm. Bạn cần tư vấn về xe đạp không ạ? ",
          sender: "bot",
        },
      ]);
      setInputValue("");
      return;
    }
    //hiển thị tin nhắn người dùng lên khung chat
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: userText, sender: "user" },
    ]);
    setInputValue("");
    setIsTyping(true); // Kích hoạt hiệu ứng đang gõ tin nhắn của AI

    // Lấy thông tin cấu hình API Key và Endpoint của Google Gemini
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const baseUrl = import.meta.env.VITE_GEMINI_API_URL;


    try {
      // Gọi API google gemini
      const response = await fetch(`${baseUrl}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${aiContext}\n\nKhách hàng hỏi: ${userText}` }],
            },
          ],
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!botReply) throw new Error("Phản hồi không hợp lệ");

      // Quét câu trả lời xem có tên sản phẩm nào xuất hiện hay không
      const matched = matchProductsInText(botReply, products);

      // Thêm câu trả lời của Bot (kèm mảng sản phẩm khớp nếu có) vào đoạn hội thoại
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: botReply,
          sender: "bot",
          matchedProducts: matched.length > 0 ? matched : undefined,
        },
      ]);
    } catch (err) {
      console.error("Lỗi gửi tin:", err);
      const { reply, matched } = offlineSearch(userText, products);
      //Tìm kiếm nội bộ nếu API bị lỗi/mất mạng
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: reply,
          sender: "bot",
          matchedProducts: matched.length > 0 ? matched : undefined,
        },
      ]);
    } finally {
      setIsTyping(false); //Hoàn tất quá trình gõ chữ, tắt trạng thái chờ
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[520px] bg-[#1a1a1a] text-white border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-blue-950 p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg text-white">
                <SmartToyIcon />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">BIKECYC AI Assistant</h3>
                <p className="text-xs flex items-center gap-1">
                  {aiContext === null ? (
                    <span className="text-amber-400 animate-pulse">Đang tải dữ liệu...</span>
                  ) : contextError ? (
                    <span className="text-red-400">Chế độ offline</span>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                      <span className="text-green-400">Trực tuyến</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800">
              <CloseIcon style={{ fontSize: 20 }} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f7f7f7]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.sender === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-800 text-gray-200 rounded-bl-none"
                  }`}>
                  {msg.sender === "bot" ? renderBotText(msg.text) : msg.text}
                </div>

                {msg.sender === "bot" && msg.matchedProducts?.map((p) => (
                  <ProductCard key={p.productId} product={p} onNavigate={goToProduct} />
                ))}
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

          <form onSubmit={handleSendMessage} className="p-3 bg-[#1a1a1a] border-t border-gray-800 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping || aiContext === null}
              placeholder={aiContext === null ? "Đang tải dữ liệu sản phẩm..." : isTyping ? "AI đang gõ..." : "Nhập câu hỏi của bạn..."}
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

      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen ? "bg-red-500 rotate-90" : "bg-blue-600"
          }`}
      >
        {isOpen ? <CloseIcon style={{ fontSize: 26 }} /> : <SmartToyIcon style={{ fontSize: 26 }} />}
      </button>
    </div>
  );
}