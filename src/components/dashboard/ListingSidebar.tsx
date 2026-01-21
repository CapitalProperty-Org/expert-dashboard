import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, StickyNote, Edit2, Trash2, Rocket, Info, ChevronRight, Calculator, Tag, Mail, Phone } from 'lucide-react';
import { formatDistanceToNow, format, differenceInDays, subDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import type { Listing } from '../../context/ListingsContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import ListingInsights from './ListingInsights';

interface ListingSidebarProps {
    listingId: string | null;
    onClose: () => void;
}

const ListingSidebar = ({ listingId, onClose }: ListingSidebarProps) => {
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Notes State
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [notes, setNotes] = useState<any[]>([]);
    const [notesLoading, setNotesLoading] = useState(false);
    const [notesError, setNotesError] = useState<string | null>(null);
    const MAX_NOTE_CHARS = 1000;

    const canEdit = React.useMemo(() => {
        if (!user || !listing) return false;
        if (user.role === 'admin' || user.role === 'decision_maker') return true;

        const userId = Number(user.id);
        const assignedId = Number(listing.assigned_to?.id);
        const createdId = Number(listing.created_by?.id);

        return userId === assignedId || userId === createdId;
    }, [user, listing]);

    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const fetchNotes = async () => {
        if (!listingId || !token) return;
        setNotesLoading(true);
        setNotesError(null);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${listingId}/notes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotes(response.data);
        } catch (err) {
            console.error('Failed to fetch notes:', err);
            setNotesError('Failed to load notes');
        } finally {
            setNotesLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'notes' && listingId) {
            fetchNotes(); // Fetch when tab becomes active
        }
    }, [activeTab, listingId]);

    const handleSaveNote = async () => {
        if (!listingId || !token) return;
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${listingId}/notes`,
                { text: noteContent },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setNoteContent('');
            setIsAddingNote(false);
            fetchNotes(); // Re-fetch notes after adding
        } catch (err) {
            console.error('Failed to save note:', err);
        }
    };

    const handleUpdateNote = async (noteId: string) => {
        if (!listingId || !token) return;
        try {
            await axios.put(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${listingId}/notes/${noteId}`,
                { text: editContent },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setEditingNoteId(null);
            setEditContent('');
            fetchNotes();
        } catch (err) {
            console.error('Failed to update note:', err);
        }
    };

    const handleUnpublish = async () => {
        if (!listingId || !token) return;
        if (!window.confirm('Are you sure you want to unpublish this listing?')) return;

        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${listingId}/unpublish`,
                { all: false, listing_ids: [listingId] },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            // Refresh listing details
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${listingId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setListing(response.data);
            alert('Listing unpublished successfully');
        } catch (err) {
            console.error('Failed to unpublish:', err);
            alert('Failed to unpublish listing');
        }
    };

    const handleBoost = () => {
        // Placeholder for boost functionality
        console.log('Boost clicked');
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!listingId || !token) return;
        if (!window.confirm('Are you sure you want to delete this note?')) return;

        // Optimistic update
        const previousNotes = [...notes];
        setNotes(notes.filter(n => n.id !== noteId));

        try {
            await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${listingId}/notes/${noteId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            // No need to fetchNotes if successful, as we already removed it. 
            // But doing it silently in background is fine to ensure sync.
            fetchNotes();
        } catch (err) {
            console.error('Failed to delete note:', err);
            // Revert state on error
            setNotes(previousNotes);
            alert('Failed to delete note');
        }
    };

    const startEditing = (note: any) => {
        setEditingNoteId(note.id);
        setEditContent(note.text);
    };

    useEffect(() => {
        if (!listingId || !token) {
            setListing(null);
            return;
        }

        // Reset tab to overview when opening new listing
        setActiveTab('overview');

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
                <div className="flex flex-col h-full relative">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
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
                    <div className="flex border-b flex-shrink-0">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'insights' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Insights
                        </button>
                        <button
                            onClick={() => setActiveTab('leads')}
                            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'leads' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Leads
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'notes' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Notes
                        </button>

                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-6 pb-24">
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
                                        {listing.state?.type === 'published' ? (
                                            <>
                                                <button
                                                    onClick={() => window.open(`/listings/preview/${listing.id}`, '_blank')}
                                                    className="w-full py-3 bg-white border border-violet-600 rounded-lg text-violet-600 font-semibold text-sm hover:bg-violet-50 transition-colors"
                                                >
                                                    View my listing
                                                </button>

                                                <div className="space-y-6 pt-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-500">Assigned to</span>
                                                        <div className="flex items-center gap-2">
                                                            <User size={16} className="text-gray-400" />
                                                            <span className="text-gray-900 font-medium">{listing.assigned_to?.name || 'Unassigned'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-500">Created by</span>
                                                        <div className="flex items-center gap-2">
                                                            <User size={16} className="text-gray-400" />
                                                            <span className="text-gray-900 font-medium">{listing.created_by?.name || 'System'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-500">Updated by</span>
                                                        <div className="flex items-center gap-2">
                                                            <User size={16} className="text-gray-400" />
                                                            <span className="text-gray-900 font-medium">{listing.updated_by?.name || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-500">Published</span>
                                                        <div className="flex items-center gap-2">
                                                            <User size={16} className="text-gray-400" />
                                                            <span className="text-gray-900 font-medium">
                                                                {listing.updated_at ? `${formatDistanceToNow(new Date(listing.updated_at))} ago` : 'Recently'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Performance Metrics */}
                                                {!['draft', 'pending_publishing', 'archived'].includes(listing.state?.type || '') && (listing.state as any)?.stage !== 'archived' && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Impressions</span>
                                                            <span className="text-xl font-bold text-gray-900">{listing.impressions || 0}</span>
                                                        </div>
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Clicks</span>
                                                            <span className="text-xl font-bold text-gray-900">{listing.clicks || 0}</span>
                                                        </div>
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">CTR</span>
                                                            <span className="text-xl font-bold text-gray-900">{listing.ctr || 0}%</span>
                                                        </div>
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Leads</span>
                                                            <span className="text-xl font-bold text-gray-900">{listing.leads_received || 0}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="border-t pt-6 space-y-4">
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
                                            </>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'insights' && (
                                    <div className="space-y-6">
                                        {!['draft', 'pending_publishing', 'archived'].includes(listing.state?.type || '') && (listing.state as any)?.stage !== 'archived' && (
                                            <>
                                                {/* Performance Funnel Card */}
                                                <div className="bg-white rounded-lg border shadow-sm p-5">
                                                    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                                                        <div className="text-center min-w-[80px]">
                                                            <div className="text-2xl font-bold text-gray-900">{listing.impressions || 0}</div>
                                                            <div className="text-gray-500 text-xs mt-1">Impressions</div>
                                                        </div>
                                                        <ChevronRight className="text-gray-300 flex-shrink-0" size={20} />
                                                        <div className="text-center min-w-[80px]">
                                                            <div className="text-2xl font-bold text-gray-900">{listing.clicks || 0}</div>
                                                            <div className="text-gray-500 text-xs mt-1">Listing Clicks</div>
                                                        </div>
                                                        <ChevronRight className="text-gray-300 flex-shrink-0" size={20} />
                                                        <div className="text-center min-w-[80px]">
                                                            <div className="text-2xl font-bold text-gray-900">{listing.lead_clicks || 0}</div>
                                                            <div className="text-gray-500 text-xs mt-1">Lead Clicks</div>
                                                        </div>
                                                        <ChevronRight className="text-gray-300 flex-shrink-0" size={20} />
                                                        <div className="text-center min-w-[80px]">
                                                            <div className="text-2xl font-bold text-gray-900">{listing.leads_received || 0}</div>
                                                            <div className="text-gray-500 text-xs mt-1">Leads</div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 bg-gray-50 rounded-lg p-2 text-center border relative overflow-hidden">
                                                        <div className="absolute inset-y-0 left-0 bg-violet-100/50" style={{ width: `${Math.min(listing.ctr || 0, 100)}%` }}></div>
                                                        <span className="relative z-10 text-sm font-bold text-gray-800">{listing.ctr || 0}% CTR</span>
                                                    </div>

                                                    <div className="mt-4 text-xs text-gray-400">
                                                        Last updated: {listing.updated_at ? `${formatDistanceToNow(new Date(listing.updated_at))} ago` : 'Recently'}
                                                    </div>
                                                </div>

                                                {/* Leads Breakdown Card */}
                                                <div className="bg-white rounded-lg border shadow-sm p-5">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-gray-900">{listing.leads_received || 0}</div>
                                                            <div className="text-gray-500 text-xs mt-1">Leads</div>
                                                        </div>
                                                        <div className="text-gray-400 font-light text-2xl">=</div>
                                                        <div className="flex gap-4 sm:gap-8">
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-gray-900">0</div>
                                                                <div className="text-gray-500 text-xs mt-1">Calls</div>
                                                            </div>
                                                            <div className="text-gray-300 font-light text-xl mt-1">+</div>
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-gray-900">0</div>
                                                                <div className="text-gray-500 text-xs mt-1">Whatsapp</div>
                                                            </div>
                                                            <div className="text-gray-300 font-light text-xl mt-1">+</div>
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-gray-900">{listing.leads_received || 0}</div>
                                                                <div className="text-gray-500 text-xs mt-1">Email</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Details */}
                                                <div className="space-y-4 pt-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600 font-medium">Total credits spent</span>
                                                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                                            <Calculator size={16} className="text-gray-400" />
                                                            {listing.credits_spent || 35}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600 font-medium">Exposure</span>
                                                        <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-bold text-gray-600 uppercase tracking-wide">
                                                            {listing.exposure || 'STANDARD'}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-gray-600 text-sm font-medium">Listing Price</div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl font-bold text-gray-900">
                                                                {listing.price?.amounts?.sale
                                                                    ? `${new Intl.NumberFormat('en-US').format(listing.price.amounts.sale)} AED`
                                                                    : (listing.price?.amounts?.rent
                                                                        ? `${new Intl.NumberFormat('en-US').format(listing.price.amounts.rent)} AED`
                                                                        : 'Price on Request')}
                                                            </span>
                                                            {listing.price_realism && (
                                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                                                                    {listing.price_realism.replace('_', ' ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <ListingInsights qualityScore={listing.quality_score} />

                                        {!['draft', 'pending_publishing'].includes(listing.state?.type) && (
                                            /* Auto-Renew Card */
                                            <div className="bg-white rounded-lg border shadow-sm p-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-bold text-gray-900">
                                                        Auto-Renews in {listing.expiry_date ? differenceInDays(new Date(listing.expiry_date), new Date()) : 18} days
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-700">Auto-renew:</span>
                                                        <span className="text-sm font-bold text-violet-700">ON</span>
                                                    </div>
                                                </div>

                                                <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                                                    <div
                                                        className="absolute top-0 left-0 h-full bg-violet-600 rounded-full"
                                                        style={{
                                                            width: listing.expiry_date
                                                                ? `${Math.max(0, Math.min(100, ((30 - differenceInDays(new Date(listing.expiry_date), new Date())) / 30) * 100))}%`
                                                                : '60%'
                                                        }}
                                                    ></div>
                                                </div>

                                                <div className="flex justify-between text-sm text-gray-600 font-medium">
                                                    <span>
                                                        {listing.expiry_date
                                                            ? format(subDays(new Date(listing.expiry_date), 30), 'MMMM d')
                                                            : format(subDays(new Date(), 12), 'MMMM d')}
                                                    </span>
                                                    <span>
                                                        {listing.expiry_date
                                                            ? format(new Date(listing.expiry_date), 'MMMM d')
                                                            : format(subDays(new Date(), -18), 'MMMM d')}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'leads' && (
                                    <div className="space-y-6">
                                        {(listing.leads_received && listing.leads_received > 0) ? (
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-4">Recent Leads ({listing.leads_received})</h3>
                                                {/* Mock Lead Card */}
                                                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                                                    <div className="bg-gray-200/50 px-4 py-3 border-b">
                                                        <span className="font-bold text-gray-900">hamza</span>
                                                    </div>
                                                    <div className="p-4 space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-3 text-gray-700">
                                                                    <Mail size={18} />
                                                                    <span className="font-medium">hamza.almasri@gmail.com</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-gray-700">
                                                                    <Phone size={18} />
                                                                    <span className="font-medium">+971564469925</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right space-y-1">
                                                                <div className="text-xs text-gray-500">10 Jan 2026,<br />22:54</div>
                                                                <div className="text-xs text-gray-400">Email Lead</div>
                                                            </div>
                                                        </div>

                                                        <button className="w-full py-2.5 border border-violet-600 text-violet-600 font-bold rounded-lg hover:bg-violet-50 transition-colors text-sm">
                                                            Email Back
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Empty State */
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <div style={{ position: 'relative', width: '240px', height: '240px', marginBottom: '32px' }}>
                                                    <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%', display: 'block' }}>
                                                        <path d="M240 120C240 186.274 186.274 240 120 240C53.7258 240 0 186.274 0 120C0 53.7258 53.7258 0 120 0C186.274 0 240 53.7258 240 120Z" fill="rgba(227,227,227,0.5)" fillRule="nonzero"></path>
                                                    </svg>
                                                    <div style={{ position: 'absolute', inset: '21.67% 0% 21.78%' }}>
                                                        <svg viewBox="0 0 19.11 6.72" style={{ position: 'absolute', inset: '11.25% 32.66% 83.8% 59.38%', width: '19.11px', height: '6.72px' }}>
                                                            <path d="M0 0L19.1129 0L19.1129 6.72452L0 6.72452L0 0Z" fill="rgba(247,247,247,1)" fillRule="evenodd"></path>
                                                        </svg>
                                                        <svg viewBox="0 0 44.11 32.41" style={{ position: 'absolute', inset: '41.19% 71.71% 34.93% 9.92%', width: '44.11px', height: '32.41px' }}>
                                                            <path d="M2.5052 29.5726C-4.93601 20.8545 5.53234 13.1274 16.4726 18.7781C8.47272 10.3482 21.7784 2.07098 26.6759 10.5063C24.2586 -5.34078 39.1975 -1.03132 43.4574 8.80712C45.812 14.2447 41.4569 26.8321 35.1554 28.0563C24.3143 30.1615 30.6693 32.2279 14.1117 32.2279C8.4828 32.2279 7.1176 33.3041 3.46363 30.1901C3.1661 29.936 2.92901 29.8926 2.55633 29.9577L2.5052 29.5726Z" fill="rgba(247,247,247,1)" fillRule="evenodd"></path>
                                                        </svg>
                                                        <svg viewBox="0 0 44.11 32.41" style={{ position: 'absolute', inset: '44.14% 67.82% 31.98% 13.81%', width: '44.11px', height: '32.41px' }}>
                                                            <path d="M2.5052 29.5726C-4.93601 20.8545 5.53235 13.1274 16.4726 18.7781C8.47273 10.3482 21.7784 2.07098 26.6759 10.5063C24.2586 -5.34078 39.1975 -1.03132 43.4574 8.80712C45.812 14.2447 41.4569 26.8321 35.1554 28.0563C24.3144 30.1615 30.6693 32.2279 14.1117 32.2279C8.4828 32.2279 7.1176 33.3041 3.46363 30.1901C3.1661 29.936 2.92902 29.8926 2.55634 29.9577L2.5052 29.5726Z" fill="rgba(227,227,227,1)" fillRule="evenodd"></path>
                                                        </svg>
                                                        <svg viewBox="0 0 43.18 116.8" style={{ position: 'absolute', inset: '13.76% 57.36% 0.2% 24.65%', width: '43.18px', height: '116.8px' }}>
                                                            <path d="M0 16.9883L9.90973 0L43.1798 16.9883L43.1798 116.797L0 116.797L0 16.9883Z" fill="rgba(204,204,204,1)" fillRule="evenodd"></path>
                                                        </svg>
                                                        <svg viewBox="0 0 44.95 135.56" style={{ position: 'absolute', inset: '0% 41.65% 0.13% 39.62%', width: '44.95px', height: '135.56px' }}>
                                                            <path d="M0 0L44.9494 0L44.9494 135.556L0 135.556L0 0Z" fill="rgba(247,247,247,1)" fillRule="evenodd"></path>
                                                        </svg>
                                                        <svg viewBox="0 0 18.93 1.59" style={{ position: 'absolute', inset: '17.83% 32.69% 81% 59.42%', width: '18.93px', height: '1.59px' }}>
                                                            <path d="M0 0L18.9346 0L18.9346 1.593L0 1.593L0 0Z" fill="rgba(247,247,247,1)" fillRule="evenodd"></path>
                                                        </svg>
                                                        <svg viewBox="0 0 34.08 12.62" style={{ position: 'absolute', inset: '90.7% 2.02% 0% 83.27%', width: '35.31px', height: '12.62px' }}>
                                                            <path d="M34.0843 12.6216L0 12.6216C1.1715 10.6064 1.49538 7.76593 2.06253 6.01255C4.29164 -0.881644 10.2212 2.26716 10.2212 5.06885C10.2212 0.509132 17.227 -2.37779 19.384 2.80022C20.9894 -2.54747 30.5652 0.624577 29.3635 5.14478C34.041 2.40817 37.1588 9.4798 34.0843 12.6216Z" fill="rgba(204,204,204,1)" fillRule="evenodd"></path>
                                                        </svg>
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your leads live here</h3>
                                                <p className="text-gray-500 text-center max-w-[250px]">
                                                    Your first leads from your listings will be here.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'notes' && (
                                    <div className="flex flex-col space-y-6">
                                        <button
                                            onClick={() => setIsAddingNote(true)}
                                            className="w-full py-2.5 bg-white border border-violet-500 rounded-lg text-sm font-bold text-violet-700 hover:bg-violet-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            + Add a Note
                                        </button>

                                        {isAddingNote && (
                                            <div className="bg-white border rounded-xl shadow-sm p-4 space-y-3">
                                                <div className="relative">
                                                    <textarea
                                                        value={noteContent}
                                                        onChange={(e) => setNoteContent(e.target.value)}
                                                        maxLength={MAX_NOTE_CHARS}
                                                        placeholder="Put your listing notes here"
                                                        className="w-full h-24 p-0 border-none resize-none focus:ring-0 text-sm text-gray-700 placeholder:text-gray-400"
                                                        autoFocus
                                                    />
                                                    <div className="text-right text-xs text-violet-600 font-medium">
                                                        {noteContent.length}/{MAX_NOTE_CHARS}
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 pt-2 border-t">
                                                    <button
                                                        onClick={() => {
                                                            setIsAddingNote(false);
                                                            setNoteContent('');
                                                        }}
                                                        className="flex-1 px-4 py-2 bg-white border border-violet-800 text-violet-800 font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSaveNote}
                                                        disabled={!noteContent.trim()}
                                                        className="flex-1 px-4 py-2 bg-violet-600 text-white font-bold rounded-lg cursor-pointer hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
                                                    >
                                                        Save Note
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {notesLoading ? (
                                            <div className="flex justify-center py-8">
                                                <LoadingSpinner />
                                            </div>
                                        ) : notesError ? (
                                            <div className="text-center text-red-500 py-4 text-sm">{notesError}</div>
                                        ) : notes.length > 0 ? (
                                            <div className="space-y-4">
                                                {notes.map((note) => {
                                                    const isOwner = Number(user?.id) === Number(note.created_by?.id);
                                                    const isEditing = editingNoteId === note.id;

                                                    return (
                                                        <div key={note.id} className="bg-white border rounded-xl p-4 shadow-sm relative group">
                                                            {isEditing ? (
                                                                <div className="space-y-3">
                                                                    <div className="relative">
                                                                        <textarea
                                                                            value={editContent}
                                                                            onChange={(e) => setEditContent(e.target.value)}
                                                                            maxLength={MAX_NOTE_CHARS}
                                                                            className="w-full h-20 p-2 border rounded-lg resize-none focus:ring-1 focus:ring-violet-500 text-sm"
                                                                            autoFocus
                                                                        />
                                                                        <div className="text-right text-xs text-gray-400">
                                                                            {editContent.length}/{MAX_NOTE_CHARS}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={() => setEditingNoteId(null)}
                                                                            className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-md"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateNote(note.id)}
                                                                            disabled={!editContent.trim()}
                                                                            className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-md disabled:opacity-50"
                                                                        >
                                                                            Save
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <p className="text-gray-800 text-sm font-medium leading-relaxed pr-6">
                                                                            {note.text}
                                                                        </p>
                                                                        {isOwner && (
                                                                            <div className="flex gap-1 absolute top-3 right-3 bg-white pl-2">
                                                                                <button
                                                                                    onClick={() => startEditing(note)}
                                                                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-violet-600 transition-colors"
                                                                                    title="Edit note"
                                                                                >
                                                                                    <Edit2 size={14} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteNote(note.id)}
                                                                                    className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                                                                                    title="Delete note"
                                                                                >
                                                                                    <X size={14} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center justify-between mt-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <User size={16} className="text-gray-400" />
                                                                            <span className="text-xs text-gray-500 font-medium">
                                                                                {note.created_by ? `${note.created_by.first_name} ${note.created_by.last_name}` : 'Unknown User'}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-xs text-gray-400">
                                                                            {new Date(note.created_at).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            !isAddingNote && (
                                                <div className="text-center py-10">
                                                    <div className="bg-gray-50 p-3 rounded-full inline-flex mb-3">
                                                        <StickyNote size={20} className="text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 text-sm">No notes added yet</p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Footer */}
                    {listing && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
                            {listing.state?.type === 'published' ? (
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => canEdit && window.open(`/listings/edit/${listing.id}`, '_blank')}
                                            disabled={!canEdit}
                                            className={`flex-1 px-4 py-2.5 border font-semibold rounded-lg transition-colors text-sm ${canEdit
                                                ? "bg-white border-violet-600 text-violet-600 hover:bg-violet-50"
                                                : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                                                }`}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleUnpublish}
                                            disabled={!canEdit}
                                            className={`flex-1 px-4 py-2.5 border font-semibold rounded-lg transition-colors text-sm ${canEdit
                                                ? "bg-white border-red-500 text-red-500 hover:bg-red-50"
                                                : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                                                }`}
                                        >
                                            Unpublish
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleBoost}
                                        className="w-full px-4 py-3 bg-[#3f3b97] text-white font-bold rounded-lg hover:bg-[#343180] transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        <Rocket size={18} />
                                        Boost
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => canEdit && window.open(`/listings/edit/${listing.id}`, '_blank')}
                                        disabled={!canEdit}
                                        title={!canEdit ? "You are not authorized to edit this listing" : "Edit Listing"}
                                        className={`w-full px-6 py-2.5 border font-bold rounded-lg transition-colors ${canEdit
                                            ? "bg-white border-violet-600 text-violet-600 hover:bg-violet-50"
                                            : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
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
