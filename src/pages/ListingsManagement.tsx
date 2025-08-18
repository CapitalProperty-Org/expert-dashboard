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
import ApproveModal from '../components/dashboard/ApproveModal';
import ReassignModal from '../components/dashboard/ReassignModal';
import RejectModal from '../components/dashboard/RejectModal';
import type { Listing } from '../context/ListingsContext';

// New interface for publish payload
interface IPublishListingPayload {
    listing_ids: string[];
    deduct_credits: boolean;
    credits_per_listing: number;
}

// New interface for publish response
interface IPublishListingResponse {
    job_token: string;
    credits_deducted: number;
    total_cost: number;
    message: string;
}

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
    const [debouncedSearch] = useDebounce(filters.search, 500);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isSortOpen, setSortOpen] = useState(false);
    const [isFiltersModalOpen, setFiltersModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isReassigning, setIsReassigning] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [creditBalance, setCreditBalance] = useState<{
        total_credits: number;
        remaining_credits: number;
        used_credits: number;
    } | null>(null);
    
    const applyFiltersAndFetch = useCallback(() => {
        const activeFilters: Record<string, string | boolean> = { ...filters, search: debouncedSearch };
        Object.keys(activeFilters).forEach(key => {
            const filterKey = key as keyof typeof activeFilters;
            if (
                typeof activeFilters[filterKey] === 'object' &&
                activeFilters[filterKey] !== null &&
                'value' in (activeFilters[filterKey] as Record<string, unknown>)
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
        action: 'publish' | 'archive' | 'unarchive' | 'reject' | 'reassign' | 'approve',
        data?: Record<string, unknown>
    ) => {
        const promises = Array.from(selectedIds).map(id => {
            let endpoint: string;
            let payload: Record<string, unknown> = {};
            
            switch (action) {
                case 'publish':
                    endpoint = `${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}/publish`;
                    break;
                case 'archive':
                    endpoint = `${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}/archive`;
                    break;
                case 'unarchive':
                    endpoint = `${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}/unarchive`;
                    break;
                case 'approve':
                    endpoint = `${import.meta.env.VITE_BASE_URL}/api/listings/listings/approve`;
                    payload = { listing_ids: [id] };
                    break;
                case 'reject':
                    endpoint = `${import.meta.env.VITE_BASE_URL}/api/listings/listings/reject`;
                    payload = { listing_ids: [id] };
                    break;
                case 'reassign':
                    endpoint = `${import.meta.env.VITE_BASE_URL}/api/listings/listings/reassign`;
                    payload = { 
                        listing_ids: [id],
                        to_agent_id: data?.new_assigned_to 
                    };
                    break;
                default:
                    return Promise.reject(new Error(`Unknown action: ${action}`));
            }
            
            if (action === 'approve' || action === 'reject' || action === 'reassign') {
                return axios.post(endpoint, payload);
            } else {
                return axios.post(endpoint);
            }
        });
        
        try {
            await Promise.all(promises);
            setSuccessMessage(`Successfully performed ${action} on ${selectedIds.size} listings.`);
            setShowSuccess(true);
            handleActionComplete();
            setSelectedIds(new Set());
            setIsSelectionMode(false);
        } catch (error: unknown) {
            const errorMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || `Failed to perform ${action}. Please try again.`;
            setErrorMessage(errorMsg);
            setShowError(true);
        }
    };

    // Fetch credit balance
    const fetchCreditBalance = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/credits/my-multi-balance`);
            setCreditBalance(response.data);
        } catch (err) {
            console.error('Error fetching credit balance:', err);
            // Set default values if API fails
            setCreditBalance({
                total_credits: 0,
                remaining_credits: 0,
                used_credits: 0
            });
        }
    }, []);

    // Calculate credits needed for publishing
    const getCreditsNeeded = () => {
        // Assuming 10 credits per listing (as shown in the image)
        return selectedIds.size * 10;
    };

    // Check if user has enough credits
    const hasEnoughCredits = () => {
        if (!creditBalance) return false;
        return creditBalance.remaining_credits >= getCreditsNeeded();
    };

    // Handle publish confirmation
    const handlePublishConfirm = async () => {
        if (!hasEnoughCredits()) {
            setErrorMessage('Insufficient credits to publish listings.');
            setShowError(true);
            setIsPublishModalOpen(false);
            return;
        }

        setIsPublishing(true);
        try {
            // Create payload for new backend
            const publishPayload: IPublishListingPayload = {
                listing_ids: Array.from(selectedIds),
                deduct_credits: true,
                credits_per_listing: 10
            };

            // Call the new publish endpoint
            const response = await axios.post<{ status: string; data: IPublishListingResponse; message?: string }>(
                `${import.meta.env.VITE_BASE_URL}/api/listings/listings/publish`,
                publishPayload
            );

            if (response.data.status === 'success') {
                setSuccessMessage(response.data.data.message || `Successfully published ${selectedIds.size} listings`);
                setShowSuccess(true);
                setIsPublishModalOpen(false);
                setSelectedIds(new Set());
                setIsSelectionMode(false);
                
                // Refresh listings and credit balance
                await Promise.all([
                    applyFiltersAndFetch(),
                    fetchCreditBalance()
                ]);
            } else {
                throw new Error(response.data.message || 'Failed to publish listings');
            }
        } catch (error: unknown) {
            const errorMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 
                           (error as Error)?.message || 
                           'Failed to publish listings. Please try again.';
            setErrorMessage(errorMsg);
            setShowError(true);
        } finally {
            setIsPublishing(false);
        }
    };

    // Open publish confirmation modal
    const openPublishModal = () => {
        fetchCreditBalance();
        setIsPublishModalOpen(true);
    };

    const handleApprove = async () => {
        setIsApproving(true);
        try {
            await handleBulkAction('approve');
            setIsApproveModalOpen(false);
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        setIsRejecting(true);
        try {
            await handleBulkAction('reject');
            setIsRejectModalOpen(false);
        } finally {
            setIsRejecting(false);
        }
    };

    const handleReassign = async (agentId: string) => {
        setIsReassigning(true);
        try {
            const payload = {
                new_assigned_to: agentId
            };
            
            await handleBulkAction('reassign', payload);
            setIsReassignModalOpen(false);
        } finally {
            setIsReassigning(false);
        }
    };

    const handleDeselectAll = () => {
        setSelectedIds(new Set());
        setIsSelectionMode(false);
    };

    const confirmAction = (action: 'archive' | 'unarchive') => {
        const actionText = action.charAt(0).toUpperCase() + action.slice(1);
        openModal({
            title: `${actionText} Listings`,
            description: `Are you sure you want to ${action} ${selectedIds.size} selected listing(s)?`,
            confirmText: actionText,
            isDestructive: action === 'archive',
            onConfirm: () => handleBulkAction(action),
        });
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
                const dateA = new Date(a.updated_at).getTime();
                const dateB = new Date(b.updated_at).getTime();
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
                        <ApproveModal 
                            isOpen={isApproveModalOpen}
                            onClose={() => setIsApproveModalOpen(false)}
                            onApprove={handleApprove}
                            selectedCount={selectedIds.size}
                            isApproving={isApproving}
                        />
                        <ReassignModal 
                            isOpen={isReassignModalOpen}
                            onClose={() => setIsReassignModalOpen(false)}
                            onReassign={handleReassign}
                            selectedCount={selectedIds.size}
                            isReassigning={isReassigning}
                        />
                        <RejectModal 
                            isOpen={isRejectModalOpen}
                            onClose={() => setIsRejectModalOpen(false)}
                            onReject={handleReject}
                            selectedCount={selectedIds.size}
                            isRejecting={isRejecting}
                        />
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

            {/* Publish Confirmation Modal */}
            {isPublishModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div 
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col p-8 text-center"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Publish Listings</h2>
                        
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-4">
                                You are about to publish <span className="font-semibold">{selectedIds.size}</span> listings for <span className="font-semibold text-red-600">{getCreditsNeeded()}</span> credits
                            </p>
                            
                            {creditBalance && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-gray-600 mb-2">Remaining balance: <span className="font-semibold text-gray-800">{creditBalance.remaining_credits}</span> credits</p>
                                    
                                    {!hasEnoughCredits() && (
                                        <div className="text-red-600 text-sm font-medium">
                                            ⚠️ Insufficient credits
                                        </div>
                                    )}
                                    
                                    {hasEnoughCredits() && (
                                        <div className="text-green-600 text-sm font-medium">
                                            ✓ Sufficient credits available
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setIsPublishModalOpen(false)}
                                disabled={isPublishing}
                                className="bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePublishConfirm}
                                disabled={isPublishing || !hasEnoughCredits()}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isPublishing ? 'Publishing...' : 'Publish'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        onPublish={openPublishModal}
                        onUnpublish={() => confirmAction('unarchive')}
                        onArchive={() => confirmAction('archive')}
                        onReject={() => setIsRejectModalOpen(true)}
                        onReassignClick={() => setIsReassignModalOpen(true)}
                        onApprove={() => setIsApproveModalOpen(true)}
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