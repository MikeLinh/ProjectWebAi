import React, { useState } from "react";
import logoAvatar from "../../assets/images/logo-avatar.png";
import SearchIcon from '@mui/icons-material/Search';
import AccountBoxIcon from '@mui/icons-material/AccountBox'; 
import ShoppingCartOutlineIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Link } from "react-router-dom"; 
import { useCart } from "../../components/context/carcontext";
import CardModel from "../home/cardmodel"; 
import SearchPopup from "./searchpopup";
import { motion, type Variants } from "framer-motion";
import LocalMallIcon from '@mui/icons-material/LocalMall';

export default function Navbar() {
    const { getCartCount } = useCart();
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false); 
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

    const navbarVariants: Variants = {
        hidden: { 
            y: -100, 
            opacity: 0 
        },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 20,
                duration: 0.6
            }
        }
    };

    return (
        <motion.nav 
            className="w-full bg-blue-950 text-white px-6 py-4 flex items-center justify-between relative z-40"
            initial="hidden"
            animate="visible"
            variants={navbarVariants}
        >
            <div className="flex items-center space-x-3">
                <img src={logoAvatar} alt="Logo" className="w-8 h-8"/>
                <span className="font-bold tracking-wider text-lg">
                    BIKECYC <span className="text-blue-500 tracking-wide">STORE</span>
                </span>
            </div>
            
            <div className="items-center space-x-8 hidden md:flex text-sm text-blue-400 tracking-wide">
                <Link to="/" className="hover:text-white border-b-2 border-transparent hover:border-blue-500 transition-all duration-300 tracking-wide">HOME</Link>
                <Link to="/product" className="hover:text-white border-b-2 border-transparent hover:border-blue-500 transition-all duration-300 tracking-wide">PRODUCTS</Link>
                <Link to="/about" className="hover:text-white border-b-2 border-transparent hover:border-blue-500 transition-all duration-300 tracking-wide">ABOUT</Link>
                <Link to="/sale" className="hover:text-white border-b-2 border-transparent hover:border-blue-500 transition-all duration-300 tracking-wide">SALE</Link>
            </div>

            <div className="flex space-x-10">
                <button
                    onClick={()=> setIsSearchOpen(true)}
                    className="flex text-gray-300 hover:text-blue-400 transition-colors duration-200 items-center">
                    <SearchIcon className="text-xl"/>
                </button>
                
                <Link to="/login" className="text-gray-300 hover:text-blue-500 transition-colors duration-200 flex items-center hover:scale-110">
                    <AccountBoxIcon className="text-xl" />
                </Link>

                <button 
                    onClick={() => setIsCartOpen(true)} 
                    className="relative text-gray-300 hover:text-blue-500 transition-all duration-200 flex items-center hover:scale-110 focus:outline-none"
                >
                    <ShoppingCartOutlineIcon className="text-xl" />
                    {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                        {getCartCount()}
                    </span>
                    )}
                </button>
                  <Link to="/ordertracking" className="text-gray-300 hover:text-blue-500 transition-colors duration-200 flex items-center hover:scale-110">
                    <LocalMallIcon className="text-xl" />
                </Link>
            </div>

            <SearchPopup isOpen={isSearchOpen} onClose={()=>setIsSearchOpen(false)}/>
            <CardModel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </motion.nav>
    );
}