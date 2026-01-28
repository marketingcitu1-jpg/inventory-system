'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddItemDialog({ open, onOpenChange, onSuccess }: AddItemDialogProps) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [minLevel, setMinLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !minLevel.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from('items').insert({
        name: name.trim(),
        unit,
        min_stock_level: parseInt(minLevel),
        current_stock: 0,
        last_updated: new Date().toISOString(),
      });

      if (error) throw error;

      setName('');
      setUnit('pcs');
      setMinLevel('');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>Add a new item to your inventory</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Be a Technologian Billboard"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="pcs">pcs</option>
                <option value="box">box</option>
                <option value="pack">pack</option>
                <option value="unit">unit</option>
                <option value="set">set</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Stock Level *</label>
              <input
                type="number"
                value={minLevel}
                onChange={(e) => setMinLevel(e.target.value)}
                placeholder="e.g., 5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                min="0"
              />
            </div>
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
              {loading ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
