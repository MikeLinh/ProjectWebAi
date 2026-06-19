import React, { useEffect, useRef } from "react";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchPopup({ isOpen, onClose }: SearchPopupProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 flex-1 border-b-2 border-gray-200 focus-within:border-blue-950 py-2 transition-colors">
            <SearchIcon className="text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm sản phẩm, thương hiệu xe đạp..."
              className="w-full text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
          >
            <CloseIcon style={{ fontSize: 24 }} />
          </button>
        </div>
      </div>
    </>
  );
}