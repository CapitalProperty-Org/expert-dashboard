import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, LayoutGrid, Plus, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import ListingsTable from '../components/dashboard/ListingsTable';
import ToggleButton from '../components/dashboard/ToggleButton';
import MoreFiltersModal from '../components/dashboard/MoreFiltersModal';
import PropertyCard from '../components/dashboard/PropertyCard';
import ListingsEmptyState from '../components/dashboard/ListingsEmptyState';
import { useListings } from '../context/ListingsContext';
import { useDebounce } from '../hooks/useDebounce';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BulkActionBar from '../components/dashboard/BulkActionBar';
import ErrorToast from '../components/ui/ErrorToast';
import SuccessToast from '../components/ui/SuccessToast';
import axios from 'axios';
import { useConfirmationModal } from '../hooks/useConfirmationModal';
import type { Listing } from '../context/ListingsContext';

const sortOptions = [
    { label: "Listing Created: Newest", value: { sortBy: 'created_at', sortDirection: 'desc' } },
    { label: "Listing Created: Oldest", value: { sortBy: 'created_at', sortDirection: 'asc' } },
    { label: "Price: Highest", value: { sortBy: 'price', sortDirection: 'desc' } },
    { label: "Price: Lowest", value: { sortBy: 'price', sortDirection: 'asc' } },
];

const initialFilters = {
    draft: true, live: false, search: '', reference: '', assigned_to_id: '',
    category: '', bedrooms: '', bedrooms_gte: '', type: '', offering_type: '',
    price_min: '', price_max: '', size_min: '', size_max: '', furnishing_type: '',
    unit_number: '', expiry_date_from: '', expiry_date_to: '', owner_id: '', rera_permit_number: ''
};

