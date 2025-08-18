import {  MapPin, BedDouble, Ruler, Wallet, User, FileText, CalendarClock } from 'lucide-react';
import type { Listing } from '../../context/ListingsContext';
import { formatRelativeTime } from '../../utils/formatDate';
import ActionMenu from '../ui/ActionMenu';
import QualityScoreProgressCircle from './QualityScoreCircle';

interface PropertyCardProps {
    listing: Listing;
    onActionComplete: () => void;
}

const PlaceholderImage = () => (
    <svg className="w-full h-full text-gray-300" viewBox="0 0 100 100" fill="currentColor">
        <path d="M62.5 95V47.5L75 42.5V95H62.5Z" fill="#E5E7EB" />
        <path d="M52.5 95V35L75 25V95H52.5Z" fill="#D1D5DB" />
        <rect x="75" y="47.5" width="12.5" height="47.5" fill="#F3F4F6" />
        <rect x="87.5" y="57.5" width="12.5" height="37.5" fill="#F3F4F6" />
        <path d="M52.5 35L25 25V95H52.5V35Z" fill="#E5E7EB" />
        <rect x="12.5" y="57.5" width="12.5" height="37.5" fill="#F3F4F6" />
        <rect x="0" y="67.5" width="12.5" height="27.5" fill="#F3F4F6" />
    </svg>
);

const PropertyCard = ({ listing, onActionComplete }: PropertyCardProps) => {
    const priceValue = listing.price?.amounts?.[listing.price.type];
    const priceText = priceValue ? priceValue.toLocaleString() : 'POA';

    return (
        <div className="bg-white border border-gray-200/80 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
            <div className="relative h-40 bg-gray-200 flex items-center justify-center">
                <PlaceholderImage />
                <div className="absolute top-2 right-2">
                   <ActionMenu 
                       listingId={listing.id} 
                       onActionComplete={onActionComplete} 
                       listingData={listing}
                   />
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <p className="flex items-start text-sm text-gray-800 font-medium">
                    <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
                    <span className="line-clamp-2">{listing.location?.name || 'Unknown Location'}</span>
                </p>
                <div className="grid grid-cols-3 gap-x-2 gap-y-1 mt-3 text-sm text-gray-600">
                    <span className="flex items-center col-span-1"><BedDouble size={16} className="mr-1.5 text-gray-400" />{listing.bedrooms || '-'}</span>
                    <span className="flex items-center col-span-1"><Ruler size={16} className="mr-1.5 text-gray-400" />{listing.size ? `${listing.size} sqft` : '-'}</span>
                    <span className="flex items-center col-span-1"><Wallet size={16} className="mr-1.5 text-gray-400" />{priceText}</span>
                    <span className="col-span-1"></span>
                    <span className="col-span-1"></span>
                    <span className="col-span-1 capitalize">{priceText !== 'POA' && (listing.price?.type === 'rent' ? 'Yearly' : listing.price?.type)}</span>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                     <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                        <User size={18} />
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <p className="flex items-center text-sm text-gray-500 capitalize">
                            <CalendarClock size={14} className="mr-1.5" />
                            {listing.state?.type || 'Unknown'} • {formatRelativeTime(listing.updated_at)}
                        </p>
                        <p className="flex items-center text-xs text-gray-400 mt-0.5 truncate">
                            <FileText size={12} className="mr-1.5 flex-shrink-0" />
                            {listing.reference}
                        </p>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-200/80 px-4 py-3 flex items-center justify-center">
                 <QualityScoreProgressCircle score={listing.quality_score?.value || 0} />
            </div>
        </div>
    );
};

export default PropertyCard;