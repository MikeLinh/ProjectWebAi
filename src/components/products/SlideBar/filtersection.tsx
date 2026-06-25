import { useState, type ReactNode } from "react";

interface FilterSectionProps {
  title: string;
  children: ReactNode;
}

export default function FilterSection({ title, children }: FilterSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between mb-3"
      >
        <span className="flex items-center gap-2 text-[16px] font-bold text-gray-700 uppercase tracking-widest">
          <span className="w-[3px] h-3.5 bg-red-500 rounded-full" />
          {title}
        </span>
        <span className="text-gray-400 text-base leading-none">{open ? "−" : "+"}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}