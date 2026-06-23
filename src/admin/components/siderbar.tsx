import React from "react";
import { useNavigate } from "react-router-dom";

interface SiderBarProps{
    currentTab: string;
    setCurrentTab: (tab:string) => void;
}
export default function Siderbar({currentTab, setCurrentTab}:SiderBarProps){
    const navigate= useNavigate();
    const menuItems= [
        {id: "overview", label: "Thống kê"},
        {id: "products", label: "Sản phẩm"},
        {id: "orders", label: "Đơn hàng"},
        {id: "promotions", label: "Khuyến mãi"},
    ];
    const handleLogout = () => {
        if(confirm("Bạn có muốn đăng xuất không ?")){
            localStorage.removeItem("currentUser");
            navigate("/login")
        }
    }
    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen p-5 flex flex-col justify-between">
            <div className="space-y-6 w-full">
                <div className="text-xl font-bold tracking-wider border-b border-gray-700 pb-4 text-red-500">
                BIKECYC ADMIN
                </div>
                <nav className="space-y-2">
                {menuItems.map((item) => (
                    <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        currentTab === item.id
                        ? "bg-red-600 text-white shadow-lg"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                    >
                    {item.label}
                    </button>
                ))}
                </nav>
            </div>
            <div className="border-t border-gray-800 pt-4 w-full">
                <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-500 transition-all border border-transparent hover:border-red-900/50"
                >
                Đăng xuất hệ thống
                </button>
            </div>
    </div>

    )
}