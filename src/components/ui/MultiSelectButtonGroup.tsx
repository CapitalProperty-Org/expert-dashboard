import { cn } from "../../lib/utils";

interface ButtonGroupProps {
  options: string[];
  selected: string; // <-- الآن هو دائمًا نص
  onToggle: (option: string) => void;
}
const MultiSelectButtonGroup = ({ options, selected, onToggle }: ButtonGroupProps) => (
  <div className="flex flex-wrap gap-2 col-span-3">
    {options.map((option) => (
        <button
            type="button"
            key={option}
            onClick={() => onToggle(option)}
            className={cn(
            "px-4 py-2 border rounded-lg text-sm font-medium transition-colors",
            selected === option
                ? 'bg-violet-50 border-violet-600 text-violet-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            )}
        >
            {option}
        </button>
    ))}
  </div>
);
export default MultiSelectButtonGroup;