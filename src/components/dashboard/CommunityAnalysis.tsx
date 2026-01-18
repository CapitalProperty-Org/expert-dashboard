import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const SIDEBAR_DATA = {
    rankings: {
        listings: { percentage: "0.02%", rank: "162nd" },
        leads: { percentage: "0.6%", rank: "42nd" },
        lpl: { rank: "1st", isTop: true }
    },
    marketTrends: {
        listings: { value: "1.85K", change: "+10%" },
        leads: { value: "12.9K", change: "+15%" }
    },
    improvements: [
        {
            title: "Quality Score",
            status: "BELOW AVERAGE",
            description: "Listings with a quality score above 90 generate more leads than listings with quality score below 90.",
            isOpen: true
        },
        {
            title: "Verified Listings",
            status: "BELOW AVERAGE",
            description: "Increasing the number of Verified Listings will help you get more share of leads.",
            isOpen: false
        },
        {
            title: "SuperAgents' Listings",
            status: "BELOW AVERAGE",
            description: "Listings from SuperAgents generate more the leads than listings from regular agents.",
            isOpen: false
        },
        {
            title: "Exposure",
            status: "BELOW AVERAGE",
            description: "Premium/Featured listings generate higher exposure than Standard listings.",
            isOpen: false
        }
    ]
};

// --- Sub-Components ---

const RankCard = ({ label, value, subValue, rank, isTop = false }: { label: string, value: string | number, subValue?: string, rank: string, isTop?: boolean }) => (
    <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center text-center">
        <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">{label}</div>
        <div className="text-gray-900 font-bold text-lg leading-tight">
            {value} <span className="text-gray-500 font-normal text-sm">{subValue}</span>
        </div>
        <div className={`mt-2 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${isTop ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-gray-200 text-gray-700'}`}>
            {isTop && <span>🏆</span>} {rank} rank
        </div>
    </div>
);

const TrendCard = ({ label, value, change }: { label: string, value: string, change: string }) => (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center flex-1">
        <div className="text-gray-500 text-sm font-medium mb-1">{label}</div>
        <div className="text-gray-900 text-2xl font-bold mb-1">{value}</div>
        <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {change}
        </div>
    </div>
);

const ImprovementItem = ({ item }: { item: typeof SIDEBAR_DATA.improvements[0] }) => {
    const [isOpen, setIsOpen] = useState(item.isOpen);

    return (
        <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-gray-700 font-medium">{item.title}</span>
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        {item.status} <span className="text-xs">🔥</span>
                    </span>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {isOpen && (
                <div className="p-4 pt-0 bg-white text-sm text-gray-500 leading-relaxed border-t border-gray-100">
                    {item.description}
                </div>
            )}
        </div>
    );
};

interface CommunityStats {
    id: number;
    name: string;
    listings: number;
    leads: number;
    lpl: number;
    image?: string;
}

