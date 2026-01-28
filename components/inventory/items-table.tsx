'use client';

import { AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  current_stock: number;
  min_stock_level: number;
  unit: string;
  last_updated: string;
}

interface ItemsTableProps {
  items: Item[];
  loading: boolean;
  onRefresh: () => void;
}

export function ItemsTable({ items, loading, onRefresh }: ItemsTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= minimum) return 'low';
    if (current <= minimum * 1.5) return 'warning';
    return 'healthy';
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        setDeleting(id);
        const { error } = await supabase.from('items').delete().eq('id', id);
        if (error) throw error;
        onRefresh();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading inventory...</div>;
  }

  if (items.length === 0) {
    return <div className="text-center py-8 text-slate-500">No items in inventory. Add one to get started.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Item Name</th>
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Current Stock</th>
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Min Level</th>
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Status</th>
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Last Updated</th>
            <th className="text-left font-semibold text-slate-700 py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const status = getStockStatus(item.current_stock, item.min_stock_level);
            const statusColor = {
              low: 'bg-red-50',
              warning: 'bg-yellow-50',
              healthy: 'bg-green-50',
            }[status];

            const statusBadge = {
              low: 'bg-red-100 text-red-800',
              warning: 'bg-yellow-100 text-yellow-800',
              healthy: 'bg-green-100 text-green-800',
            }[status];

            const statusLabel = {
              low: 'LOW STOCK',
              warning: 'WARNING',
              healthy: 'HEALTHY',
            }[status];

            return (
              <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${statusColor}`}>
                <td className="py-4 px-4 font-medium text-slate-900">{item.name}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-slate-900">{item.current_stock}</span>
                    <span className="text-xs text-slate-500">{item.unit}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-600">{item.min_stock_level} {item.unit}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {status === 'low' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge}`}>
                      {statusLabel}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-500 text-xs">
                  {new Date(item.last_updated).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
