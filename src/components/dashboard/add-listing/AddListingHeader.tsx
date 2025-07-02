import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';

interface AddListingHeaderProps { 
    qualityScore: number; 
    onPublish: () => void;
    isSubmitting: boolean;
}

const AddListingHeader = ({ qualityScore, onPublish, isSubmitting }: AddListingHeaderProps) => {
    const navigate = useNavigate();
    const canPublish = qualityScore >= 60;

    return (
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-30 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="bg-violet-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-violet-700">Exit</button>
            <div className="hidden lg:flex items-center gap-4">
                <button className="text-sm bg-violet-100 text-violet-700 font-semibold py-1.5 px-3 rounded-md">What's changed</button>
                <button className="text-sm bg-white border border-gray-300 text-gray-700 font-semibold py-1.5 px-3 rounded-md">Watch tutorial</button>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right lg:text-center">
                    <span className={cn("font-bold", qualityScore < 60 ? "text-red-500" : "text-green-500")}>{qualityScore}/100</span>
                    <p className="text-xs text-gray-500">Quality Score</p>
                </div>
                <button 
                    onClick={onPublish}
                    disabled={!canPublish || isSubmitting}
                    className={cn(
                        "font-semibold py-2 px-4 rounded-md text-sm",
                        canPublish 
                            ? "bg-red-600 text-white hover:bg-red-700" 
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                >
                    {isSubmitting ? 'Publishing...' : 'Publish'}
                </button>
            </div>
        </header>
    );
};
export default AddListingHeader;