import React, { useState, useEffect } from 'react';
import { MapPin, BedDouble, Bath, Ruler, Check, Monitor, User, Home, Camera, Scan } from 'lucide-react';
import type { ListingState } from '../../../types';
import { formatDistanceToNow } from 'date-fns';

const ListingPreview = ({ state, images = [], listingId, isFullPage = false }: { state: ListingState; images?: (File | { url: string; preview?: string; })[]; listingId?: string | number; isFullPage?: boolean }) => {

    const locationLabel = state.propertyLocation ? state.propertyLocation.label : 'Listing location';
    const agentLabel = state.assignedAgent ? state.assignedAgent.label : 'Agent Name';

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        const createdUrls: string[] = [];
        const previews = images.map(img => {
            if (img instanceof File) {
                const url = URL.createObjectURL(img);
                createdUrls.push(url);
                return url;
            }
            return img.preview || img.url;
        });

        setImagePreviews(previews);

        return () => {
            createdUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [images]);

    const formatPrice = (price: string) => {
        if (!price) return 'AED -';
        const num = parseInt(price.replace(/,/g, ''), 10);
        if (isNaN(num)) return 'AED -';
        return `AED ${new Intl.NumberFormat('en-US').format(num)}`;
    };

    const formatSize = (sizeStr: string) => {
        if (!sizeStr) return null;
        const sqft = parseInt(sizeStr.replace(/,/g, ''), 10);
        if (isNaN(sqft)) return null;
        const sqm = Math.round(sqft * 0.092903);
        return { sqft: new Intl.NumberFormat('en-US').format(sqft), sqm: new Intl.NumberFormat('en-US').format(sqm) };
    };

    const handleOpenPreview = () => {
        if (listingId) {
            window.open(`/listings/preview/${listingId}`, '_blank');
        } else {
            alert("Please save the listing first to see the full preview.");
        }
    };

    const sizeData = formatSize(state.size);

    // Unified Image Component using Grid Layout
    const ImageGallery = () => (
        <div className={`grid grid-cols-3 gap-2 mb-6 w-full overflow-hidden ${isFullPage ? 'h-[450px]' : 'aspect-[3/2]'}`}>
            <div className="col-span-2 relative bg-gray-100 rounded-lg overflow-hidden h-full">
                {imagePreviews[0] ? (
                    <img src={imagePreviews[0]} alt="Property Main" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">No images</div>
                )}
                {imagePreviews.length > 0 && (
                    <span className="absolute bottom-2 right-2 bg-white/90 text-gray-900 text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm z-10 backdrop-blur-sm">
                        <Camera size={12} /> {imagePreviews.length}
                    </span>
                )}
            </div>
            <div className="grid grid-rows-2 gap-2 col-span-1 h-full">
                <div className="bg-gray-100 rounded-lg overflow-hidden relative h-full group">
                    {imagePreviews[1] ? (
                        <img src={imagePreviews[1]} alt="Property Sub 1" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : <div className="w-full h-full bg-gray-50/50" />}
                </div>
                <div className="bg-gray-100 rounded-lg overflow-hidden relative h-full group">
                    {imagePreviews[2] ? (
                        <img src={imagePreviews[2]} alt="Property Sub 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : <div className="w-full h-full bg-gray-50/50" />}
                </div>
            </div>
        </div>
    );

    return (
        <div className={`bg-white p-4 rounded-lg border border-gray-200/80 shadow-sm ${isFullPage ? '' : 'h-full'}`}>
            {!isFullPage && (
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-gray-500 font-medium">Preview</span>
                    <div className="flex items-center gap-3">
                        {listingId && (
                            <button onClick={handleOpenPreview} className="text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 px-3 py-1.5 rounded-md transition-colors">
                                Open preview
                            </button>
                        )}
                        <div className="flex items-center bg-gray-100 rounded-md p-0.5">
                            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-sm shadow-sm">
                                <Monitor size={14} className="text-gray-700" />
                                <span className="text-[10px] font-medium text-gray-700">Desktop</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`${isFullPage ? '' : 'overflow-visible'}`}>
                {/* Images */}
                <ImageGallery />

                {/* Price and Title */}
                <div className={`${isFullPage ? 'mb-6' : 'mb-4'}`}>
                    <div className="flex justify-between items-end mb-1">
                        <h2 className={`font-bold text-gray-900 ${isFullPage ? 'text-3xl' : 'text-xl'}`}>
                            {formatPrice(state.price)} <span className={`font-normal text-gray-500 ${isFullPage ? 'text-xl' : 'text-sm'}`}>{state.offeringType === 'rent' ? `/${state.rentalPeriod || 'year'}` : ''}</span>
                        </h2>

                        {sizeData && (
                            <div className="flex flex-col items-end text-gray-600">
                                <Scan size={20} strokeWidth={1.5} className="mb-0.5 text-gray-400" />
                                <span className="text-xs font-medium">
                                    {sizeData.sqft} sqft / {sizeData.sqm} sqm
                                </span>
                            </div>
                        )}
                    </div>

                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">
                        {state.propertyType || 'APARTMENT'} FOR {state.offeringType === 'rent' ? 'RENT' : 'SALE'} IN {locationLabel.toUpperCase()}
                    </p>
                    <h1 className={`font-bold text-gray-800 leading-tight ${isFullPage ? 'text-2xl' : 'text-lg'}`}>
                        {state.title || 'Property Title'}
                    </h1>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <p className={`text-gray-600 leading-relaxed ${isFullPage ? 'text-base' : 'text-xs line-clamp-4'}`}>
                        {state.description || 'Property description will appear here...'}
                    </p>
                    {!isFullPage && <button className="text-violet-600 text-xs font-semibold mt-1 hover:underline">See full description</button>}
                </div>

                {/* Property Details */}
                <div className="mb-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Property details</h3>
                    <div className={`grid gap-y-4 text-sm ${isFullPage ? 'grid-cols-4 gap-x-12' : 'grid-cols-2 gap-x-4'}`}>
                        <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2 text-gray-500"><Home size={14} /> Property Type</span>
                            <span className="font-semibold pl-6">{state.propertyType || '-'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2 text-gray-500"><Ruler size={14} /> Property Size</span>
                            <span className="font-semibold pl-6">{state.size ? `${state.size} sqft` : '-'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2 text-gray-500"><BedDouble size={14} /> Bedrooms</span>
                            <span className="font-semibold pl-6">{state.bedrooms || '-'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2 text-gray-500"><Bath size={14} /> Bathrooms</span>
                            <span className="font-semibold pl-6">{state.bathrooms || '-'}</span>
                        </div>
                    </div>
                </div>

                {state.amenities.length > 0 && (
                    <div className="my-6 pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold mb-4">Amenities</h3>
                        <div className={`grid gap-x-4 gap-y-2 text-sm ${isFullPage ? 'grid-cols-3' : 'grid-cols-2'}`}>
                            {state.amenities.map(amenity => (
                                <div key={amenity} className="flex items-center gap-2">
                                    <Check size={16} className="text-green-500" />
                                    <span>{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="my-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Location</h3>
                    <div className={`relative bg-gray-200 rounded-lg overflow-hidden ${isFullPage ? 'h-[350px]' : 'h-40'}`}>
                        <iframe
                            className="absolute inset-0 w-full h-full filter opacity-75 grayscale-[20%]"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src={`https://maps.google.com/maps?q=${encodeURIComponent((state.propertyLocation ? locationLabel : '') + ', ' + (state.uae_emirate ? state.uae_emirate.replace('_', ' ') : 'UAE'))}&t=m&z=${state.propertyLocation ? 15 : 10}&output=embed&iwloc=near`}
                            title="Property Location"
                        ></iframe>
                        <div className="absolute inset-x-4 top-4 bg-white p-3 rounded-md shadow-md flex justify-between items-center z-10">
                            <div className="flex items-center gap-2 text-sm truncate">
                                <MapPin size={16} className="text-gray-500 flex-shrink-0" />
                                <span className="truncate">{locationLabel}</span>
                            </div>
                            <a
                                href={state.propertyLocation ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${locationLabel}, ${state.uae_emirate || 'UAE'}`)}` : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm font-semibold flex-shrink-0 ${state.propertyLocation ? 'text-violet-600 hover:text-violet-700' : 'text-gray-400 cursor-not-allowed'}`}
                            >
                                View on map →
                            </a>
                        </div>
                    </div>
                </div>

                <div className="my-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Provided by</h3>
                    <div className={`bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col ${isFullPage ? 'md:flex-row justify-between items-start md:items-center' : 'gap-4'} gap-6`}>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-gray-400">
                                <User size={32} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900">{agentLabel}</h4>
                                <p className="text-sm text-gray-500">No ratings</p>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 mb-1">Languages</span>
                            <span className="text-sm font-semibold text-gray-700">English, Arabic</span>
                        </div>

                        <div className={`flex flex-col ${isFullPage ? 'sm:flex-row w-full md:w-auto' : 'w-full'} items-center gap-3`}>
                            {isFullPage && (
                                <div className="hidden sm:block">
                                    {/* Placeholder for agency logo if available */}
                                </div>
                            )}
                            <button className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                See agency properties
                            </button>
                            <button className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-violet-600 hover:bg-violet-50 transition-colors border-violet-100">
                                See agent properties
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Regulatory information</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Reference</span>
                            <span className="font-medium text-gray-800">{state.reference || '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-500">Listed</span>
                            <span className="font-medium text-gray-800">
                                {state.updatedAt ? formatDistanceToNow(new Date(state.updatedAt), { addSuffix: true }) : 'Just now'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingPreview;