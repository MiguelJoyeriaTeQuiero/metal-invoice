'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency } from '@/lib/invoice-calculations';
import { Loader2 } from 'lucide-react';

interface MonthEntry {
  month: number;
  label: string;
  entries: number;
  exits: number;
  balance: number;
  entriesValue: number;
  exitsValue: number;
}

interface StockData {
  year: number;
  gold: MonthEntry[];
  silver: MonthEntry[];
}

function MetalTable({ title, rows, color }: { title: string; rows: MonthEntry[]; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className={`px-4 sm:px-6 py-4 border-b border-slate-100 ${color}`}>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
              <th className="px-4 py-3 text-left font-medium">Mes</th>
              <th className="px-4 py-3 text-right font-medium">Entradas (uds)</th>
              <th className="px-4 py-3 text-right font-medium">Salidas (uds)</th>
              <th className="px-4 py-3 text-right font-medium">Balance acum.</th>
              <th className="px-4 py-3 text-right font-medium">Valor entradas</th>
              <th className="px-4 py-3 text-right font-medium">Valor salidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row) => (
              <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-700">{row.label}</td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {row.entries > 0 ? (
                    <span className="text-green-700 font-medium">+{row.entries.toFixed(4)}</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {row.exits > 0 ? (
                    <span className="text-red-600 font-medium">-{row.exits.toFixed(4)}</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-semibold ${row.balance > 0 ? 'text-green-700' : row.balance < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {row.balance.toFixed(4)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {row.entriesValue > 0 ? formatCurrency(row.entriesValue) : '—'}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {row.exitsValue > 0 ? formatCurrency(row.exitsValue) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t border-slate-200">
              <td className="px-4 py-3 font-semibold text-slate-700">Total anual</td>
              <td className="px-4 py-3 text-right font-semibold text-green-700">
                +{rows.reduce((s, r) => s + r.entries, 0).toFixed(4)}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-red-600">
                -{rows.reduce((s, r) => s + r.exits, 0).toFixed(4)}
              </td>
              <td className="px-4 py-3 text-right font-bold text-slate-900">
                {(rows[rows.length - 1]?.balance ?? 0).toFixed(4)}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-slate-800">
                {formatCurrency(rows.reduce((s, r) => s + r.entriesValue, 0))}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-slate-800">
                {formatCurrency(rows.reduce((s, r) => s + r.exitsValue, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default function StockMensualPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/reports/stock-mensual?year=${year}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
        <PageHeader title="Stock mensual" subtitle="Evolución del inventario por mes y metal" />

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Año</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4f91]"
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1d4f91]" />
          </div>
        ) : (
          <div className="space-y-6">
            <MetalTable title="Oro" rows={data?.gold ?? []} color="text-yellow-900" />
            <MetalTable title="Plata" rows={data?.silver ?? []} color="text-slate-800" />
          </div>
        )}
      </main>
    </div>
  );
}
