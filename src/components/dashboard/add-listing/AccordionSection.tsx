import { ChevronUp, ChevronDown, Lock, CheckCircle2, PlusCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionSection = ({ title, isOpen, isCompleted, isLocked, onToggle, children }: AccordionSectionProps) => {
  const renderIcon = () => {
      if (isCompleted) {
          return <CheckCircle2 className="text-green-500" />;
      }
      if (isLocked) {
          return <Lock className="text-gray-400" />;
      }
      return <PlusCircle className="text-gray-400" />;
  };

  return (
    // <div className={cn("bg-white border rounded-lg", isLocked ? "bg-gray-50" : "border-gray-200/80")}>
    <div className={cn("bg-white border border-gray-400 rounded-lg", isLocked ? "bg-white" : "border-gray-400")}>
      <button onClick={onToggle} disabled={isLocked} className="w-full flex justify-between items-center p-4 disabled:cursor-not-allowed">
        <div className="flex items-center gap-3">
            {renderIcon()}
            <h2 className={cn("text-lg font-bold", isLocked ? "text-gray-400" : "text-gray-800")}>{title}</h2>
        </div>
        {!isLocked && (isOpen ? <ChevronUp /> : <ChevronDown />)}
      </button>
      {isOpen && !isLocked && (
        <div className="p-6 border-t border-gray-200/80">
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;