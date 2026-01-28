'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

interface Item {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
}

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddTransactionDialog({ open, onOpenChange, onSuccess }: AddTransactionDialogProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState('');
  const [requestCode, setRequestCode] = useState('');
  const [responsible, setResponsible] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchItems();
    }
  }, [open]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from('items').select('id, name, current_stock, unit').order('name');
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem || !quantity || !responsible) {
      alert('Please fill in all required fields');
      return;
    }

    const item = items.find((i) => i.id === selectedItem);
    if (!item) return;

    try {
      setLoading(true);

      const newStock = type === 'IN' ? item.current_stock + parseInt(quantity) : item.current_stock - parseInt(quantity);

      if (newStock < 0) {
        alert('Cannot remove more items than available in stock');
        return;
      }

      // Add transaction
      const { error: transError } = await supabase.from('transactions').insert({
        item_id: selectedItem,
        item_name: item.name,
        quantity: parseInt(quantity),
        type,
        request_code: requestCode.trim(),
        remarks: remarks.trim(),
        responsible_person: responsible.trim(),
        created_at: new Date().toISOString(),
      });

      if (transError) throw transError;

      // Update item stock
      const { error: updateError } = await supabase
        .from('items')
        .update({
          current_stock: newStock,
          last_updated: new Date().toISOString(),
        })
        .eq('id', selectedItem);

      if (updateError) throw updateError;

      setSelectedItem('');
      setType('IN');
      setQuantity('');
      setRequestCode('');
      setResponsible('');
      setRemarks('');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const selectedItemData = items.find((i) => i.id === selectedItem);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Transaction</DialogTitle>
          <DialogDescription>Record an item movement (IN or OUT)</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item *</label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Select an item...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (Current: {item.current_stock} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'IN' | 'OUT')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Request Code</label>
            <input
              type="text"
              value={requestCode}
              onChange={(e) => setRequestCode(e.target.value)}
              placeholder="e.g., RFQ-2002CORE-25-004275"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Responsible Person *</label>
            <input
              type="text"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="e.g., Charyl"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks/Event</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Wellness Walk"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Recording...' : 'Record Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
