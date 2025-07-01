import { format } from 'date-fns';
import type { Contract } from '../../context/ContractsContext';

const tableHeaders = ["Contract # / Product", "Contract Duration", "Contract Price", "Payment Mode", "Signed By", "Status", "Actions"];

interface ContractsTableProps {
    contracts: Contract[];
}

const ContractsTable = ({ contracts }: ContractsTableProps) => {
  return (
    <div className="w-full bg-white border border-gray-200/80 rounded-lg overflow-x-auto scrollbar-thin">
      <table className="min-w-full w-full">
        <thead className="bg-gray-50/50">
          <tr className="border-b border-gray-200/80">
            {tableHeaders.map((header) => (
              <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {contracts.map((contract) => (
            <tr key={contract.id} className="border-b last:border-b-0 hover:bg-gray-50/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-top">
                <div className="flex flex-col">
                  <span>{contract.id}</span>
                  {contract.products.map(product => (
                    <span key={product.name} className="font-bold text-gray-800">{product.name}</span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-top">
                {`${format(new Date(contract.start_date), 'dd MMM, yyyy')} - ${format(new Date(contract.end_date), 'dd MMM, yyyy')}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-top">
                <div className="flex flex-col gap-1 w-48">
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Gross Amount (AED)</span><span>{Number(contract.gross_amount).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Discount %</span><span>{contract.discount}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500 font-bold">Total Amount (AED)</span><span className="font-bold text-gray-800">{Number(contract.net_cost).toLocaleString()}</span></div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-top">{contract.payment_mode}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-top">{contract.signed_by}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center align-top">
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                  {contract.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium align-top">
                 <button className="bg-white border border-gray-300 text-gray-700 font-semibold py-1 px-4 rounded-md text-sm hover:bg-gray-100">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContractsTable;