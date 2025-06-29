import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
import { cn } from '../../lib/utils';

interface MoreFiltersModalProps {
  onClose: () => void;
  initialFilters: { [key: string]: any };
  onApply: (newFilters: { [key:string]: any }) => void;
}

const MoreFiltersModal = ({ onClose, initialFilters, onApply }: MoreFiltersModalProps) => {
  const [tempFilters, setTempFilters] = useState(initialFilters);

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleBedroomClick = (opt: string) => {
      if (opt === '5+') {
          setTempFilters(prev => ({...prev, bedrooms: '', bedrooms_gte: '5' }));
      } else {
          setTempFilters(prev => ({...prev, bedrooms: opt, bedrooms_gte: '' }));
      }
  };

  const handleApplyClick = () => {
    onApply(tempFilters);
    onClose();
  };
  
  const handleResetClick = () => {
      const resetState: { [key: string]: any } = {};
      Object.keys(initialFilters).forEach(key => { resetState[key] = ''; });
      resetState.draft = true;
      resetState.live = false;
      setTempFilters(resetState);
      onApply(resetState);
      onClose();
  }

  const bedroomOptions = ['Studio', '1', '2', '3', '4', '5+'];
  const categoryOptions = [ { value: 'residential', label: 'Residential' }, { value: 'commercial', label: 'Commercial' } ];
  const offeringOptions = [ { value: 'sale', label: 'For Sale' }, { value: 'rent', label: 'For Rent' } ];
  const furnishingOptions = [ { value: 'furnished', label: 'Furnished' }, { value: 'unfurnished', label: 'Unfurnished' } , {value : 'semi-furnished' , label : 'Semi furnished'} ];

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-xs font-semibold text-gray-600 block mb-1.5">{children}</label>
  );

  const baseInputStyles = "w-full p-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none transition-shadow";
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">More Filters</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100"><X size={20} /></button>
        </div>

        <div className="flex-grow p-8 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div><Label>Reference Number</Label><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Enter Reference Number" value={tempFilters.reference || ''} onChange={e => handleFilterChange('reference', e.target.value)} className={`${baseInputStyles} pl-9`} /></div></div>
            <div><Label>Agents</Label><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Enter Agent ID" value={tempFilters.assigned_to_id || ''} onChange={e => handleFilterChange('assigned_to_id', e.target.value)} className={`${baseInputStyles} pl-9`} /></div></div>
            <div><Label>Property category</Label><CustomSelect options={categoryOptions} placeholder="Select property category" value={tempFilters.category || ''} onChange={v => handleFilterChange('category', v)} /></div>
            <div><Label>Offering type</Label><CustomSelect options={offeringOptions} placeholder="Select offering type" value={tempFilters.offering_type || ''} onChange={v => handleFilterChange('offering_type', v)} /></div>
            <div><Label>Property Type</Label><CustomSelect options={[]} placeholder="Select property type" value={tempFilters.type || ''} onChange={v => handleFilterChange('type', v)} /></div>
            <div><Label>Property price (AED)</Label><div className="flex gap-2"><input type="number" placeholder="Min. Price" value={tempFilters.price_min || ''} onChange={e => handleFilterChange('price_min', e.target.value)} className={baseInputStyles} /><input type="number" placeholder="Max. Price" value={tempFilters.price_max || ''} onChange={e => handleFilterChange('price_max', e.target.value)} className={baseInputStyles} /></div></div>
            <div><Label>Property size (sqft)</Label><div className="flex gap-2"><input type="number" placeholder="Min. Area" value={tempFilters.size_min || ''} onChange={e => handleFilterChange('size_min', e.target.value)} className={baseInputStyles} /><input type="number" placeholder="Max. Area" value={tempFilters.size_max || ''} onChange={e => handleFilterChange('size_max', e.target.value)} className={baseInputStyles} /></div></div>
            <div><Label>Furnishing</Label><CustomSelect options={furnishingOptions} placeholder="Select furnishing" value={tempFilters.furnishing_type || ''} onChange={v => handleFilterChange('furnishing_type', v)} /></div>
            <div className="md:col-span-2">
                <Label>Bedrooms</Label>
                <div className="flex flex-wrap gap-2">
                    {bedroomOptions.map(opt => (
                        <button key={opt} onClick={() => handleBedroomClick(opt)} className={cn("px-5 py-2 border rounded-lg text-sm font-medium transition-colors", (tempFilters.bedrooms === opt || (opt === '5+' && tempFilters.bedrooms_gte)) ? "bg-violet-600 text-white border-violet-600" : "border-gray-300 text-gray-700 hover:bg-gray-100")}>{opt}</button>
                    ))}
                </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50/70">
          <button onClick={handleResetClick} className="text-sm font-semibold text-gray-700 py-2.5 px-5 rounded-lg hover:bg-gray-200/70">Reset</button>
          <button onClick={handleApplyClick} className="text-sm font-semibold text-white bg-red-600 py-2.5 px-5 rounded-lg ml-3">Show results</button>
        </div>
      </div>
    </div>
  );
};

export default MoreFiltersModal;