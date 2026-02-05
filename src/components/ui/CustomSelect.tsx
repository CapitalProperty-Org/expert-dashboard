import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Loader2 } from 'lucide-react';
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
  selectedValues?: (string | number)[];
  isMulti?: boolean;
  onRemoveValue?: (val: string | number) => void;
  isLoading?: boolean;
  onInputChange?: (query: string) => void;
  noOptionsMessage?: () => string;
}

const CustomSelect = ({
  options,
  placeholder,
  value,
  onChange,
  className,
  disabled = false,
  selectedValues = [],
  isMulti = false,
  onRemoveValue,
  isLoading = false,
  onInputChange,
  noOptionsMessage
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedOption = value
    ? options.find(opt => opt.value === (value && typeof value === 'object' && 'value' in value ? value.value : value))
    : null;
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  // Focus input when dropdown opens (for searchable mode)
  useEffect(() => {
    if (isOpen && onInputChange && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, onInputChange]);

  // Notify parent of search query changes
  useEffect(() => {
    if (onInputChange) {
      onInputChange(searchQuery);
    }
  }, [searchQuery, onInputChange]);

  const renderTriggerContent = () => {
    if (isMulti && selectedValues && selectedValues.length > 0) {
      return (
        <div className="flex flex-wrap gap-1 items-center overflow-hidden">
          {selectedValues.map(val => {
            const opt = options.find(o => o.value === val);
            if (!opt) return null;
            return (
              <span
                key={val}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveValue?.(val);
                }}
              >
                {opt.label}
                <X size={12} className="hover:text-violet-900 cursor-pointer" />
              </span>
            );
          })}
        </div>
      );
    }
    return <span>{selectedOption ? selectedOption.label : placeholder}</span>;
  };

  const filteredOptions = onInputChange
    ? options // When using external search (onInputChange), don't filter locally
    : options.filter(opt =>
      opt && opt.label && typeof opt.label === 'string' && opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between text-left p-2.5 border rounded-lg text-sm transition-all duration-200 min-h-[42px]",
          isOpen ? "border-violet-500 ring-1 ring-violet-500" : "border-gray-300",
          (selectedOption || (isMulti && selectedValues.length > 0)) ? "text-gray-800" : "text-gray-400",
          disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60" : "bg-white",
          className
        )}
      >
        {renderTriggerContent()}
        {isLoading ? (
          <Loader2 size={20} className="text-violet-500 animate-spin ml-2 shrink-0" />
        ) : (
          <ChevronDown size={20} className={cn("text-gray-400 transition-transform ml-2 shrink-0", isOpen && "rotate-180")} />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {onInputChange && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <ul className="py-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {isLoading ? (
              <li className="px-3 py-4 text-center text-sm text-gray-500">
                <Loader2 size={20} className="inline-block animate-spin mr-2" />
                Loading...
              </li>
            ) : filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-gray-500">
                {noOptionsMessage ? noOptionsMessage() : "No options found"}
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = isMulti
                  ? selectedValues.includes(option.value)
                  : selectedOption && option.value === selectedOption.value;

                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option);
                        if (!isMulti) {
                          setIsOpen(false);
                          setSearchQuery('');
                        }
                      }}
                      className={cn(
                        "w-full text-left flex justify-between items-center px-3 py-2 text-sm",
                        isSelected
                          ? "bg-violet-50 text-violet-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check size={16} className="text-violet-700" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;