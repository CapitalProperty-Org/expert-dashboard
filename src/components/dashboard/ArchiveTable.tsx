import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy } from 'lucide-react';
import QualityScoreCircle from '../ui/QualityScoreCircle';
import type { Listing } from '../../context/ListingsContext';
import ArchiveTableActionMenu from '../ui/ArchiveTableActionMenu';
import SuccessToast from '../ui/SuccessToast';
import { formatLastUpdated } from '../../utils/formatDate';

const tableHeaders = [
    "Listing Reference",
    "Category",
    "Offering",
    "Property Type",
    "Bedrooms",
    "Area",
    "Location",
    "Exposure",
    "Expiry",
    "Leads received",
    "Impressions",
    "Listing Clicks",
    "CTR",
    "Lead Clicks",
    "Quality score",
    "Agent",
    "Credits Spent",
    "Price",
    "Price Realism",
    "Status",
    "Last updated",
    "Action"
];

interface ArchiveTableProps {
    listings: Listing[];
    onActionComplete: () => void;
    onReferenceClick?: (id: string) => void;
}

const ArchiveTable = ({ listings, onActionComplete, onReferenceClick }: ArchiveTableProps) => {
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [copyMessage, setCopyMessage] = useState('');

    const handleCopy = (text?: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopyMessage(`Reference ${text} copied to clipboard`);
            setShowSuccessToast(true);
        });
    };

    return (
        // ## هذا هو التصحيح الكامل والنهائي ##

        // 1. الحاوية الخارجية: مسؤولة فقط عن الشكل (الحدود والزوايا). لا يوجد بها overflow.
        <div className="w-full bg-white border border-gray-200/80 rounded-lg">
            {/* 2. الحاوية الداخلية: هي المسؤولة عن التمرير الأفقي. */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="min-w-full w-full">
                    <thead className="bg-gray-50/50">
                        <tr className="border-b border-gray-200/80">
                            {tableHeaders.map((header, index) => (
                                <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap ${index === 0
                                    ? 'sticky left-0 z-20 bg-gray-50 shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] border-r border-gray-200/50'
                                    : header === 'Action'
                                        ? 'sticky right-0 z-20 bg-gray-50 shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.08)] border-l border-gray-200/50'
                                        : ''
                                    }`}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {listings?.map((listing) => (
                            <tr key={listing.id} className="border-b last:border-b-0 hover:bg-gray-50/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 sticky left-0 z-20 bg-white shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] border-r border-gray-100">
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${listing.exposure === 'Premium' ? 'bg-orange-100 text-orange-700' :
                                        listing.exposure === 'Featured' ? 'bg-violet-100 text-violet-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {listing.exposure || 'Standard'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {listing.expiry_date && listing.expiry_date !== 'N/A'
                                        ? new Date(listing.expiry_date).toLocaleDateString()
                                        : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{listing.leads_received || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{listing.impressions || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{listing.clicks || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{listing.ctr ? `${listing.ctr}%` : '0%'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{listing.lead_clicks || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <QualityScoreCircle qualityScore={listing.quality_score} score={listing.quality_score?.value || 0} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {listing.assigned_to?.name || 'Unassigned'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {listing.credits_spent || 10}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                    {listing.price?.amounts?.[listing.price.type] ? `${listing.price.amounts[listing.price.type].toLocaleString()} AED` : 'POA'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 font-medium">
                                        {listing.price_realism || 'Good'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 capitalize">
                                        {listing.state.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {/* format last updated time*/}
                                    {formatLastUpdated(listing.updated_at)}
                                </td>
                                {/* 3. إضافة `relative` هنا أمر حاسم لجعل القائمة المنسدلة تظهر بالنسبة لهذه الخلية */}
                                <td className="px-6 py-4 whitespace-nowrap text-center sticky right-0 z-20 bg-white shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.08)] border-l border-gray-100">
                                    <ArchiveTableActionMenu listingId={listing.id} onActionComplete={onActionComplete} reference={listing.reference} />
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

export default ArchiveTable;