
import React, { useEffect } from "react";
import { Search } from "lucide-react";
import { useAgentInsights } from "../../context/AgentInsightsContext";
import QualityScoreProgressCircle from "../dashboard/QualityScoreCircle";

const AgentInsightsTable = () => {
    const { agentsData, loading, error, fetchAgentStats } = useAgentInsights();

    // Fetch data on mount
    useEffect(() => {
        fetchAgentStats({});
    }, [fetchAgentStats]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading agent insights...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/30">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        SuperAgent Report
                        <span className="text-xs font-normal text-indigo-600 cursor-pointer hover:underline">
                            Learn more about SuperAgent 2.0 criteria
                        </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Data for the previous day</p>
                </div>
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                        <Search size={16} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Agent</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Verified</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Response Rate</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Listing Quality</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Live Properties</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Claim Transaction</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">SuperAgent Streak</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">WhatsApp Response Time</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Agent Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {agentsData.map((agent) => (
                            <tr key={agent.agent_id} className="hover:bg-gray-50 transition-colors">
                                {/* Agent Name & Avatar */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={agent.profile_url || "https://ui-avatars.com/api/?name=" + agent.agent_name}
                                            alt={agent.agent_name}
                                            className="w-10 h-10 rounded-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${agent.agent_name}`;
                                            }}
                                        />
                                        <div>
                                            <p className="font-semibold text-indigo-900 text-sm">{agent.agent_name}</p>
                                            <p className="text-xs text-gray-500">Criteria: ?/?</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Verified Status */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex flex-col items-center">
                                        {agent.verification ? (
                                            <span className="text-green-600 font-medium text-sm">✓ Yes</span>
                                        ) : (
                                            <span className="text-red-500 font-medium text-sm">✕ No</span>
                                        )}
                                        <span className="text-xs text-gray-500">{agent.verification ? "Verified" : "Not verified"}</span>
                                    </div>
                                </td>

                                {/* Response Rate */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <QualityScoreProgressCircle score={agent.responseRate} size={40} />
                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            +{agent.responseRatePoints} points
                                        </span>
                                    </div>
                                </td>

                                {/* Listing Quality */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <QualityScoreProgressCircle score={agent.listingQuality} size={40} />
                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            +{agent.listingQualityPoints} points
                                        </span>
                                    </div>
                                </td>

                                {/* Live Properties */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-medium text-gray-800">{agent.propertiesLiveCount}</span>
                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            +{agent.livePropertiesPoints} points
                                        </span>
                                    </div>
                                </td>

                                {/* Claim Transaction */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-medium text-gray-800">{agent.claimTransactions}</span>
                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            +{agent.claimTransactionPoints} points
                                        </span>
                                    </div>
                                </td>

                                {/* SuperAgent Streak */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span role="img" aria-label="streak" className="text-lg">🔥</span>
                                        <span className="text-sm font-medium text-gray-800">{agent.superAgentStreakWeeks} Weeks</span>
                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            +{agent.superAgentStreakPoints} points
                                        </span>
                                    </div>
                                </td>

                                {/* WhatsApp Response Time */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-medium text-gray-800">{agent.whatsappResponseTime}</span>
                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            +{agent.whatsappResponsePoints} points
                                        </span>
                                    </div>
                                </td>

                                {/* Agent Score */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-indigo-700 font-bold text-lg">{agent.agentScore}</span>
                                        <span className="text-xs text-gray-500">Total Points</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgentInsightsTable;
