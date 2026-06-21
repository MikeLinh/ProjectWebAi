import React from "react";

interface SubmitButtonProps{
    children: React.ReactNode;
    isLoading?: boolean;
}
export default function SubmitButton({children, isLoading}: SubmitButtonProps){
    return(
        <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-indigo-950 text-white font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all text-sm mt-2 flex items-center justify-center ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
            {isLoading ? "Processing..." : children}
        </button>
    )
}