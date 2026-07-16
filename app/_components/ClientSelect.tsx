"use client";

type ClientSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  ariaLabel?: string;
  disabled?: boolean;
  tone?: "light" | "dark";
  className?: string;
};

export function ClientSelect({
  value,
  onChange,
  options,
  ariaLabel = "Select client",
  disabled = false,
  tone = "light",
  className = "",
}: ClientSelectProps) {
  const tones = {
    light:
      "border-[#CDBAD9] bg-white text-[#341F60] shadow-[0_4px_14px_rgba(52,31,96,0.06)] hover:border-[#A984BC] focus:border-[#7D4698] focus:ring-[#EEE3FA]",
    dark:
      "border-white/25 bg-white/10 text-white hover:bg-white/15 focus:border-[#F4CE45] focus:ring-white/15",
  };

  return (
    <div className={`relative inline-flex min-w-44 sm:min-w-52 ${className}`}>
      <select
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full appearance-none rounded-xl border py-2.5 pl-3.5 pr-10 text-xs font-semibold outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-white text-[#28154F]"
          >
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2"
      >
        <path
          d="m6 8 4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
