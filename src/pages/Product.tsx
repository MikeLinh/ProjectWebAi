import React from "react";
import Navbar from "../components/home/navbar";
import MainProduct from "../components/products/mainproduct";
import Footer from "../components/home/footer";
import Chatbox from "../components/chatbox/chatbox";




export default function Product() {
    return (
       
            <div className="relative z-10 min-h-screen flex flex-col justify-between">
                <Navbar />
                    <div className=" flex-1 w-full">
                        <MainProduct />
                        <Chatbox />
                    </div>
                <Footer />
            </div>
     
    );
}