const ListingsManagement = () => {
    const { listings, pagination, loading, error, fetchListings } = useListings();
    const { openModal, ConfirmationModalComponent } = useConfirmationModal();
    
    const getPriceValue = (listing: Listing): number => {
        if (!listing.price || !listing.price.amounts) return 0;
        return Object.values(listing.price.amounts)[0] || 0;
    };
    
    const [filters, setFilters] = useState(initialFilters);
    const [sort, setSort] = useState(sortOptions[0].value);
    const [currentSortLabel, setCurrentSortLabel] = useState(sortOptions[0].label);
    const debouncedSearch = useDebounce(filters.search, 500);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isSortOpen, setSortOpen] = useState(false);
    const [isFiltersModalOpen, setFiltersModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);
    
    const applyFiltersAndFetch = useCallback(() => {
        const activeFilters: Record<string, string | boolean> = { ...filters, search: debouncedSearch };
        Object.keys(activeFilters).forEach(key => {
            const filterKey = key as keyof typeof activeFilters;
            if (
                typeof activeFilters[filterKey] === 'object' &&
                activeFilters[filterKey] !== null &&
                'value' in (activeFilters[filterKey] as any)
            ) {
                activeFilters[filterKey] = (activeFilters[filterKey] as { value: string }).value;
            }
            if (!activeFilters[filterKey]) delete activeFilters[filterKey];
        });
        
        const sortToSend = sort.sortBy === 'price' ? null : sort;
        fetchListings({ filters: activeFilters, sort: sortToSend });
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

    const handleToggleDrafts = () => {
        setFilters(prev => ({ ...initialFilters, draft: !prev.draft, live: prev.draft }));
    };
    
    const handleSelectionChange = (id: string, isSelected: boolean) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) newSet.add(id);
            else newSet.delete(id);
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(listings.map(l => l.id)));
        } else {
            setSelectedIds(new Set());
        }
    };
    
    const handleActionComplete = () => {
        applyFiltersAndFetch();
    };

       const handleBulkAction = async (
        action: 'publish' | 'archive' | 'unarchive' | 'reject' | 'reassign',
        data?: Record<string, unknown>
    ) => {
        const promises = Array.from(selectedIds).map(id => {
            const endpoint = `${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}/${action}`;
            return axios.post(endpoint, data);
        });
        
        try {
            await Promise.all(promises);
            setSuccessMessage(`Successfully performed ${action} on ${selectedIds.size} listings.`);
            setShowSuccess(true);
            handleActionComplete();
            setSelectedIds(new Set());
            setIsSelectionMode(false);
        } catch {
            setErrorMessage(`Failed to perform ${action}. Please try again.`);
            setShowError(true);
        }
    };

      const confirmAction = (action: 'publish' | 'archive' | 'unarchive' | 'reject') => {
        const actionText = action.charAt(0).toUpperCase() + action.slice(1);
        openModal({
            title: `${actionText} Listings`,
            description: `Are you sure you want to ${action} ${selectedIds.size} selected listing(s)?`,
            confirmText: actionText,
            isDestructive: action === 'reject',
            onConfirm: () => handleBulkAction(action),
        });
    };

    const handleDeselectAll = () => {
        setSelectedIds(new Set());
        setIsSelectionMode(false);
    };

    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
        if (error) {
            // عرض ErrorToast بدلاً من النص العادي
            if (!showError) {
                setErrorMessage(error);
                setShowError(true);
            }
            return <ListingsEmptyState />;
        }
        if (listings.length === 0) return <ListingsEmptyState />;
        
        const sortedListings = [...listings].sort((a, b) => {
            if (sort.sortBy === 'price') {
                const priceA = getPriceValue(a);
                const priceB = getPriceValue(b);
                return sort.sortDirection === 'desc' ? priceB - priceA : priceA - priceB;
            }
            
            if (sort.sortBy === 'created_at') {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sort.sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
            }
            
            return 0;
        });
        
        if (viewMode === 'list') {
            return <ListingsTable listings={sortedListings} isSelectionMode={isSelectionMode} selectedIds={selectedIds} onSelectionChange={handleSelectionChange} onSelectAll={handleSelectAll} onActionComplete={handleActionComplete} />;
        } else {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedListings.map(listing => <PropertyCard key={listing.id} listing={listing} onActionComplete={handleActionComplete} />)}
                </div>
            );
        }
    };
    
    return (
        <>
            {isFiltersModalOpen && <MoreFiltersModal onClose={() => setFiltersModalOpen(false)} initialFilters={filters} onApply={handleApplyModalFilters} />}
            {ConfirmationModalComponent}
            <ErrorToast 
                message={errorMessage}
                show={showError}
                onClose={() => setShowError(false)}
            />
            <SuccessToast 
                message={successMessage}
                show={showSuccess}
                onClose={() => setShowSuccess(false)}
            />

            <div className="flex flex-col h-full bg-gray-50">
                <div className="p-4 sm:p-6 md:p-8 space-y-4 lg:space-y-6 bg-gray-50 flex-shrink-0 z-10">
                    <div className="hidden lg:flex flex-wrap gap-y-4 items-center justify-between">
                         <h1 className="text-2xl font-bold text-black">Listings Management {pagination && `(${pagination.total})`}</h1>
                         <div className="flex items-center gap-4">
                             {selectedIds.size > 0 && <span className="text-sm font-semibold text-gray-700">{selectedIds.size} Selected</span>}
                             {!isSelectionMode && listings.length > 0 && 
                                <button onClick={() => setIsSelectionMode(true)} className="text-sm bg-white border border-violet-600 text-violet-600 font-semibold py-2 px-4 rounded-md hover:bg-violet-50">Select Listings</button>
                             }
                             <Link to="/add-listing"><button className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2"><Plus size={16} />List new property</button></Link>
                         </div>
                    </div>
                    
                    <div className="lg:hidden flex justify-between items-center">
                         <h1 className="text-xl font-bold text-black">Listings Management {pagination && `(${pagination.total})`}</h1>
                    </div>

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
                        <div className="flex flex-wrap gap-2 items-center justify-between text-black">
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
                                                        <button 
                                                            onClick={() => handleSortChange(opt)} 
                                                            className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100"
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    }
                                </div>
                                <button onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} className="flex items-center gap-2 text-sm font-medium bg-white border rounded-lg p-2.5 lg:px-3">
                                    {viewMode === 'list' ? <LayoutGrid size={16} /> : <List size={16} />}<span className="hidden lg:inline">{viewMode === 'list' ? 'Grid' : 'List'}</span>
                                </button>
                           </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600">Drafts / Unpublished</span>
                                <ToggleButton isOn={filters.draft} handleToggle={handleToggleDrafts} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 md:px-8 flex-grow overflow-y-auto pb-28 lg:pb-4">
                    {renderContent()}
                </div>
                
                {selectedIds.size > 0 && (
                   <BulkActionBar 
                        selectedCount={selectedIds.size}
                        isDraftMode={filters.draft}
                        onDeselectAll={handleDeselectAll}
                        onPublish={() => confirmAction('publish')}
                        onUnpublish={() => confirmAction('unarchive')}
                        onArchive={() => confirmAction('archive')}
                        onReject={() => confirmAction('reject')}
                        onReassignClick={() => setIsReassignModalOpen(true)}
                    />
                )}
                
                {selectedIds.size === 0 && (
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t p-4 flex items-center justify-center gap-4 z-30">
                        {!isSelectionMode && listings.length > 0 && (
                            <button onClick={() => setIsSelectionMode(true)} className="text-sm bg-white border border-violet-600 text-violet-600 font-semibold py-2.5 px-4 rounded-lg w-full max-w-xs hover:bg-violet-50">
                                Select Listings
                            </button>
                        )}
                        <Link to="/add-listing" className="w-full max-w-xs">
                           <button className="bg-red-600 text-white font-semibold py-2.5 px-1 rounded-lg flex items-center justify-center gap-2 w-full hover:bg-red-700">
                               <Plus size={16} />List new property
                           </button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default ListingsManagement;