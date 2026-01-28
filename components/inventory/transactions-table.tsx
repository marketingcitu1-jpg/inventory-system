'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  type: 'IN' | 'OUT';
  request_code: string;
  remarks: string;
  responsible_person: string;
  created_at: string;
}

interface TransactionsTableProps {
  refreshTrigger: number;
}

export function TransactionsTable({ refreshTrigger }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return <div className="text-center py-8 text-slate-500">No transactions recorded yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Date</th>
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Item Name</th>
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Type</th>
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Quantity</th>
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Request Code</th>
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Responsible Person</th>
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="py-4 px-4 text-slate-600 text-xs">
                {new Date(transaction.created_at).toLocaleDateString()}
              </td>
              <td className="py-4 px-4 font-medium text-slate-900">{transaction.item_name}</td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  {transaction.type === 'IN' ? (
                    <>
                      <ArrowUp className="w-4 h-4 text-green-600" />
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">IN</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-4 h-4 text-red-600" />
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">OUT</span>
                    </>
                  )}
                </div>
              </td>
              <td className="py-4 px-4 font-semibold text-slate-900">{transaction.quantity}</td>
              <td className="py-4 px-4 text-slate-600 font-mono text-xs">{transaction.request_code}</td>
              <td className="py-4 px-4 text-slate-600">{transaction.responsible_person}</td>
              <td className="py-4 px-4 text-slate-600 text-xs">{transaction.remarks || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
