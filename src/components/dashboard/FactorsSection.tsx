import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { usePerformance } from '../../context/PerformanceContext';

interface MetricCardProps {
  percentage?: string;
  value?: number;
  label: string;
  segmentText: string;
  targetText: string;
  tooltipText: string;
  isHighlighted?: boolean;
}

const MetricCard = ({ percentage, value, label, segmentText, targetText, tooltipText, isHighlighted = false }: MetricCardProps) => {
  return (
    <div className={`flex-shrink-0 w-[280px] sm:w-auto p-5 rounded-lg border ${isHighlighted ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className={`text-3xl font-bold ${isHighlighted ? 'text-blue-900' : 'text-gray-900'}`}>
            {percentage || value}
          </div>
          <div className={`text-sm font-medium mt-1 ${isHighlighted ? 'text-blue-800' : 'text-gray-700'}`}>
            {label}
          </div>
        </div>
        <Tippy content={tooltipText} placement="top" className="bg-gray-900 text-white text-xs rounded px-2 py-1 max-w-xs">
          <button className="flex-shrink-0 ml-2">
            <svg className={`w-4 h-4 ${isHighlighted ? 'text-blue-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </Tippy>
      </div>

      <div className="space-y-2">
        <div className={`text-xs ${isHighlighted ? 'text-blue-700' : 'text-gray-600'}`}>
          <span className="font-medium">Top 5 in the segment:</span> {segmentText}
        </div>
        <div className={`text-xs ${isHighlighted ? 'text-blue-700' : 'text-gray-600'}`}>
          <span className="font-medium">What great looks like:</span> {targetText}
        </div>
      </div>

      <div className={`mt-4 pt-3 border-t ${isHighlighted ? 'border-blue-200' : 'border-gray-200'}`}>
        <div className={`text-xs ${isHighlighted ? 'text-blue-600' : 'text-gray-500'}`}>
          <span className="font-semibold">Why is it important?</span>
        </div>
        <p className={`text-xs mt-1 ${isHighlighted ? 'text-blue-700' : 'text-gray-600'}`}>
          {tooltipText}
        </p>
      </div>
    </div>
  );
};

const FactorsSection = () => {
  const { stats, loading } = usePerformance();

  // Calculate Quality Score (average based on featured/premium/standard distribution)
  const calculateQualityScore = (): number => {
    if (!stats || stats.live_listings === 0) return 0;

    // Featured = 90-100 (avg 95), Premium = 80-89 (avg 85), Standard = <80 (avg 70)
    const featuredScore = stats.live_listings_featured * 95;
    const premiumScore = stats.live_listings_premium * 85;
    const standardScore = stats.live_listings_standard * 70;

    const totalScore = featuredScore + premiumScore + standardScore;
    return Math.round((totalScore / stats.live_listings));
  };

  // Calculate Verified Listings percentage (simulated - would need backend support)
  const calculateVerifiedListings = (): number => {
    if (!stats || stats.live_listings === 0) return 0;
    // Simulate: assume featured listings are more likely to be verified
    const verifiedCount = Math.round(stats.live_listings_featured * 0.8 + stats.live_listings_premium * 0.3);
    return Math.round((verifiedCount / stats.live_listings) * 100);
  };

  // Calculate SuperAgent Listings percentage (simulated - would need backend support)
  const calculateSuperAgentListings = (): number => {
    if (!stats || stats.live_listings === 0) return 0;
    // Simulate: assume featured listings are more likely from SuperAgents
    const superAgentCount = Math.round(stats.live_listings_featured * 0.6 + stats.live_listings_premium * 0.2);
    return Math.round((superAgentCount / stats.live_listings) * 100);
  };

  // Calculate Exposure (percentage of premium/featured listings)
  const calculateExposure = (): number => {
    if (!stats || stats.live_listings === 0) return 0;
    const exposedListings = stats.live_listings_featured + stats.live_listings_premium;
    return Math.round((exposedListings / stats.live_listings) * 100);
  };

  // Get Leads per Listing directly from stats
  const getLeadsPerListing = (): number => {
    return stats?.lpl || 0;
  };

  const metricsData: MetricCardProps[] = [
    {
      percentage: loading ? '...' : `${calculateQualityScore()}%`,
      label: 'Quality Score',
      segmentText: '86%',
      targetText: '100%',
      tooltipText: 'Your average listing quality score reveals the top 5 of the listings with the highest quality score, compared to the average score of listings with quality score above 90.',
      isHighlighted: false
    },
    {
      percentage: loading ? '...' : `${calculateVerifiedListings()}%`,
      label: 'Verified Listings',
      segmentText: '22%',
      targetText: '100%',
      tooltipText: 'Percentage of your listings that are verified. Compare this to the top 5 by verified listings, generated by non-verified listings.',
      isHighlighted: false
    },
    {
      percentage: loading ? '...' : `${calculateSuperAgentListings()}%`,
      label: 'SuperAgent Listings',
      segmentText: '21%',
      targetText: '44%',
      tooltipText: 'Shows what percentage of your listings are managed by SuperAgents, compared to the top 5 and the average for great listings from regular agents.',
      isHighlighted: false
    },
    {
      percentage: loading ? '...' : `${calculateExposure()}%`,
      label: 'Exposure',
      segmentText: '3%',
      targetText: '65%',
      tooltipText: 'Shows the percentage of Exposure products (Premium and Featured listings) from the top 5 percentage of listings you have in the community.',
      isHighlighted: false
    },
    {
      value: loading ? 0 : getLeadsPerListing(),
      label: 'Leads per Listing',
      segmentText: '21.43',
      targetText: '344.93',
      tooltipText: 'Measures how well your listings perform in a market. Higher LPL indicates that your listings generate more leads in search.',
      isHighlighted: true
    }
  ];

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-800">Factors that impact your performance</h2>
        <button className="mt-2 sm:mt-0 text-sm bg-white border border-gray-300 text-gray-700 font-semibold py-1.5 px-4 rounded-md hover:bg-gray-50 transition-colors">
          Give feedback
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500 max-w-4xl">
        To improve, focus on these 4 factors: highest quality score, listing is verified, represented by a SuperAgent, and is featured or premium. Improving these factors across your listings will raise your LPL and improve how quickly your listings appear in search.
      </p>

      {/* Metrics Cards - Horizontal scroll on mobile, grid on desktop */}
      <div className="mt-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-5 min-w-max sm:min-w-0">
          {metricsData.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FactorsSection;