const CommunityAnalysis = () => {
    const [viewMode, setViewMode] = useState<'map' | 'table'>('table');
    const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
    const [communityData, setCommunityData] = useState<CommunityStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                // Fetch real data from the backend
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/overview/communities`);
                setCommunityData(response.data);
                if (response.data.length > 0) {
                    setSelectedCommunity(response.data[0].id); // Default select first
                }
            } catch (error) {
                console.error("Failed to fetch community data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, []);

    // Placeholder Map View
    const MapView = () => (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg h-[400px] text-gray-400 flex-col gap-2">
            <div className="text-4xl">🗺️</div>
            <p className="font-medium text-sm">Interactive Map Coming Soon</p>
        </div>
    );

    const selectedData = communityData.find(c => c.id === selectedCommunity);

    return (
        <div className="mt-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">Community & Market Analysis</h2>
                    <button className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">
                        Give feedback
                    </button>
                </div>
            </div>
            <p className="text-gray-600 text-sm mb-6">
                Explore your listing performance by community. Click on any community on the map to view detailed performance and market trends
            </p>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* LEFT COLUMN: Table/Map (65%) */}
                <div className="w-full lg:w-[65%] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                    {/* Toolbar */}
                    <div className="flex justify-end p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'map' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Map
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Table
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="overflow-x-auto min-h-[300px]">
                        {viewMode === 'map' ? (
                            <div className="p-4">
                                <MapView />
                            </div>
                        ) : loading ? (
                            <div className="flex items-center justify-center p-10 text-gray-400">Loading communities...</div>
                        ) : communityData.length === 0 ? (
                            <div className="flex items-center justify-center p-10 text-gray-400">No community data available.</div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Community</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Your Listings</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Your Leads</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">LPL</th>
                                        <th className="py-4 px-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {communityData.map((row) => (
                                        <tr
                                            key={row.id}
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedCommunity === row.id ? 'bg-indigo-50/30' : ''}`}
                                            onClick={() => setSelectedCommunity(row.id)}
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {/* Using a consistent image for now as DB doesn't have community images */}
                                                    <img src="https://images.unsplash.com/photo-1512453979798-5ea904ac6605?q=80&w=200&auto=format&fit=crop" alt={row.name} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                                                    <span className="font-semibold text-gray-900">{row.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-medium text-gray-900">{row.listings}</td>
                                            <td className="py-4 px-6 font-medium text-gray-900">{row.leads}</td>
                                            <td className="py-4 px-6 font-bold text-gray-900">{row.lpl}</td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">
                                                    View details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar Details (35%) */}
                {/* Always show if data exists (or if something is selected), no close button */}
                {selectedData && (
                    <div className="w-full lg:w-[35%] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-auto sticky top-20">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {selectedData.name}
                            </h3>
                            {/* Close Button REMOVED as per request */}
                        </div>

                        <div className="p-5 overflow-y-auto max-h-[800px] scrollbar-thin scrollbar-thumb-gray-200">

                            {/* Section 1: Where you rank */}
                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Where you rank?</h4>
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                    Rankings are based on number of listings and leads you receive compared to other players in the community. Aim for a higher rank to increase your visibility and improve performance.
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                    <RankCard
                                        label="Listings"
                                        value={selectedData.listings || 0}
                                        subValue={SIDEBAR_DATA.rankings.listings.percentage}
                                        rank={SIDEBAR_DATA.rankings.listings.rank}
                                    />
                                    <RankCard
                                        label="Leads"
                                        value={selectedData.leads || 0}
                                        subValue={SIDEBAR_DATA.rankings.leads.percentage}
                                        rank={SIDEBAR_DATA.rankings.leads.rank}
                                    />
                                    <RankCard
                                        label="LPL"
                                        value={selectedData.lpl || 0}
                                        rank={SIDEBAR_DATA.rankings.lpl.rank}
                                        isTop={SIDEBAR_DATA.rankings.lpl.isTop}
                                    />
                                </div>
                            </div>

                            {/* Section 2: Where market is going */}
                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Where market is going?</h4>
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                    This section shows the trends compared to the previous period based on the dates you have selected. For example, July vs June stats showing increase or decrease in these metrics.
                                </p>
                                <div className="flex gap-4 mb-4">
                                    <TrendCard label="Listings" value={SIDEBAR_DATA.marketTrends.listings.value} change={SIDEBAR_DATA.marketTrends.listings.change} />
                                    <TrendCard label="Leads" value={SIDEBAR_DATA.marketTrends.leads.value} change={SIDEBAR_DATA.marketTrends.leads.change} />
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-gray-700 leading-relaxed">
                                        <span className="font-bold block mb-1">Well done!</span>
                                        Leads delivered by PF grew (proving our platform's effectiveness). Well done, in this growing market, you were able improve your share of leads vs your competitors and also improved your return (LPL). <br /><br />
                                        Action: Continue doing more of the same - your lead generation efforts in this community are working.
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: How to improve */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3">How to Improve your performance</h4>
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                    We track ROI factors that impact your performance. Using indicators like 'above average,' 'average,' and 'below average,' we show where you stand compared to your competition.
                                </p>

                                <div>
                                    {SIDEBAR_DATA.improvements.map((item, idx) => (
                                        <ImprovementItem key={idx} item={item} />
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityAnalysis;