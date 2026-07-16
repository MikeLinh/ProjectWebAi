import React from "react";
import ForgotHeader from "../components/forgot/forgotheader";
import ForgotForm from "../components/forgot/forgotform";
import ForgotFooter from "../components/forgot/forgotfooter";

export default function ForgotPassword() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                
                <div className="px-8 pt-10 pb-6 border-b border-gray-100 bg-white">
                    <ForgotHeader />
                </div>

                <div className="p-8">
                    <ForgotForm />
                </div>
                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
                    <ForgotFooter />
                </div>
            </div>
        </div>
    );
}