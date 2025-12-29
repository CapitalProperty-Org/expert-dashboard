import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy } from 'lucide-react';
import QualityScoreCircle from '../ui/QualityScoreCircle';
import type { Listing } from '../../context/ListingsContext';
import ArchiveTableActionMenu from '../ui/ArchiveTableActionMenu';
import SuccessToast from '../ui/SuccessToast';

const tableHeaders = ["Listing Reference", "Category", "Offering", "Property Type", "Bedrooms", "Area", "Location", "Quality Score", "Price", "Status", "Last Updated", "Action"];

interface ArchiveTableProps {
    listings: Listing[];
    onActionComplete: () => void;
}

const ArchiveTable = ({ listings, onActionComplete }: ArchiveTableProps) => {
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
                            {tableHeaders.map((header) => (
                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {listings?.map((listing) => (
                            <tr key={listing.id} className="border-b last:border-b-0 hover:bg-gray-50/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleCopy(listing.reference)}
                                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-violet-600 transition-colors"
                                            title="Copy Reference"
                                        >
                                            <Copy size={14} />
                                        </button>
                                        <Link to={`/listings/${listing.id}`} className="hover:text-violet-700 hover:underline">{listing.reference}</Link>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{listing.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{listing.price.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{listing.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.bedrooms || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.size ? `${listing.size} sqft` : '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{listing.location?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <QualityScoreCircle score={listing.quality_score?.value || 0} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                    {listing.price?.amounts?.[listing.price.type] ? `${listing.price.amounts[listing.price.type].toLocaleString()} AED` : 'POA'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 capitalize">
                                        {listing.state.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {new Date(listing.updated_at).toLocaleDateString()}
                                </td>
                                {/* 3. إضافة `relative` هنا أمر حاسم لجعل القائمة المنسدلة تظهر بالنسبة لهذه الخلية */}
                                <td className="px-6 py-4 whitespace-nowrap text-center relative">
                                    <ArchiveTableActionMenu listingId={listing.id} onActionComplete={onActionComplete} />
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