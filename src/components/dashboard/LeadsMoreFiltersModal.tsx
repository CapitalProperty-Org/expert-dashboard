import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import CustomSelect from '../ui/CustomSelect';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SelectOption {
    value: string | number;
    label: string;
}

interface LeadsMoreFiltersModalProps {
  onClose: () => void;
  initialFilters: { [key: string]: string | number | boolean };
  onApply: (newFilters: { [key:string]: string | number | boolean }) => void;
}

const propertyTypeOptions: SelectOption[] = [
    { value: 'apartment', label: 'Apartment' }, { value: 'villa', label: 'Villa' }, { value: 'townhouse', label: 'Townhouse' },
    { value: 'penthouse', label: 'Penthouse' }, { value: 'compound', label: 'Compound' }, { value: 'duplex', label: 'Duplex' },
    { value: 'office space', label: 'Office Space' }, { value: 'retail', label: 'Retail' }, { value: 'shop', label: 'Shop' },
    { value: 'show room', label: 'Show Room' }, { value: 'short term & hotel apartment', label: 'Short Term & Hotel Apartment' },
    { value: 'bulk units', label: 'Bulk Units' }, { value: 'others', label: 'Others' }
];
const typeOptions: SelectOption[] = [ { value: 'buyer', label: 'Buyer' }, { value: 'tenant', label: 'Tenant' } ];
const categoryOptions: SelectOption[] = [ { value: 'residential', label: 'Residential' }, { value: 'commercial', label: 'Commercial' } ];

const LeadsMoreFiltersModal = ({ onClose, initialFilters, onApply }: LeadsMoreFiltersModalProps) => {
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [agents, setAgents] = useState<SelectOption[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
        setIsLoadingAgents(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users?role=agent`);
            setAgents(res.data.map((item: { pf_agent_id: string; first_name: string; last_name: string }) => ({ value: item.pf_agent_id, label: `${item.first_name} ${item.last_name}` })));
        } catch (error) { console.error("Failed to fetch agents", error); } 
        finally { setIsLoadingAgents(false); }
    };
    fetchAgents();
  }, []);

  const handleFilterChange = (key: string, value: string | number) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => { setDateRange(dates); };
  
  const handleApplyClick = () => {
    const [start, end] = dateRange;
    onApply({
        ...tempFilters,
        date_from: start ? start.toISOString().split('T')[0] : '',
        date_to: end ? end.toISOString().split('T')[0] : '',
    });
    onClose();
  };
  
  const handleResetClick = () => {
      const resetState: {[key: string]: string | number | boolean} = {};
      Object.keys(initialFilters).forEach(key => { resetState[key] = '' });
      setTempFilters(resetState);
      setDateRange([null, null]);
  };

  const Label = ({ children }: { children: React.ReactNode }) => (<label className="text-sm font-medium text-gray-700 block mb-2">{children}</label>);

  useEffect(() => {
  const start = initialFilters.date_from ? new Date(String(initialFilters.date_from)) : null;
  const end = initialFilters.date_to ? new Date(String(initialFilters.date_to)) : null;
  setDateRange([start, end]);
}, [initialFilters]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b"><h2 className="text-lg font-bold">More Filters</h2><button onClick={onClose}><X/></button></div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                {isLoadingAgents ? ( <div className="col-span-full text-center">Loading...</div> ) : (
                    <>
                        <div><Label>Leads received</Label><DatePicker selectsRange startDate={dateRange[0]} endDate={dateRange[1]} onChange={handleDateChange} className="w-full p-2.5 border rounded-lg" placeholderText="Lead received date"/></div>
                        <div><Label>Property type</Label><CustomSelect options={propertyTypeOptions} placeholder="Property type" value={propertyTypeOptions.find(opt => opt.value === tempFilters.propertyType) || null} onChange={v => handleFilterChange('propertyType', v?.value ?? '')} /></div>
                        <div><Label>Assigned to</Label><CustomSelect options={agents} placeholder="Assigned to" value={agents.find(opt => opt.value === tempFilters.agentId) || null} onChange={v => handleFilterChange('agentId', v?.value ?? '')} /></div>
                        <div><Label>Type</Label><CustomSelect options={typeOptions} placeholder="Type" value={typeOptions.find(opt => opt.value === tempFilters.type) || null} onChange={v => handleFilterChange('type', v?.value ?? '')} /></div>
                        <div><Label>Property Category</Label><CustomSelect options={categoryOptions} placeholder="Property Category" value={categoryOptions.find(opt => opt.value === tempFilters.category) || null} onChange={v => handleFilterChange('category', v?.value ?? '')} /></div>
                    </>
                )}
            </div>

            <div className="flex justify-end p-6 border-t">
                                      <button onClick={handleResetClick} className="text-sm font-semibold text-gray-700 py-2.5 px-5 rounded-lg hover:bg-gray-200/70">Reset</button>

                <button onClick={handleApplyClick} className="bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg">Show results</button>
            </div>
        </div>
    </div>
  );
};

export default LeadsMoreFiltersModal;