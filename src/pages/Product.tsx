import React from "react";
import Navbar from "../components/home/navbar";
import MainProduct from "../components/products/mainproduct";
import Footer from "../components/home/footer";
import background from "../assets/images/background.png";


export default function Product() {
    return (
        <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: `url(${background})` }}>
            <div className="relative z-10 min-h-screen flex flex-col justify-between">
                <Navbar />
                    <div className=" flex-1 w-full">
                        <MainProduct /> 
                        
                    </div>
                <Footer />
            </div>
        </div>
    );
}