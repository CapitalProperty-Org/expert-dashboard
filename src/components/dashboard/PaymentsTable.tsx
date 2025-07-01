import { Download } from 'lucide-react';
import { format } from 'date-fns';
import type { Invoice } from '../../context/PaymentsContext';

const tableHeaders = ["Payment #", "Contract #", "Frequency", "Mode", "Due Date", "Status", "Amount (AED)", "Invoice", "Actions"];

interface PaymentsTableProps {
    invoices: Invoice[];
}

const PaymentsTable = ({ invoices }: PaymentsTableProps) => {
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
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b last:border-b-0 hover:bg-gray-50/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.sf_contract_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.payment_frequency}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md bg-white border border-[#5745a1] text-[#5745a1]">
                    {invoice.payment_method.includes('Card') ? 'Card' : invoice.payment_method}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{format(new Date(invoice.due_date), 'dd MMM, yyyy')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{invoice.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100"><Download size={18} /></button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsTable;