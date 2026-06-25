interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 border ${
        active
          ? "bg-red-500 text-white border-red-500 shadow-sm"
          : "bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-500"
      }`}
    >
      {label}
    </button>
  );
}