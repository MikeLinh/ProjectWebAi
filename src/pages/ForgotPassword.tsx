import React from "react";
import ForgotHeader from "../components/forgot/forgotheader";
import ForgotForm from "../components/forgot/forgotform";
import ForgotFooter from "../components/forgot/forgotfooter";

export default function ForgotPassword(){
    return(
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full border border-gray-100">
                    <ForgotHeader/>
                    <ForgotForm/>
                    <ForgotFooter/>
            </div>
        </div>
    )
}