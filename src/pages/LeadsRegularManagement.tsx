import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import LeadsTable from '../components/dashboard/LeadsTable';
import LeadsMoreFiltersModal from '../components/dashboard/LeadsMoreFiltersModal';
import LeadsEmptyState from '../components/dashboard/LeadsEmptyState';
import { useLeads, LeadsProvider } from '../context/LeadsContext';
import { useDebounce } from '../hooks/useDebounce';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const initialFilters = {
    query: '',
    propertyType: '',
    agentId: '',
    type: '',
    date_from: '',
    date_to: '',
    category: '',
};

const LeadsManagementComponent = () => {
    const { leads, loading, error, fetchLeads } = useLeads();
    const [filters, setFilters] = useState(initialFilters);
    const debouncedSearch = useDebounce(filters.query, 500);
    const [isFiltersModalOpen, setFiltersModalOpen] = useState(false);

    // ## هذا هو الحل النهائي: useEffect واحد يعتمد على القيم الفردية ##
    useEffect(() => {
        // بناء كائن الفلاتر النشطة دائمًا
        const activeFilters = {
            query: debouncedSearch,
            propertyType: filters.propertyType,
            agentId: filters.agentId,
            type: filters.type,
            date_from: filters.date_from,
            date_to: filters.date_to,
            category: filters.category,
        };
        
        // حذف المفاتيح الفارغة
        Object.keys(activeFilters).forEach(key => {
            const filterKey = key as keyof typeof activeFilters;
            if (!activeFilters[filterKey]) {
                delete activeFilters[filterKey];
            }
        });

        fetchLeads(activeFilters);
    }, [
        // قائمة الاعتماديات الدقيقة التي ستؤدي إلى إعادة جلب البيانات
        debouncedSearch,
        filters.propertyType,
        filters.agentId,
        filters.type,
        filters.date_from,
        filters.date_to,
        filters.category,
        fetchLeads // مهم جدًا لإضافة دالة fetchLeads هنا
    ]);

    const handleApplyModalFilters = (newFiltersFromModal: { [key: string]: string | number | boolean }) => {
        // تحديث الحالة سيؤدي إلى تشغيل الـ useEffect أعلاه لأن القيم الفردية ستتغير
        setFilters(prev => ({ ...prev, ...newFiltersFromModal }));
    };

    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
        if (error) return <div className="text-center text-red-500 py-16">{error}</div>;
        if (leads.length === 0) return <LeadsEmptyState />;
        return <LeadsTable leads={leads} />;
    };

    return (
        <>
            {isFiltersModalOpen && (
                <LeadsMoreFiltersModal 
                    onClose={() => setFiltersModalOpen(false)}
                    initialFilters={filters}
                    onApply={handleApplyModalFilters}
                />
            )}
            <div className="flex flex-col h-full bg-gray-50">
                <div className="p-4 sm:p-6 md:p-8 space-y-4 flex-shrink-0 z-10">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">Leads Management</h1>
                        <Link to='/new-lead'>
                            <button className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 text-sm"><Plus size={16} />New lead</button>
                        </Link>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="relative flex-grow">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by lead name, phone number, or email" 
                                value={filters.query}
                                onChange={(e) => setFilters(prev => ({...prev, query: e.target.value}))}
                                className="w-full bg-white pl-10 pr-4 py-2.5 border rounded-lg text-sm" 
                            />
                        </div>
                        <button onClick={() => setFiltersModalOpen(true)} className="flex items-center gap-2 text-sm font-medium bg-white border rounded-lg p-2.5 px-3 text-black">
                            <SlidersHorizontal size={16} />
                            <span>All Filters</span>
                        </button>
                    </div>
                </div>
                <div className="px-4 sm:px-6 md:px-8 flex-grow overflow-y-auto pb-4">
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

// Wrapper Component لاستخدام الـ Provider
const LeadsRegularManagement = () => (
    <LeadsProvider>
        <LeadsManagementComponent />
    </LeadsProvider>
);

export default LeadsRegularManagement;