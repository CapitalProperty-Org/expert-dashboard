import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { cn } from '../../lib/utils';

// Custom CSS for active background
const customStyles = `
  .rdp-day_selected {
    background-color: #7c3aed !important;
    color: white !important;
    font-weight: 600 !important;
  }
  
  .rdp-day_selected:hover {
    background-color: #7c3aed !important;
    color: white !important;
  }
  
  .rdp-day_range_middle {
    background-color: #f3e8ff !important;
    color: #5b21b6 !important;
    font-weight: 500 !important;
  }
  
  .rdp-day_range_middle:hover {
    background-color: #e9d5ff !important;
  }
  
  .rdp-day_today {
    background-color: #f3e8ff !important;
    color: #5b21b6 !important;
    font-weight: 600 !important;
  }
  
  .rdp-day:hover {
    background-color: #f3e8ff !important;
  }
  
  .rdp-day:focus {
    background-color: #f3e8ff !important;
  }
`;

// Define the DateRange type locally
type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
}

const presetRanges = [
  { label: 'Today', range: { from: new Date(), to: new Date() } },
  { label: 'Yesterday', range: { from: subDays(new Date(), 1), to: subDays(new Date(), 1) } },
  { label: 'Last 7 days', range: { from: subDays(new Date(), 6), to: new Date() } },
  { label: 'Last 30 days', range: { from: subDays(new Date(), 29), to: new Date() } },
  { label: 'Last 90 Days', range: { from: subDays(new Date(), 89), to: new Date() } },
];

const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [range, setRange] = useState<DateRange | undefined>(value);
    const [activePreset, setActivePreset] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    // Update local state when prop changes
    useEffect(() => {
        if (value) {
            setRange(value);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    const handlePresetClick = (preset: typeof presetRanges[0]) => {
        const newRange = preset.range;
        setRange(newRange);
        setActivePreset(preset.label);
        onChange?.(newRange);
    };

    const handleRangeChange = (newRange: DateRange | undefined) => {
        setRange(newRange);
        onChange?.(newRange);
    };
    
    const displayValue = range?.from
        ? range.to
            ? `${format(range.from, 'dd MMM yyyy')} - ${format(range.to, 'dd MMM yyyy')}`
            : format(range.from, 'dd MMM yyyy')
        : 'Select date range';

    return (
        <div className="relative w-full lg:w-64" ref={ref}>
            {/* Inject custom CSS */}
            <style>{customStyles}</style>
            
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={cn(
                    "w-full flex items-center justify-between p-2.5 bg-white border rounded-lg text-sm transition-colors",
                    isOpen ? "border-violet-500 ring-1 ring-violet-500" : "border-gray-300 hover:border-gray-400"
                )}
            >
                <span className="text-gray-700">{displayValue}</span>
                {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-20 flex min-w-[600px]">
                    {/* Calendar Section */}
                    <div className="p-4 border-r border-gray-200">
                        <DayPicker
                            mode="range"
                            numberOfMonths={2}
                            selected={range}
                            onSelect={handleRangeChange}
                            defaultMonth={range?.from}
                            classNames={{
                                root: 'bg-white',
                                months: 'flex gap-8',
                                month: 'space-y-4',
                                caption: 'flex justify-center items-center relative mb-4',
                                caption_label: 'font-bold text-sm text-gray-800',
                                nav: 'space-x-1 flex items-center',
                                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                                table: 'w-full border-collapse',
                                head_row: 'flex',
                                head_cell: 'text-gray-400 rounded-md w-9 font-normal text-[0.8rem] text-center',
                                row: 'flex w-full mt-2',
                                cell: 'h-9 w-9 text-center text-sm p-0 relative',
                                day: 'h-9 w-9 p-0 font-normal rounded-md hover:bg-violet-100 focus:bg-violet-100 focus:outline-none transition-colors',
                                day_selected: '!bg-violet-700 !text-white rounded-md hover:!bg-violet-700 focus:!bg-violet-700 font-semibold',
                                day_outside: 'text-gray-300 opacity-50',
                                day_range_middle: '!bg-violet-100 !text-violet-800 rounded-none font-medium',
                                day_hidden: 'invisible',
                                day_today: 'bg-violet-50 text-violet-800 font-semibold',
                                day_disabled: 'text-gray-300 opacity-30 cursor-not-allowed',
                            }}
                            styles={{
                                months: { display: 'flex', gap: '2rem' },
                                month: { minWidth: '240px' },
                                caption: { marginBottom: '1rem' },
                                head_cell: { 
                                    width: '36px', 
                                    height: '36px',
                                    textAlign: 'center',
                                    padding: '0',
                                    fontSize: '0.875rem',
                                    fontWeight: 'normal',
                                    color: '#9CA3AF'
                                },
                                cell: { 
                                    width: '36px', 
                                    height: '36px',
                                    textAlign: 'center',
                                    padding: '0',
                                    position: 'relative'
                                },
                                day: { 
                                    width: '36px', 
                                    height: '36px',
                                    textAlign: 'center',
                                    padding: '0',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 'normal',
                                    transition: 'all 0.2s ease-in-out'
                                }
                            }}
                        />
                        
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-gray-200">
                            <button 
                                onClick={() => { 
                                    setRange(undefined); 
                                    setActivePreset(null); 
                                    onChange?.(undefined);
                                }} 
                                className="text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                            >
                                Clear
                            </button>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="text-sm font-semibold text-white bg-violet-800 py-2 px-6 rounded-lg hover:bg-violet-900 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>

                    {/* Preset Ranges Section */}
                    <div className="p-4 min-w-[160px]">
                        <h3 className="font-medium text-gray-900 mb-3 text-sm">Preset Ranges</h3>
                        <ul className="space-y-2">
                            {presetRanges.map(preset => (
                                <li key={preset.label}>
                                    <button 
                                        onClick={() => handlePresetClick(preset)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                                            activePreset === preset.label
                                                ? "bg-violet-100 text-violet-800 font-medium"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                        )}
                                    >
                                        {preset.label}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button 
                                    onClick={() => setActivePreset("Custom Range")}
                                    className={cn(
                                        "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                                        activePreset === "Custom Range"
                                            ? "bg-violet-100 text-violet-800 font-medium"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                    )}
                                >
                                    Custom Range
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;