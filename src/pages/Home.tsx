import React from "react";
import Navbar from "../components/home/navbar";
import MainHome from "../components/home/mainhome";
import Footer from "../components/home/footer";
import background from "../assets/images/background.png";
import Chatbox from "../components/chatbox/chatbox.tsx";
export default function Home() {
    return (
        <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: `url(${background})` }}>
            <div className="relative z-10">
                <Navbar />
                <MainHome /> 
                <Footer />
                <Chatbox />
            </div>
        </div>
    );
}