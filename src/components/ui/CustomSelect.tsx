import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  disabled?: boolean;
  placeholder: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  className?: string;
}

const CustomSelect = ({ options, placeholder, value, onChange, className, disabled = false }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = value
    ? options.find(opt => opt.value === value.value)
    : null;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between text-left p-2.5 border rounded-lg text-sm transition-all duration-200",
          isOpen ? "border-violet-500 ring-1 ring-violet-500" : "border-gray-300",
          selectedOption ? "text-gray-800" : "text-gray-400",
          disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60" : "",
          className
        )}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={20} className={cn("text-gray-400 transition-transform", isOpen && "rotate-180", className)} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-20">
          <ul className="py-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left flex justify-between items-center px-3 py-2 text-sm",
                    selectedOption && option.value === selectedOption.value
                      ? "bg-violet-50 text-violet-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100",
                    className
                  )}
                >
                  <span>{option.label}</span>
                  {selectedOption && option.value === selectedOption.value && <Check size={16} className="text-violet-700" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;