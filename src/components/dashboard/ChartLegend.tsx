import { Info } from 'lucide-react';
import { usePerformance } from '../../context/PerformanceContext';

interface ChartLegendProps {
  activeStatKey?: string;
}

const ChartLegend = ({ activeStatKey }: ChartLegendProps) => {
    const { stats } = usePerformance();
    
    if (!stats) {
        return (
            <div className="w-full lg:w-64 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                <div className="text-sm text-gray-500">No data available</div>
            </div>
        );
    }

    // الحصول على القيم حسب نوع الإحصائية المحددة
    const getValuesForStat = () => {
        if (!activeStatKey) return { standard: 0, premium: 0, featured: 0 };
        
        switch (activeStatKey) {
            case 'published_listings':
                return {
                    standard: stats.published_listings_standard || 0,
                    premium: stats.published_listings_premium || 0,
                    featured: stats.published_listings_featured || 0
                };
            case 'live_listings':
                return {
                    standard: stats.live_listings_standard || 0,
                    premium: stats.live_listings_premium || 0,
                    featured: stats.live_listings_featured || 0
                };
            case 'listings_impressions':
                return {
                    standard: stats.listings_impressions_standard || 0,
                    premium: stats.listings_impressions_premium || 0,
                    featured: stats.listings_impressions_featured || 0
                };
            case 'listings_clicks':
                return {
                    standard: stats.listings_clicks_standard || 0,
                    premium: stats.listings_clicks_premium || 0,
                    featured: stats.listings_clicks_featured || 0
                };
            case 'leads':
                return {
                    standard: stats.leads_standard || 0,
                    premium: stats.leads_premium || 0,
                    featured: stats.leads_featured || 0
                };
            case 'credits_spent':
                return {
                    standard: stats.credits_spent_standard || 0,
                    premium: stats.credits_spent_premium || 0,
                    featured: stats.credits_spent_featured || 0
                };
            default:
                return {
                    standard: stats.live_listings_standard || 0,
                    premium: stats.live_listings_premium || 0,
                    featured: stats.live_listings_featured || 0
                };
        }
    };

    const values = getValuesForStat();

    return (
        <div className="w-full lg:w-64 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
            <div className="flex justify-between items-center text-xs text-gray-600 mb-4">
                <span>{values.standard}</span>
                <span>{values.premium}</span>
                <span>{values.featured}</span>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-gray-500 rounded-sm mr-2"></span>
                    <span className="text-gray-700">Standard</span>
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-sm mr-2"></span>
                    <span className="text-gray-700">Premium</span>
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-sm mr-2"></span>
                    <span className="text-gray-700">Featured</span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
                <a href="#" className="flex items-center text-xs text-gray-600 hover:text-blue-600">
                    <span>What is this breakdown?</span>
                    <Info size={12} className="ml-1" />
                </a>
            </div>
        </div>
    );
};

export default ChartLegend;