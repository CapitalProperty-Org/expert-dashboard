import { User, ArrowUp } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatDate';
import type { Lead } from '../../context/LeadsContext';
import { Link } from 'react-router-dom';

interface LeadsTableProps {
    leads: Lead[];
}

const tableHeaders = ["Lead Details", "Created", "Assigned to", "Type", "Status", ""];

const LeadsTable = ({ leads }: LeadsTableProps) => {
  return (
    <div className="w-full bg-white border border-gray-200/80 rounded-lg overflow-x-auto scrollbar-thin">
      <table className="min-w-full w-full">
        <thead className="bg-gray-50/50">
          <tr className="border-b">
            {tableHeaders.map((header, index) => (
              <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <div className="flex items-center gap-1">{header}{index === 1 && <ArrowUp size={14} />}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50/50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><User size={16} /></div>
                  <div>
                    <p className="text-sm font-semibold">{lead.fullName}</p>
                    <p className="text-sm text-gray-500">{lead.mobile}</p>
                    <p className="text-sm text-gray-500">{lead.email}</p>
                    <p className="text-xs text-gray-400 mt-1">ID: {lead.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <p>{new Date(lead.createdAt).toLocaleString()}</p>
                <p className="text-xs text-gray-400">{formatRelativeTime(lead.createdAt)}</p>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.agent?.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 border rounded capitalize">{lead.type}</span>
                <p className="mt-1 capitalize">Property type: {lead.propertyType.replace(/_/g, ' ')}</p>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 capitalize">{lead.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
<Link to={`/leads/${lead.id}`}>
              <button className="text-sm bg-white border border-violet-600 text-violet-600 font-semibold py-2 px-4 rounded-md hover:bg-violet-50">
                Lead Details
              </button>
            </Link>              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable;