import React from "react";
import { useAuth } from "../components/context/authcontext"; 
import ProfileSidebar from "../components/profiles/profileslidebar";
import ProfileForm from "../components/profiles/profileform";
import background from "../assets/images/background.png"

export default function Profile() {
  const { user } = useAuth();


  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500 font-medium">
        Vui lòng đăng nhập để xem thông tin cá nhân.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center items-center bg-cover bg-no-repeat bg-center relative" 
        style={{backgroundImage: `url(${background})`}}>
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-3">
        <ProfileSidebar fullName={user.fullName} role={user.role} />
        <ProfileForm />
        
      </div>
    </div>
  );
}