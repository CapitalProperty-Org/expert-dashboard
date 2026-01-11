
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import type { ListingState } from '../../../types';
import ErrorToast from '../../ui/ErrorToast';

interface AiChatAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    currentDescription: string;
    onAcceptContent: (content: { title: string; title_ar: string; description: string; description_ar: string }) => void;
    listingState: ListingState;
}

// Helper to extract dynamic keywords from state
const getSuggestedKeywords = (state: ListingState): string[] => {
    const keywords: string[] = [];

    if (state.propertyType) keywords.push(state.propertyType);
    if (state.furnishingType) keywords.push(state.furnishingType);
    if (state.bedrooms) keywords.push(`${state.bedrooms} Bedrooms`);

    // Add location
    if (state.propertyLocation?.label) {
        // Just take the first part of the location for brevity if it's long? 
        // Or full label. Let's use the full label but maybe truncate if needed.
        // For now, full label is fine.
        keywords.push(state.propertyLocation.label);
    }

    // Add first 3 amenities
    if (state.amenities && state.amenities.length > 0) {
        keywords.push(...state.amenities.slice(0, 4));
    }

    return Array.from(new Set(keywords)); // Remove duplicates
};

const AiChatAssistant = ({ isOpen, onClose, currentDescription, onAcceptContent, listingState }: AiChatAssistantProps) => {
    const { token } = useAuth();
    const suggestedKeywords = getSuggestedKeywords(listingState);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [customKeywords, setCustomKeywords] = useState<string[]>([]);
    const [customInput, setCustomInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const toggleKeyword = (keyword: string) => {
        setSelectedKeywords(prev =>
            prev.includes(keyword)
                ? prev.filter(k => k !== keyword)
                : [...prev, keyword]
        );
    };

    const addCustomKeyword = () => {
        if (customInput.trim() && !customKeywords.includes(customInput.trim())) {
            setCustomKeywords(prev => [...prev, customInput.trim()]);
            setCustomInput('');
        }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const propertyDetails = {
                ...listingState,
                keywords: [...selectedKeywords, ...customKeywords]
            };

            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/ai/rewrite-description`, {
                currentDescription,
                propertyDetails,
                tone: 'professional and inviting'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.generate_content) {
                onAcceptContent(response.data.generate_content);
            }
        } catch (error) {
            console.error('AI Error', error);
            setErrorMessage('Failed to generate description. Please try again.');
            setShowErrorToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4">
                    <h3 className="text-xl font-bold text-gray-900">Generate Description with AI</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 pt-0 space-y-6">
                    <p className="text-sm text-gray-500">
                        Select keywords to guide the AI in generating title and description.
                    </p>

                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Suggested keywords</h4>
                        <div className="flex flex-wrap gap-2">
                            {suggestedKeywords.map(kw => (
                                <button
                                    key={kw}
                                    onClick={() => toggleKeyword(kw)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedKeywords.includes(kw)
                                        ? 'bg-violet-50 border-violet-600 text-violet-700 shadow-sm'
                                        : 'bg-white border-violet-200 text-violet-600 hover:border-violet-400'
                                        }`}
                                >
                                    {kw}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Custom Keywords</h4>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Plus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomKeyword()}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Add custom keyword"
                                />
                            </div>
                            <button
                                onClick={addCustomKeyword}
                                disabled={!customInput.trim()}
                                className="px-6 py-2.5 bg-white border border-violet-200 text-violet-700 font-bold rounded-lg text-sm hover:bg-violet-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add
                            </button>
                        </div>
                        {customKeywords.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {customKeywords.map(kw => (
                                    <span key={kw} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                        {kw}
                                        <X
                                            size={12}
                                            className="cursor-pointer hover:text-red-500"
                                            onClick={() => setCustomKeywords(prev => prev.filter(k => k !== kw))}
                                        />
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-2 flex justify-end gap-3 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-violet-200 text-violet-700 font-bold rounded-lg text-sm hover:bg-violet-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-[#FF6154] hover:bg-[#E8584C] text-white font-bold rounded-lg text-sm transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Generating...
                            </>
                        ) : (
                            'Generate Description'
                        )}
                    </button>
                </div>
            </div>
            {showErrorToast && (
                <ErrorToast
                    show={showErrorToast}
                    message={errorMessage}
                    onClose={() => setShowErrorToast(false)}
                />
            )}
        </div>
    );
};

export default AiChatAssistant;
