import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

export default function StatCard({ title, value, icon, bgColor }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
      <div className="space-y-2">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-4 rounded-xl ${bgColor} text-xl`}>
        {icon}
      </div>
    </div>
  );
}