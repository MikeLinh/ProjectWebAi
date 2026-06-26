import React, { useState } from "react";
import logoAvatar from "../../assets/images/logo-avatar.png";
import SearchIcon from '@mui/icons-material/Search';
import AccountBoxIcon from '@mui/icons-material/AccountBox'; 
import ShoppingCartOutlineIcon from '@mui/icons-material/ShoppingCartOutlined';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import { Link, useNavigate } from "react-router-dom"; 
import { useCart } from "../../components/context/carcontext";
import CardModel from "../home/cardmodel"; 
import SearchPopup from "./searchpopup";
import { motion, type Variants } from "framer-motion";

import { useAuth } from "../../components/context/authcontext";

export default function Navbar() {
    const { getCartCount } = useCart();
    const { user, logout } = useAuth(); 
    
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false); 
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false); 

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate("/login");
    };

    const navbarVariants: Variants = {
        hidden: { y: -100, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 20, duration: 0.6 } }
    };

    return (
        <motion.nav 
            className="w-full bg-blue-950 text-white px-6 py-4 flex items-center justify-between relative z-40"
            initial="hidden"
            animate="visible"
            variants={navbarVariants}
        >
            {/* Giữ nguyên Logo & Menu giữa */}
            <div className="flex items-center space-x-3">
                <img src={logoAvatar} alt="Logo" className="w-8 h-8"/>
                <span className="font-bold tracking-wider text-lg">
                    BIKECYC <span className="text-blue-500 tracking-wide">STORE</span>
                </span>
            </div>
            
            <div className="items-center space-x-8 hidden md:flex text-sm text-blue-400 tracking-wide">
                <Link to="/" className="hover:text-white border-b-2 border-transparent hover:border-blue-500 transition-all duration-300">TRANG CHỦ</Link>
                <Link to="/product" className="hover:text-white border-b-2 border-transparent hover:border-blue-500 transition-all duration-300">SẢN PHẨM</Link>
                <Link to="/about" className="hover:text-white border-b-2 border-transparent hover:border-blue-500 transition-all duration-300">GIỚI THIỆU</Link>
                <Link to="/sale" className="hover:text-white border-b-2 border-transparent hover:border-blue-500 transition-all duration-300">KHUYẾN MÃI</Link>
            </div>

            <div className="flex items-center space-x-8">
                <button onClick={()=> setIsSearchOpen(true)} className="flex text-gray-300 hover:text-blue-400 items-center">
                    <SearchIcon className="text-xl"/>
                </button>
                
                <div className="relative">
                    {user ? (
                        <div 
                           onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                           className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 cursor-pointer select-none"
                        >
                            <AccountBoxIcon className="text-xl text-blue-500" />
                            <span className="text-xs md:text-sm font-semibold max-w-[110px] truncate">
                                {user.fullName}
                            </span>
                        </div>
                    ) : (
                        <Link to="/login" className="text-gray-300 hover:text-blue-500 flex items-center hover:scale-110 transition-transform">
                            <AccountBoxIcon className="text-xl" />
                        </Link>
                    )}

                    {/* Menu lựa chọn xổ xuống */}
                    {isUserMenuOpen && user && (
                        <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-2xl py-2 text-gray-800 text-xs border border-gray-100 z-50">
                            <div className="px-4 py-2.5 border-b bg-gray-50 rounded-t-xl">
                                <p className="font-bold text-blue-950 truncate">{user.email}</p>
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black mt-1 inline-block">
                                    Quyền: {user.role}
                                </span>
                            </div>
                            
                            {user.role === "ADMIN" && (
                                <Link to="/admin" onClick={()=>setIsUserMenuOpen(false)} className="block px-4 py-2.5 hover:bg-blue-50 font-bold text-blue-600 transition-colors">
                                    Vào trang Quản trị
                                </Link>
                            )}
                            
                            <Link to="/profile" onClick={()=>setIsUserMenuOpen(false)} className="block px-4 py-2.5 hover:bg-gray-100 font-medium transition-colors">
                                Thông tin tài khoản
                            </Link>
                            
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 font-bold border-t mt-1 transition-colors">
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>

                <button onClick={() => setIsCartOpen(true)} className="relative text-gray-300 hover:text-blue-500 flex items-center hover:scale-110 focus:outline-none transition-transform">
                    <ShoppingCartOutlineIcon className="text-xl" />
                    {getCartCount() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                          {getCartCount()}
                      </span>
                    )}
                </button>

                <Link to="/ordertracking" className="text-gray-300 hover:text-blue-500 flex items-center hover:scale-110 transition-transform">
                    <LocalMallIcon className="text-xl" />
                </Link>
            </div>

            <SearchPopup isOpen={isSearchOpen} onClose={()=>setIsSearchOpen(false)}/>
            <CardModel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </motion.nav>
    );
}