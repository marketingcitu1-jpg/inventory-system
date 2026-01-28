'use client';

import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Item {
  id: string;
  name: string;
  current_stock: number;
  min_stock_level: number;
  unit: string;
}

interface StockAlertsProps {
  items: Item[];
}

export function StockAlerts({ items }: StockAlertsProps) {
  const lowStockItems = items.filter((item) => item.current_stock <= item.min_stock_level);

  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <Card className="bg-red-50 border border-red-200 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-900">
          <AlertTriangle className="w-5 h-5" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lowStockItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-100">
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-600">
                  Current: {item.current_stock} {item.unit} | Minimum: {item.min_stock_level} {item.unit}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">{item.current_stock}</p>
                <p className="text-xs text-red-600">Below minimum</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
