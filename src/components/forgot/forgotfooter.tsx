import React from "react";
import {Link} from "react-router-dom"

export default function ForgotFooter(){
    return(
        <div className="text-center text-xs text-gray-500 mt-6 pt-2 border-t border-gray-100">
            <Link to="/login" className="text-blue-500 font-medium hover:underline inline-flex items-center gap-1">
                Back to login
            </Link>
        </div>
    );
}