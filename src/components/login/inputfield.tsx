import React from "react";

interface InputFieldProps {
  label: string;
  type: "email" | "password" | "text";
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}

export default function InputField({ label, type, placeholder, value, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-black text-sm"
      />
    </div>
  );
}