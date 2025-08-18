import React from 'react';
import { Link } from 'react-router-dom';
import QualityScoreCircle from '../ui/QualityScoreCircle';
import ActionMenu from '../ui/ActionMenu';
import type { Listing } from '../../context/ListingsContext';

const tableHeaders = ["Listing Reference", "Category", "Offering", "Property Type", "Bedrooms", "Area", "Location", "Quality Score", "Price", "Status", "Last Updated", "Action"];

interface ListingsTableProps {
    listings: Listing[];
    isSelectionMode: boolean;
    selectedIds: Set<string>;
    onSelectionChange: (id: string, isSelected: boolean) => void;
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onActionComplete: () => void; 
}

const ListingsTable = ({ listings, isSelectionMode, selectedIds, onSelectionChange, onSelectAll, onActionComplete }: ListingsTableProps) => {
    
    return (

        <div className="w-full bg-white border border-gray-200/80 rounded-lg">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="min-w-full w-full">
                    <thead className="bg-gray-50/50">
                        <tr className="border-b border-gray-200/80">
                            {isSelectionMode && (
                                <th scope="col" className="w-12 px-4 py-3 sticky left-0 bg-gray-50/50 z-10">
                                    <input 
                                        type="checkbox" 
                                        className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                        checked={selectedIds.size === listings.length && listings.length > 0}
                                        onChange={onSelectAll}
                                    />
                                </th>
                            )}
                            {tableHeaders.map((header) => (
                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {listings.map((listing) => (
                            <tr key={listing.id} className="border-b last:border-b-0 hover:bg-gray-50/50">
                                {isSelectionMode && (
                                    <td className="px-4 py-4 sticky left-0 bg-white hover:bg-gray-50/50 z-10">
                                        <input 
                                            type="checkbox" 
                                            className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" 
                                            checked={selectedIds.has(listing.id)}
                                            onChange={(e) => onSelectionChange(listing.id, e.target.checked)}
                                        />
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    <Link to={`/listings/${listing.id}`} className="hover:text-violet-700 hover:underline">{listing.reference}</Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{listing.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{listing.price.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{listing.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.bedrooms || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.size ? `${listing.size} sqft` : '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{listing.location?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><QualityScoreCircle score={listing.quality_score?.value || 0} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {listing.price?.amounts?.[listing.price.type] 
                        ? `${listing.price.amounts[listing.price.type].toLocaleString()} AED`
                        : listing.price?.amounts && Object.values(listing.price.amounts)[0]
                        ? `${Object.values(listing.price.amounts)[0].toLocaleString()} AED`
                        : 'POA'}
                    </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center"><span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 capitalize">{listing.state.type}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(listing.updated_at).toLocaleDateString()}</td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-center relative">
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
        </div>
    );
};

export default ListingsTable;