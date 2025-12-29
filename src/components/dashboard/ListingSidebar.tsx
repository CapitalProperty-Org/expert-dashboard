import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import type { Listing } from '../../context/ListingsContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ListingSidebarProps {
    listingId: string | null;
    onClose: () => void;
}

const ListingSidebar = ({ listingId, onClose }: ListingSidebarProps) => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!listingId || !token) {
            setListing(null);
            return;
        }

        const fetchListingDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${listingId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setListing(response.data);
            } catch (err: any) {
                console.error('Failed to fetch listing details:', err);
                setError('Failed to load listing details.');
            } finally {
                setLoading(false);
            }
        };

        fetchListingDetails();
    }, [listingId, token]);

    if (!listingId) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/20 z-40 transition-opacity ${listingId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${listingId ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-bold text-gray-900">
                            Listing Performance
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Overview
                        </button>
                        <button
                            disabled
                            className="px-6 py-3 text-sm font-semibold text-gray-300 cursor-not-allowed"
                        >
                            History
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <LoadingSpinner />
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500 py-8">
                                {error}
                            </div>
                        ) : listing ? (
                            <div className="space-y-6">
                                {activeTab === 'overview' && (
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-4">
                                            <DetailRow
                                                label="Assigned to"
                                                value={listing.assigned_to?.name || 'Unassigned'}
                                                icon={<User size={18} className="text-gray-400" />}
                                            />
                                            <DetailRow
                                                label="Created by"
                                                value={listing.created_by?.name || 'System'}
                                                icon={<Calendar size={18} className="text-gray-400" />}
                                            />
                                            <DetailRow
                                                label="Updated by"
                                                value={listing.updated_by?.name || listing.assigned_to?.name || 'N/A'}
                                                icon={<Clock size={18} className="text-gray-400" />}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
};

const DetailRow = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5">{icon}</div>}
        <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-semibold text-gray-900 mt-1">{value}</span>
        </div>
    </div>
);

export default ListingSidebar;
