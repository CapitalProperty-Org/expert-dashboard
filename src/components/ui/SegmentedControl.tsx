import React from 'react';
import { cn } from '../../lib/utils';

interface SegmentedOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string | null;
  onChange: (val: string) => void;
}

const SegmentedControl = ({ options, value, onChange }: SegmentedControlProps) => (
  <div className="flex gap-6 w-full flex-col sm:flex-row">
    {options.map(opt => {
      const isActive = value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 flex flex-row items-center justify-center transition-all",
            "rounded-2xl border text-lg font-medium",
            isActive
              ? "border-[#3a307f] bg-[#f5f3ff] text-[#3a307f]"
              : "border-[#e5e7eb] bg-[#fafafa] text-[#3a307f]",
            "focus:outline-none"
          )}
          style={{
            minHeight: 55,
            minWidth: 220,
            letterSpacing: '0.01em'
          }}
        >
          {opt.icon && <span className="mr-2 text-2xl">{opt.icon}</span>}
          <span>{opt.label}</span>
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;