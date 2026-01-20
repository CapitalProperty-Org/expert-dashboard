import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, StickyNote, Edit2, Trash2 } from 'lucide-react';
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
                                        {/* Performance Metrics */}
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
                                    </div>
                                )}
                                {activeTab === 'insights' && (
                                    <ListingInsights qualityScore={listing.quality_score} />
                                )}
                                {activeTab === 'leads' && (
                                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                                            <User size={24} className="text-gray-400" />
                                        </div>
                                        <p>No leads found for this listing.</p>
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
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-end">
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
