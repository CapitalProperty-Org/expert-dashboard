import React, { useEffect, useState } from 'react';
import { MapPin, BedDouble, Bath, Ruler, Check, Monitor, Smartphone, User, FileText, Home } from 'lucide-react';
import type { ListingState } from '../../../types';

const ListingPreview = ({ state, images = [] }: { state: ListingState; images?: File[] }) => {
    
    const locationLabel = state.propertyLocation ? state.propertyLocation.label : 'Listing location';
    const agentLabel = state.assignedAgent ? state.assignedAgent.label : 'Agent Name';
    
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        const newImagePreviews = images.map(file => URL.createObjectURL(file));
        setImagePreviews(newImagePreviews);

        return () => {
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [images]);

    const formatPrice = (price: string) => {
        if (!price) return 'AED -';
        const num = parseInt(price.replace(/,/g, ''), 10);
        if (isNaN(num)) return 'AED -';
        return `AED ${new Intl.NumberFormat('en-US').format(num)}`;
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200/80 shadow-sm">
            <div className="flex justify-end items-center gap-2 mb-4">
                <span className="text-xs text-gray-500">Preview</span>
                <div className="flex items-center bg-gray-100 rounded-md p-0.5">
                    <button className="p-1.5 rounded-md bg-white shadow text-gray-800"><Monitor size={18} /></button>
                    <button className="p-1.5 rounded-md text-gray-500"><Smartphone size={18} /></button>
                </div>
            </div>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin pr-2">
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {imagePreviews.length > 0 ? (
                        <>
                            <div className="col-span-2 row-span-2 h-64 bg-gray-100 rounded-lg overflow-hidden">
                                <img src={imagePreviews[0]} alt="cover" className="w-full h-full object-cover" />
                            </div>
                            {imagePreviews.length > 1 && (
                                <div className="col-span-1 h-[124px] bg-gray-100 rounded-lg overflow-hidden">
                                    <img src={imagePreviews[1]} alt="preview 1" className="w-full h-full object-cover" />
                                </div>
                            )}
                             {imagePreviews.length > 2 && (
                                <div className="col-span-1 h-[124px] bg-gray-100 rounded-lg overflow-hidden">
                                    <img src={imagePreviews[2]} alt="preview 2" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="col-span-2 row-span-2 h-64 bg-gray-100 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-300"><ImageIcon /></div>
                            <div className="col-span-1 h-[124px] bg-gray-100 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-300"><ImageIcon /></div>
                            <div className="col-span-1 h-[124px] bg-gray-100 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-300"><ImageIcon /></div>
                        </>
                    )}
                </div>
                
                <div className="flex justify-between items-start mb-2"><h2 className="text-2xl font-bold text-gray-900">{formatPrice(state.price)}</h2><div className="text-right text-xs text-gray-500"><Ruler size={14} className="inline-block mr-1"/>{state.size || '-'} sqft</div></div>
                <p className="text-xs text-gray-400 uppercase">{state.offeringType || 'TYPE OF LISTING'}</p>
                <h1 className="text-xl font-bold text-gray-800 my-1">{state.title || 'Listing title'}</h1>
                <p className="text-sm text-gray-600 font-normal mb-2">{state.description || '-'}</p>
                {state.description && <button className="text-sm text-violet-600 font-semibold hover:underline">See full description</button>}
                
                <div className="my-6 pt-6 border-t"><h3 className="text-lg font-bold mb-4">Property details</h3><div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm"><div className="flex items-center gap-2"><BedDouble size={16}/><strong>Bedrooms</strong><span className="text-gray-600 font-normal ml-auto">{state.bedrooms || '-'}</span></div><div className="flex items-center gap-2"><Ruler size={16}/><strong>Property Size</strong><span className="text-gray-600 font-normal ml-auto">{state.size ? `${state.size} sqft` : '-'}</span></div><div className="flex items-center gap-2"><Home size={16}/><strong>Property Type</strong><span className="text-gray-600 font-normal ml-auto">{state.propertyType || '-'}</span></div><div className="flex items-center gap-2"><Bath size={16}/><strong>Bathrooms</strong><span className="text-gray-600 font-normal ml-auto">{state.bathrooms || '-'}</span></div></div></div>
                
                {state.amenities.length > 0 && (<div className="my-6 pt-6 border-t"><h3 className="text-lg font-bold mb-4">Amenities</h3><div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">{state.amenities.map(amenity => (<div key={amenity} className="flex items-center gap-2"><Check size={16} className="text-green-500"/><span>{amenity}</span></div>))}</div></div>)}
                
                <div className="my-6 pt-6 border-t">
                    <h3 className="text-lg font-bold mb-4">Location</h3>
                    <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden">
                        <div className="absolute inset-x-4 top-4 bg-white p-3 rounded-md shadow-md flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm truncate">
                                <MapPin size={16} className="text-gray-500 flex-shrink-0"/>
                                <span className="truncate">{locationLabel}</span>
                                </div>
                            <a href="#" className="text-sm font-semibold text-violet-600 flex-shrink-0">View on map →</a>
                        </div>
                    </div>
                </div>

                <div className="my-6 pt-6 border-t">
                    <h3 className="text-lg font-bold mb-4">Provided by</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"><User size={24} className="text-gray-400"/></div>
                                <div>
                                <p className="font-bold">{agentLabel}</p>
                                <p className="text-xs text-gray-500">No ratings</p>
                                </div>
                            </div>
                            <div className="text-right"><p className="text-xs text-gray-500">Languages</p><p className="font-medium">Language</p></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3"><div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center"><FileText size={24} className="text-gray-400"/></div><div><p className="text-xs text-gray-500">REAL ESTATE</p><a href="#" className="text-xs text-violet-600 underline">See all properties</a></div></div>
                            <button className="text-sm bg-white border font-semibold py-2 px-4 rounded-md">See agent properties</button>
                        </div>
                    </div>
                </div>

                <div className="my-6 pt-6 border-t">
                    <h3 className="text-lg font-bold mb-4">Regulatory information</h3>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Reference</span><span className="font-medium text-gray-800">{state.reference || '-'}</span></div>
                    <div className="flex justify-between text-sm mt-2"><span className="text-gray-500">Listed</span><span className="font-medium text-gray-800">Just now</span></div>
                </div>
            </div>
        </div>
    );
};

const ImageIcon = () => <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1a2 2 0 010-2.828l1-1a2 2 0 012.828 0l2 2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>;

export default ListingPreview;