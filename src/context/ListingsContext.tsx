import React, { useState, useCallback, createContext, useContext } from 'react';
import axios from 'axios';
import ErrorToast from '../components/ui/ErrorToast';

export interface Listing {
    id: string;
    reference: string;
    category: string;
    price: { type: 'sale' | 'rent'; amounts: { [key: string]: number } };
    type: string;
    bedrooms: string | null;
    size: number | null;
    quality_score: { value: number };
    state: { type: string };
    updated_at: string;
    assigned_to: { name: string };
    location: { id: number; name?: string };
    images?: string[]; // Add support for property images
}

export interface Pagination {
    page_number: number;
    page_size: number;
    total: number;
}

interface FetchOptions {
    filters: { [key: string]: string | number | boolean };
    sort: { sortBy: string; sortDirection: string } | null;
    page?: number;
}

interface ListingsContextType {
    listings: Listing[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    fetchListings: (options: FetchOptions) => void;
    showErrorToast: boolean;
    setShowErrorToast: (show: boolean) => void;
    approveListing: (id: string) => Promise<void>;
    rejectListing: (id: string) => Promise<void>;
    reassignListing: (id: string, payload: { new_assigned_to: string }) => Promise<void>;
    publishListing: (id: string) => Promise<void>;
    archiveListing: (id: string) => Promise<void>;
    unarchiveListing: (id: string) => Promise<void>;
}

const ListingsContext = createContext<ListingsContextType | null>(null);

export const ListingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showErrorToast, setShowErrorToast] = useState(false);

    const fetchListings = useCallback(async ({ filters, sort, page = 1 }: FetchOptions) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            
            Object.keys(filters).forEach(key => {
                if (filters[key]) params.append(key, String(filters[key]));
            });

            if (sort && sort.sortBy) {
                params.append(`sort[${sort.sortBy}]`, sort.sortDirection);
            }

            params.append('page', page.toString());
            
            const listingsResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/listings/listings?${params.toString()}`);
            const { results, pagination: newPagination } = listingsResponse.data;
            
            if (results && results.length > 0) {
                const listingIds = results.map((l: Listing) => l.id).join(',');
                const attributesResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/listing-attributes?ids=${listingIds}`);
                const attributesData = attributesResponse.data;

                const mergedListings = results.map((listing: Listing) => ({
                    ...listing,
                    location: {
                        ...listing.location,
                        name: attributesData[listing.id]?.location?.title_en || 'Unknown Location',
                    }
                }));
                setListings(mergedListings);
            } else {
                setListings([]);
            }
            
            setPagination(newPagination);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch listings. Please try again.";
            setError(errorMessage);
            setShowErrorToast(true);
        } finally {
            setLoading(false);
        }
    }, []);

    const approveListing = useCallback(async (id: string) => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/approve`, {
                listing_ids: [id]
            });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to approve listing.";
            throw new Error(errorMessage);
        }
    }, []);

    const rejectListing = useCallback(async (id: string) => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/reject`, {
                listing_ids: [id]
            });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to reject listing.";
            throw new Error(errorMessage);
        }
    }, []);

    const reassignListing = useCallback(async (id: string, payload: { new_assigned_to: string }) => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/reassign`, {
                listing_ids: [id],
                to_agent_id: payload.new_assigned_to
            });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to reassign listing.";
            throw new Error(errorMessage);
        }
    }, []);

    const publishListing = useCallback(async (id: string) => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}/publish`);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to publish listing.";
            throw new Error(errorMessage);
        }
    }, []);

    const archiveListing = useCallback(async (id: string) => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}/archive`);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to archive listing.";
            throw new Error(errorMessage);
        }
    }, []);

    const unarchiveListing = useCallback(async (id: string) => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}/unarchive`);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to unarchive listing.";
            throw new Error(errorMessage);
        }
    }, []);

    return (
        <ListingsContext.Provider value={{ 
            listings, 
            pagination, 
            loading, 
            error, 
            fetchListings,
            showErrorToast,
            setShowErrorToast,
            approveListing,
            rejectListing,
            reassignListing,
            publishListing,
            archiveListing,
            unarchiveListing
        }}>
            {children}
            {showErrorToast && error && (
                <ErrorToast 
                    show={showErrorToast}
                    message={error} 
                    onClose={() => setShowErrorToast(false)} 
                />
            )}
        </ListingsContext.Provider>
    );
};

export const useListings = () => {
    const context = useContext(ListingsContext);
    if (!context) {
        throw new Error('useListings must be used within a ListingsProvider');
    }
    return context;
};