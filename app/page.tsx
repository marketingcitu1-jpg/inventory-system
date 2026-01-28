'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingDown } from 'lucide-react';
import { ItemsTable } from '@/components/inventory/items-table';
import { TransactionsTable } from '@/components/inventory/transactions-table';
import { AddItemDialog } from '@/components/inventory/add-item-dialog';
import { AddTransactionDialog } from '@/components/inventory/add-transaction-dialog';
import { StockAlerts } from '@/components/inventory/stock-alerts';
import { supabase } from '@/lib/supabase';

interface Item {
  id: string;
  name: string;
  current_stock: number;
  min_stock_level: number;
  unit: string;
  last_updated: string;
}

export default function InventoryDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchItems();
  }, [refreshTrigger]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.current_stock <= item.min_stock_level).length;
  const totalStock = items.reduce((sum, item) => sum + item.current_stock, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Inventory Management</h1>
            <p className="text-slate-600 mt-2">Track your stock levels and transactions in real-time</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddItemOpen(true)} variant="outline" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Item
            </Button>
            <Button onClick={() => setAddTransactionOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Log Transaction
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalItems}</div>
              <p className="text-xs text-slate-500 mt-1">In inventory</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Stock Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalStock}</div>
              <p className="text-xs text-slate-500 mt-1">Units in stock</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{lowStockItems}</div>
              <p className="text-xs text-slate-500 mt-1">Items below minimum</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems > 0 && (
          <StockAlerts items={items} />
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items Table */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-md">
              <CardHeader>
                <CardTitle>Current Stock Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <ItemsTable items={items} loading={loading} onRefresh={handleRefresh} />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="bg-white border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setAddItemOpen(true)} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Item
                </Button>
                <Button 
                  onClick={() => setAddTransactionOpen(true)} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Transaction
                </Button>
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  className="w-full bg-transparent"
                >
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transactions History */}
        <Card className="bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionsTable refreshTrigger={refreshTrigger} />
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddItemDialog open={addItemOpen} onOpenChange={setAddItemOpen} onSuccess={handleRefresh} />
        <AddTransactionDialog open={addTransactionOpen} onOpenChange={setAddTransactionOpen} onSuccess={handleRefresh} />
      </div>
    </div>
  );
}
