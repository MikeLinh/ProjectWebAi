import React from "react";

export default function ForgotHeader(){
    return(
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 tracking-wide">Forgot Password</h1>
            <p className="text-gray-400 text-xs mt-1 max-w-[280px] mx-auto leading-relaxed">
                Enter your email and we'ill send you a code to reset your password
            </p>
        </div>
    );
}