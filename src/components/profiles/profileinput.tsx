import React from "react";

interface ProfileInputProps {
  label: string;
  icon: React.ReactNode;
  type?: "text" | "email";
  value: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isTextArea?: boolean;
  rows?: number;
}

export default function ProfileInput({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  isTextArea = false,
  rows = 3,
}: ProfileInputProps) {
  const baseClass =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-blue-500 transition-colors";
  const disabledClass = "bg-gray-100 text-gray-500 cursor-not-allowed";

  return (
    <div>
      <label className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center gap-1">
        <span className="text-gray-400 flex items-center">{icon}</span> {label}
      </label>
      
      {isTextArea ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          type={type}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`${baseClass} ${disabled} ${disabled ? disabledClass : ""}`}
        />
      )}
    </div>
  );
}