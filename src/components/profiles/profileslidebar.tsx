import React from "react";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

interface ProfileSidebarProps {
  fullName: string;
  role: string;
}

export default function ProfileSidebar({ fullName, role }: ProfileSidebarProps) {
  return (
    <div className="bg-blue-950 p-8 flex flex-col items-center justify-center text-white text-center space-y-4">
      <div className="bg-blue-900 p-4 rounded-full border-4 border-blue-500 shadow-inner">
        <AccountBoxIcon style={{ fontSize: 80 }} className="text-blue-300" />
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-wide truncate max-w-[200px]">
          {fullName}
        </h2>
        <span className="text-xs bg-blue-500/30 text-blue-300 px-3 py-1 rounded-full font-black uppercase tracking-wider mt-1 inline-block">
          {role}
        </span>
      </div>
      <p className="text-xs text-gray-400 italic">Thành viên BikeCYC Store</p>
    </div>
  );
}