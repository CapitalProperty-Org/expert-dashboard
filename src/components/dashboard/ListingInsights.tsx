import React, { useState } from 'react';
import {
    CheckCircle2,
    MinusCircle,
    Lightbulb,
    ChevronDown,
    ChevronUp,
    Gauge,
    Pencil,
    Image as ImageIcon,
    MapPin,
    Type
} from 'lucide-react';
import type { IQualityScore, IQualityScoreDetail } from '../../context/ListingsContext';

interface ListingInsightsProps {
    qualityScore?: IQualityScore;
}

const ListingInsights: React.FC<ListingInsightsProps> = ({ qualityScore }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (!qualityScore || !qualityScore.details) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <Gauge size={48} className="mb-4 text-gray-300" />
                <p>No quality score insights available for this listing.</p>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score < 50) return 'text-red-500 bg-red-50';
        if (score < 80) return 'text-orange-500 bg-orange-50';
        return 'text-green-600 bg-green-50';
    };

    const getIconForSection = (key: string) => {
        switch (key) {
            case 'description': return <Pencil size={18} className="text-gray-400" />;
            case 'images': // standardizing key handling
            case 'image':
            case 'image_diversity':
            case 'image_duplicates':
            case 'images_dimensions':
                return <ImageIcon size={18} className="text-gray-400" />;
            case 'location': return <MapPin size={18} className="text-gray-400" />;
            case 'title': return <Type size={18} className="text-gray-400" />;
            default: return <Pencil size={18} className="text-gray-400" />; // Fallback
        }
    };

    const sectionLabels: Record<string, string> = {
        description: 'Description',
        image: 'Images',
        image_diversity: 'Image Diversity',
        image_duplicates: 'Image Duplicates',
        images_dimensions: 'Images Dimensions',
        location: 'Location',
        title: 'Title',
        verified: 'Listing verification'
    };

    const renderInsightRow = (key: string, detail: IQualityScoreDetail) => {
        const label = sectionLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const isPerfect = detail.value === detail.weight;
        const scoreTextColor = isPerfect ? 'text-green-500' : 'text-red-500';

        return (
            <div key={key} className="py-3 first:pt-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        {getIconForSection(key)}
                        <span className="font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-sm">
                        <span className={scoreTextColor}>{detail.value}</span>
                        <span className="text-gray-400">/{detail.weight}</span>
                    </div>
                </div>

                {/* Show tip ONLY if not perfect score (value < weight) AND (help text exists OR it's title) */}
                {!isPerfect && (detail.help || key === 'title') && (
                    <div className="mt-1.5 bg-gray-50 rounded-lg p-3 flex items-start gap-3">
                        <Lightbulb size={16} className="text-gray-800 mt-0.5 flex-shrink-0" fill="black" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-700 leading-relaxed">
                                <span className="font-bold">Tip: </span>
                                {key === 'title' ? 'Title too short: 30 - 50 characters recommended' : detail.help}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Priority order based on the screenshot, EXCLUDING 'verified' as requested
    const priorityOrder = [
        'description',
        'image',
        'image_diversity',
        'image_duplicates',
        'images_dimensions',
        'location',
        'title'
    ];

    const detailKeys = Object.keys(qualityScore.details);
    // Filter out keys not in our desired list if we strictly want to match "titles as popup which not contain verified"
    // The user said "use same content titles as popup witch not contain verified".
    // This implies we should ONLY show the keys that were in the popup (minus verified).
    // The popup generally showed title, location, description, images + sub-image factors.
    // So we should filter out 'verified' specifically.
    const filteredKeys = detailKeys.filter(key => key !== 'verified');

    const sortedKeys = filteredKeys.sort((a, b) => {
        const idxA = priorityOrder.indexOf(a);
        const idxB = priorityOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    return (
        <div className="bg-white rounded-lg border shadow-sm transition-all duration-300">
            {/* Header - Collapsible Trigger */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="font-bold text-gray-900">Quality score</h3>
                <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded-md flex items-center gap-1.5 text-sm ${getScoreColor(qualityScore.value)}`}>
                        <Gauge size={16} />
                        <span className="font-bold">{qualityScore.value}/100 pt</span>
                    </div>
                    {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
            </div>

            {/* Content */}
            {isOpen && (
                <div className="px-4 pb-4 space-y-2">
                    {sortedKeys.map(key => renderInsightRow(key, qualityScore.details[key]))}
                </div>
            )}
        </div>
    );
};

export default ListingInsights;
