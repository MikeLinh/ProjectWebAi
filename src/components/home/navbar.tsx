import React from "react";
import logoAvatar from "../../assets/images/logo-avatar.png";
import SearchIcon from '@mui/icons-material/Search';
import AccountBoxIcon from '@mui/icons-material/AccountBox'; 
import ShoppingCartOutlineIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="w-full bg-blue-950 text-white px-6 py-4 flex items-center justify-between">
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
                <button className=" flex text-gray-300" hover:text-blue-400 transition-colors duration-200 item-center>
                    <SearchIcon className="text-xl"/>
                </button>
                <button className="text-gray-300 hover:text-blue-500 transition-colors duration-200 flex items-center transition-all hover:scale-110">
                    <AccountBoxIcon className="text-xl" />
                </button>
                <button className="relative text-gray-300 hover:text-blue-500 transition-colors duration-200 flex items-center transition-all hover:scale-110">
                    <ShoppingCartOutlineIcon className="text-xl" />
                </button>

            </div>
        </nav>
    );
}