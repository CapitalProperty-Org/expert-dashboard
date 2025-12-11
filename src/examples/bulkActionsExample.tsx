import React, { useState } from 'react';
import { useListings } from '../context/ListingsContext';
import ApproveModal from '../components/dashboard/ApproveModal';
import RejectModal from '../components/dashboard/RejectModal';
import ReassignModal from '../components/dashboard/ReassignModal';
import BulkActionBar from '../components/dashboard/BulkActionBar';

// Example component showing how to use the bulk actions system
const BulkActionsExample = () => {
    const { listings, fetchListings } = useListings();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isReassigning, setIsReassigning] = useState(false);

    // Example: Handle approve action
    const handleApprove = async (qualityScore?: any, notes?: string) => {
        setIsApproving(true);
        try {
            // Example payload for approval
            const payload: any = {};
            if (qualityScore !== undefined) {
                payload.quality_score = {
                    color: qualityScore >= 80 ? 'green' : qualityScore >= 60 ? 'orange' : 'red',
                    value: qualityScore,
                    details: {
                        title: { color: 'green', tag: 'Good', value: 10, weight: 10 },
                        description: { color: 'green', tag: 'Complete', value: 10, weight: 10 },
                        photos: { color: 'green', tag: 'Sufficient', value: 6, weight: 6 },
                        location: { color: 'green', tag: 'Verified', value: 19, weight: 19 }
                    }
                };
            }
            if (notes) {
                payload.approval_notes = notes;
            }

            // Process each selected listing
            for (const id of selectedIds) {
                try {
                    await fetch(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}/approve`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                } catch (error) {
                    console.error(`Failed to approve listing ${id}:`, error);
                }
            }

            // Refresh listings and close modal
            await fetchListings({ filters: {}, sort: null });
            setIsApproveModalOpen(false);
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Error during bulk approval:', error);
        } finally {
            setIsApproving(false);
        }
    };

    // Example: Handle reject action
    const handleReject = async (reason: string, notes?: string, requiredChanges?: string[]) => {
        setIsRejecting(true);
        try {
            const payload: any = {
                rejection_reason: reason
            };
            if (notes) {
                payload.rejection_notes = notes;
            }
            if (requiredChanges && requiredChanges.length > 0) {
                payload.required_changes = requiredChanges;
            }

            // Process each selected listing
            for (const id of selectedIds) {
                try {
                    await fetch(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}/reject`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                } catch (error) {
                    console.error(`Failed to reject listing ${id}:`, error);
                }
            }

            // Refresh listings and close modal
            await fetchListings({ filters: {}, sort: null });
            setIsRejectModalOpen(false);
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Error during bulk rejection:', error);
        } finally {
            setIsRejecting(false);
        }
    };

    // Example: Handle reassign action
    const handleReassign = async (agentId: string, reason?: string, notes?: string) => {
        setIsReassigning(true);
        try {
            const payload: any = {
                new_assigned_to: agentId
            };
            if (reason) {
                payload.reassignment_reason = reason;
            }
            if (notes) {
                payload.reassignment_notes = notes;
            }

            // Process each selected listing
            for (const id of selectedIds) {
                try {
                    await fetch(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}/reassign`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                } catch (error) {
                    console.error(`Failed to reassign listing ${id}:`, error);
                }
            }

            // Refresh listings and close modal
            await fetchListings({ filters: {}, sort: null });
            setIsReassignModalOpen(false);
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Error during bulk reassignment:', error);
        } finally {
            setIsReassigning(false);
        }
    };

    // Example: Handle selection change
    const handleSelectionChange = (id: string, isSelected: boolean) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };

    // Example: Handle select all
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(listings.map(l => l.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    // Example: Handle deselect all
    const handleDeselectAll = () => {
        setSelectedIds(new Set());
    };

    // Example: Handle publish action
    const handlePublish = async () => {
        try {
            for (const id of selectedIds) {
                await fetch(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}/publish`, {
                    method: 'POST'
                });
            }
            await fetchListings({ filters: {}, sort: null });
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Error during bulk publish:', error);
        }
    };

    // Example: Handle archive action
    const handleArchive = async () => {
        try {
            for (const id of selectedIds) {
                await fetch(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}/archive`, {
                    method: 'POST'
                });
            }
            await fetchListings({ filters: {}, sort: null });
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Error during bulk archive:', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Bulk Actions Example</h1>
            
            {/* Example listings table */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <input
                        type="checkbox"
                        checked={selectedIds.size === listings.length && listings.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">
                        {selectedIds.size} of {listings.length} selected
                    </span>
                </div>
                
                <div className="space-y-2">
                    {listings.slice(0, 5).map(listing => (
                        <div key={listing.id} className="flex items-center gap-4 p-3 border rounded-lg">
                            <input
                                type="checkbox"
                                checked={selectedIds.has(listing.id)}
                                onChange={(e) => handleSelectionChange(listing.id, e.target.checked)}
                                className="w-4 h-4"
                            />
                            <div className="flex-1">
                                <h3 className="font-medium">{listing.title?.en || listing.reference}</h3>
                                <p className="text-sm text-gray-600">{listing.location?.title_en}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                                listing.state?.stage === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                listing.state?.stage === 'live' ? 'bg-green-100 text-green-800' :
                                listing.state?.stage === 'archived' ? 'bg-gray-100 text-gray-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                                {listing.state?.stage}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <BulkActionBar
                    selectedCount={selectedIds.size}
                    isDraftMode={true}
                    onDeselectAll={handleDeselectAll}
                    onPublish={handlePublish}
                    onUnpublish={() => {}} // Handle unpublish if needed
                    onArchive={handleArchive}
                    onReject={() => setIsRejectModalOpen(true)}
                    onReassignClick={() => setIsReassignModalOpen(true)}
                    onApprove={() => setIsApproveModalOpen(true)}
                />
            )}

            {/* Modals */}
            <ApproveModal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                onApprove={handleApprove}
                selectedCount={selectedIds.size}
                isApproving={isApproving}
            />

            <RejectModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onReject={handleReject}
                selectedCount={selectedIds.size}
                isRejecting={isRejecting}
            />

            <ReassignModal
                isOpen={isReassignModalOpen}
                onClose={() => setIsReassignModalOpen(false)}
                onReassign={handleReassign}
                selectedCount={selectedIds.size}
                isReassigning={isReassigning}
            />

            {/* Usage Instructions */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">How to Use Bulk Actions</h2>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Select listings using the checkboxes above</li>
                    <li>Use the bulk action bar that appears at the bottom</li>
                    <li>Choose your action: Approve, Reject, Reassign, Publish, or Archive</li>
                    <li>Fill in the required information in the modal</li>
                    <li>Submit to perform the action on all selected listings</li>
                </ol>
                
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Available Actions:</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>✅ <strong>Approve:</strong> Mark listings as approved with optional quality score updates</li>
                        <li>❌ <strong>Reject:</strong> Reject listings with reasons and required changes</li>
                        <li>🔄 <strong>Reassign:</strong> Move listings to different agents</li>
                        <li>🌐 <strong>Publish:</strong> Make listings visible to users</li>
                        <li>📁 <strong>Archive:</strong> Move listings to archive</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BulkActionsExample;
