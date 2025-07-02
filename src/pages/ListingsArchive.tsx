import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ArchiveTable from '../components/dashboard/ArchiveTable';
import MoreFiltersModal from '../components/dashboard/MoreFiltersModal';
import ArchiveEmptyState from '../components/dashboard/ArchiveEmptyState';
import { useListings } from '../context/ListingsContext';
import { useDebounce } from '../hooks/useDebounce';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const sortOptions = [
    { label: "Listing Created: Newest", value: { sortBy: 'created_at', sortDirection: 'desc' } },
    { label: "Listing Created: Oldest", value: { sortBy: 'created_at', sortDirection: 'asc' } },
];

// ## الخطوة 1: تعريف الفلاتر الافتراضية لهذه الصفحة تحديدًا ##
const initialFilters = {
    archived: true, // <-- هذا هو الفلتر الأساسي والثابت
    search: '',
    reference: '',
    assigned_to_id: '',
    category: '',
    bedrooms: '',
    bedrooms_gte: '',
    type: '',
    offering_type: '',
    price_min: '',
    price_max: '',
    size_min: '',
    size_max: '',
    furnishing_type: ''
};

const ListingsArchive = () => {
    const { listings, pagination, loading, fetchListings } = useListings();

    const [filters, setFilters] = useState(initialFilters);
    const [sort, setSort] = useState(sortOptions[0].value);
    const [currentSortLabel, setCurrentSortLabel] = useState(sortOptions[0].label);
    const debouncedSearch = useDebounce(filters.search, 500);

    const [isSortOpen, setSortOpen] = useState(false);
    const [isFiltersModalOpen, setFiltersModalOpen] = useState(false);
    
    const applyFiltersAndFetch = useCallback(() => {
        const activeFilters = { ...filters, search: debouncedSearch };
        Object.keys(activeFilters).forEach(key => {
            const filterKey = key as keyof typeof activeFilters;
            if (!activeFilters[filterKey]) {
                delete activeFilters[filterKey];
            }
        });
        fetchListings({ filters: activeFilters, sort });
    }, [filters, debouncedSearch, sort, fetchListings]);

    useEffect(() => {
        applyFiltersAndFetch();
    }, [applyFiltersAndFetch]);

    const handleApplyModalFilters = (newFiltersFromModal: typeof initialFilters) => {
        setFilters(newFiltersFromModal);
    };
    


    const handleSortChange = (newSortOption: { label: string, value: { sortBy: string; sortDirection: string } }) => {
        setSort(newSortOption.value);
        setCurrentSortLabel(newSortOption.label);
        setSortOpen(false);
    };

    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
        if (listings.length === 0) return <ArchiveEmptyState />;
        return <ArchiveTable listings={listings} onActionComplete={applyFiltersAndFetch} />;
    };
    
    return (
        <>
            {isFiltersModalOpen && (
                <MoreFiltersModal 
                    onClose={() => setFiltersModalOpen(false)}
                    initialFilters={filters}
                    onApply={handleApplyModalFilters}
                />
            )}
            
            <div className="flex flex-col h-full bg-gray-50">
                <div className="p-4 sm:p-6 md:p-8 space-y-4 lg:space-y-6 bg-gray-50 flex-shrink-0 z-10">
                    <h1 className="text-2xl font-bold text-gray-800">Listings Archive {pagination && `(${pagination.total})`}</h1>
                    <div className="space-y-4">
                        <div className="relative w-full">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="City, community or building" 
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full bg-white pl-10 pr-8 py-2.5 border rounded-lg" 
                            />
                            {filters.search && <X size={16} onClick={() => setFilters(prev => ({ ...prev, search: '' }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            <button onClick={() => setFiltersModalOpen(true)} className="flex items-center gap-2 text-sm font-medium bg-white border rounded-lg p-2.5 lg:px-3"><SlidersHorizontal size={16} /><span className="hidden lg:inline">All Filters</span></button>
                            <div className="relative">
                                <button onClick={() => setSortOpen(!isSortOpen)} className="flex items-center gap-2 text-sm font-medium bg-white border rounded-lg p-2.5 lg:px-3">
                                    <ArrowUpDown size={16} />
                                    <span className="hidden lg:inline">{currentSortLabel}</span>
                                </button>
                                {isSortOpen && 
                                    <div className="absolute top-full mt-2 w-56 bg-white rounded-md shadow-lg border z-20">
                                        <ul className="py-1">
                                            {sortOptions.map(opt => (
                                                <li key={opt.label}>
                                                    <button onClick={() => handleSortChange(opt)} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100">{opt.label}</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-4 sm:px-6 md:px-8 flex-grow overflow-y-auto pb-4">
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default ListingsArchive;