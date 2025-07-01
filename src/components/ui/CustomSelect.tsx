import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  disabled?: boolean;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
    className?: string; 

}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CustomSelect = ({ options, disabled , placeholder, value, onChange , className }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);
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
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between text-left p-2.5 border rounded-lg text-sm transition-all duration-200",
          isOpen ? "border-violet-500 ring-1 ring-violet-500" : "border-gray-300",
          selectedOption ? "text-gray-800" : "text-gray-400",
          className
        )}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={20} className={cn("text-gray-400 transition-transform", isOpen && "rotate-180" , className)} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-20">
          <ul className="py-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left flex justify-between items-center px-3 py-2 text-sm",
                    option.value === value
                      ? "bg-violet-50 text-violet-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100",
                      className
                  )}
                >
                  <span>{option.label}</span>
                  {option.value === value && <Check size={16} className="text-violet-700" />}
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