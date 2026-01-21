import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy } from 'lucide-react';
import QualityScoreCircle from '../ui/QualityScoreCircle';
import ActionMenu from '../ui/ActionMenu';
import type { Listing } from '../../context/ListingsContext';
import SuccessToast from '../ui/SuccessToast';
import { formatRelativeTime } from '../../utils/formatDate';

const tableHeaders = [
    "Listing Reference",
    "Category",
    "Offering",
    "Property Type",
    "Bedrooms",
    "Area",
    "Location",
    "Quality score",
    "Agent",
    "Credits Spent",
    "Price",
    "Price Realism",
    "Status",
    "Last updated",
    "Exposure",
    "Expiry",
    "Leads received",
    "Impressions",
    "Listing Clicks",
    "CTR",
    "Lead Clicks",
    "Action"
];

const draftHeaders = [
    "Listing Reference",
    "Category",
    "Offering",
    "Property Type",
    "Bedrooms",
    "Area",
    "Location",
    "Quality score",
    "Agent",
    "Credits Spent",
    "Price",
    "Price Realism",
    "Status",
    "Last updated",
    "Action"
];

interface ListingsTableProps {
    listings: Listing[];
    isSelectionMode: boolean;
    selectedIds: Set<string>;
    onSelectionChange: (id: string, isSelected: boolean) => void;
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onActionComplete: () => void;
    onReferenceClick?: (id: string) => void;
    isPublished?: boolean;
}

const ListingsTable = ({ listings, isSelectionMode, selectedIds, onSelectionChange, onSelectAll, onActionComplete, onReferenceClick, isPublished = false }: ListingsTableProps) => {
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [copyMessage, setCopyMessage] = useState('');

    const headers = isPublished ? tableHeaders : draftHeaders;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyMessage(`Reference ${text} copied to clipboard`);
            setShowSuccessToast(true);
        });
    };

    return (
        <div className="w-full bg-white border border-gray-200/80 rounded-lg">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative">
                <table className="min-w-full w-full">
                    <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200/80">
                            {isSelectionMode && (
                                <th scope="col" className="w-12 px-4 py-3 sticky left-0 bg-gray-50 z-30 shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] border-r border-gray-200/50">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                        checked={selectedIds.size === listings.length && listings.length > 0}
                                        onChange={onSelectAll}
                                    />
                                </th>
                            )}
                            {headers.map((header, index) => (
                                <th
                                    key={header}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap ${index === 0 || header === "Listing Reference"
                                        ? `sticky z-20 bg-gray-50 shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] border-r border-gray-200/50`
                                        : header === 'Action'
                                            ? 'sticky right-0 z-20 bg-gray-50 shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.08)] border-l border-gray-200/50'
                                            : ''
                                        }`}
                                    style={index === 0 || header === "Listing Reference" ? { left: isSelectionMode ? '48px' : '0' } : {}}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {listings.map((listing) => (
                            <tr key={listing.id} className="group border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                {isSelectionMode && (
                                    <td className="px-4 py-4 sticky left-0 bg-white group-hover:bg-gray-50 z-30 shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] border-r border-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                            checked={selectedIds.has(listing.id)}
                                            onChange={(e) => onSelectionChange(listing.id, e.target.checked)}
                                        />
                                    </td>
                                )}
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 ${true // Always first column (Reference)
                                    ? `sticky z-20 bg-white group-hover:bg-gray-50 shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] border-r border-gray-100 transition-colors`
                                    : ''
                                    }`}
                                    style={{ left: isSelectionMode ? '48px' : '0' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleCopy(listing.reference)}
                                            className="p-1 hover:bg-violet-50 rounded text-violet-600 transition-colors"
                                            title="Copy Reference"
                                        >
                                            <Copy size={14} />
                                        </button>
                                        <button
                                            onClick={() => onReferenceClick?.(listing.id)}
                                            className="text-violet-600 hover:text-violet-700 hover:underline font-medium"
                                        >
                                            {listing.reference}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{listing.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{listing.price.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{listing.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.bedrooms || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.size ? `${listing.size} sqft` : '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{listing.location?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><QualityScoreCircle qualityScore={listing.quality_score} score={listing.quality_score?.value || 0} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {listing.assigned_to?.name || 'Unassigned'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {listing.credits_spent !== undefined ? listing.credits_spent : '0'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                    {listing.price?.amounts?.[listing.price.type]
                                        ? `${listing.price.amounts[listing.price.type].toLocaleString()} AED`
                                        : listing.price?.amounts && Object.values(listing.price.amounts)[0]
                                            ? `${Object.values(listing.price.amounts)[0].toLocaleString()} AED`
                                            : 'POA'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 font-medium">
                                        {listing.price_realism || 'Good'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center"><span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 capitalize">{listing.state.type}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatRelativeTime(listing.updated_at || listing.created_at || '')}</td>
                                {isPublished && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.exposure || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.expiry_date ? formatRelativeTime(listing.expiry_date) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.leads_received || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.impressions || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.clicks || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.ctr ? `${listing.ctr}%` : '0%'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.lead_clicks || 0}</td>
                                    </>
                                )}

                                <td className="px-6 py-4 whitespace-nowrap text-center sticky right-0 z-20 bg-white shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.08)] border-l border-gray-100 group-hover:bg-gray-50 transition-colors">
                                    <ActionMenu
                                        listingId={listing.id}
                                        onActionComplete={onActionComplete}
                                        listingData={listing}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showSuccessToast && (
                <SuccessToast
                    show={showSuccessToast}
                    message={copyMessage}
                    onClose={() => setShowSuccessToast(false)}
                />
            )}
        </div>
    );
};

export default ListingsTable;