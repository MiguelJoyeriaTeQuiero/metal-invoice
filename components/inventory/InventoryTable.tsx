'use client';

import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import type { InventoryItem } from '@/types/inventory';
import { formatCurrency } from '@/lib/invoice-calculations';
import { cn } from '@/lib/utils';

function stockColor(stock: number): string {
  if (stock > 0) return 'text-green-700 bg-green-50';
  if (stock === 0) return 'text-yellow-700 bg-yellow-50';
  return 'text-red-700 bg-red-50';
}

export function InventoryTable() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inventory')
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); });
  }, []);

  const goldItems = items.filter((i) => i.metal === 'GOLD');
  const silverItems = items.filter((i) => i.metal === 'SILVER');

  const totalGoldValue = goldItems.reduce((sum, i) => sum + i.totalCostValue, 0);
  const totalSilverValue = silverItems.reduce((sum, i) => sum + i.totalCostValue, 0);
  const totalGoldStock = goldItems.reduce((sum, i) => sum + i.stock, 0);
  const totalSilverStock = silverItems.reduce((sum, i) => sum + i.stock, 0);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="h-5 bg-slate-100 rounded w-32 mb-4 animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const SummaryCard = ({ label, stock, value, color }: { label: string; stock: number; value: number; color: string }) => (
    <div className={cn('rounded-2xl border p-5', color)}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{stock.toFixed(4)} uds</p>
      <p className="text-sm mt-1 opacity-80">Valor stock: {formatCurrency(value)}</p>
    </div>
  );

  const MetalTable = ({ title, rows }: { title: string; rows: InventoryItem[] }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <Package className="w-4 h-4 text-slate-500" />
        <h2 className="font-semibold text-slate-800">{title}</h2>
        <span className="text-slate-400 text-sm font-normal">({rows.length} referencias)</span>
      </div>
      {rows.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-10">Sin datos de inventario</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-right font-medium">Peso (g)</th>
                <th className="px-4 py-3 text-right font-medium">Pureza</th>
                <th className="px-4 py-3 text-right font-medium">Comprado</th>
                <th className="px-4 py-3 text-right font-medium">Vendido</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3 text-right font-medium">Coste medio</th>
                <th className="px-4 py-3 text-right font-medium">Valor stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-700">
                    {item.itemType === 'INGOT' ? 'Lingote' : 'Moneda'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{item.weightGrams.toFixed(4)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{(item.purity * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right text-slate-600">{item.purchased.toFixed(4)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{item.sold.toFixed(4)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-semibold', stockColor(item.stock))}>
                      {item.stock.toFixed(4)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.avgCost)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">
                    {formatCurrency(item.totalCostValue)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={5} className="px-4 py-3 font-semibold text-slate-700 text-sm">Total</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800 text-sm">
                  {rows.reduce((s, r) => s + r.stock, 0).toFixed(4)}
                </td>
                <td />
                <td className="px-4 py-3 text-right font-bold text-slate-900 text-sm">
                  {formatCurrency(rows.reduce((s, r) => s + r.totalCostValue, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard
          label="Stock Oro"
          stock={totalGoldStock}
          value={totalGoldValue}
          color="border-yellow-200 bg-yellow-50 text-yellow-900"
        />
        <SummaryCard
          label="Stock Plata"
          stock={totalSilverStock}
          value={totalSilverValue}
          color="border-slate-200 bg-slate-50 text-slate-900"
        />
      </div>
      <MetalTable title="Oro" rows={goldItems} />
      <MetalTable title="Plata" rows={silverItems} />
    </div>
  );
}
