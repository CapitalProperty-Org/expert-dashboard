import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const PageHeader = ({ title, selectedValue, onValueChange }: PageHeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dateOptions = [
      { label: 'Last 7 days', value: '7d' },
      { label: 'Last 30 days', value: '30d' },
      { label: 'Last 90 Days', value: '90d' },
      { label: 'Yesterday', value: 'yesterday' },
      { label: 'Last week', value: 'last_week' },
  ];

  const currentLabel = dateOptions.find(opt => opt.value === selectedValue)?.label || 'Select period';

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsDropdownOpen(false);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <div className="relative mt-4 sm:mt-0">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full sm:w-48 flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700"
        >
          <span>{currentLabel}</span>
          <ChevronDown size={16} className={cn("text-gray-500 transition-transform", isDropdownOpen && "rotate-180")} />
        </button>
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
            <ul className="p-2">
              {dateOptions.map((option) => (
                <li key={option.value}>
                  <button onClick={() => handleSelect(option.value)} className="w-full text-left block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100">
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;