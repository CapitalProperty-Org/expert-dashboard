import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ListingPreview from '../components/dashboard/add-listing/ListingPreview';
import type { ListingState } from '../types';

const ListingPreviewPage = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const [listingState, setListingState] = useState<ListingState | null>(null);
    const [agentData, setAgentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchListing = async () => {
            if (!id || !token) return;
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const listing = response.data;

                const price = listing.price || {};
                const amounts = price.amounts || {};

                // Store agent data with properties_count
                if (listing.assigned_to) {
                    console.log('Agent data from API:', listing.assigned_to);
                    setAgentData({
                        id: listing.assigned_to.id,
                        name: `${listing.assigned_to.first_name || ''} ${listing.assigned_to.last_name || ''}`.trim() || listing.assigned_to.name,
                        properties_count: listing.assigned_to.properties_count || 0,
                        company: {
                            name: listing.assigned_to.company?.name || 'Agency',
                            logo_url: listing.assigned_to.company?.logo_url,
                            properties_count: listing.assigned_to.company?.properties_count || 0
                        }
                    });
                }

                // Map API listing to ListingState
                const mappedState: ListingState = {
                    uae_emirate: listing.uae_emirate || '',
                    city: listing.city || null,
                    category: listing.category || null,
                    offeringType: price.type || null,
                    rentalPeriod: listing.rental_period || null,
                    propertyType: listing.type || '',
                    bedrooms: String(listing.bedrooms || ''),
                    bathrooms: String(listing.bathrooms || ''),
                    size: String(listing.size || ''),
                    price: String(amounts[price.type] || prices(amounts) || ''),
                    title: (listing.title?.en && /^draft:\s*/i.test(listing.title.en)) ? '' : (listing.title?.en || ''),
                    title_ar: listing.title?.ar || '',
                    description: listing.description?.en || '',
                    description_ar: listing.description?.ar || '',
                    reference: listing.reference || '',
                    developer: String(listing.developer_id || ''),
                    unitNumber: listing.unit_number || '',
                    parkingSlots: String(listing.parking_slots || ''),
                    furnishingType: listing.furnishing_type || null,
                    age: String(listing.age || ''),
                    numberOfFloors: listing.number_of_floors ? String(listing.number_of_floors) : '',
                    projectStatus: listing.project_status || '',
                    ownerName: listing.owner_name || '',
                    amenities: listing.amenities || [],
                    images: listing.images?.map((img: any) => ({ url: img.original?.url || img.url })) || [],
                    propertyLocation: listing.location?.id ? { value: listing.location.id, label: listing.location.title_en || '' } : null,
                    assignedAgent: listing.assigned_to?.id ? { value: listing.assigned_to.id, label: listing.assigned_to.name || '' } : null,
                    permitType: listing.permit_type || null,
                    reraPermitNumber: listing.rera_permit_number || '',
                    dtcmPermitNumber: listing.dtcm_permit_number || '',
                    downPayment: String(listing.down_payment || ''),
                    numberOfCheques: String(listing.number_of_cheques || ''),
                    googleAddress: listing.location?.title_en || '',
                    // Defaults for fields not in basic GET response or not needed for preview
                    available: 'immediately',
                    availableDate: null,
                    latitude: null,
                    longitude: null,
                    googleAddressComponents: null,
                    updatedAt: listing.updated_at || null,
                    createdAt: listing.created_at || null
                };

                setListingState(mappedState);
            } catch (err) {
                console.error(err);
                setError('Failed to load listing preview');
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id, token]);

    // Helper to extract first price found if type specific not found
    const prices = (amounts: any) => {
        return amounts.sale || amounts.rent || amounts.yearly || amounts.monthly || 0;
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (error || !listingState) return <div className="flex items-center justify-center min-h-screen text-red-500">{error || 'Listing not found'}</div>;

    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto px-4 max-w-5xl py-8">
                <ListingPreview
                    state={listingState}
                    images={listingState.images}
                    isFullPage={true}
                    agentData={agentData}
                />
            </div>
        </div>
    );
};

export default ListingPreviewPage;
