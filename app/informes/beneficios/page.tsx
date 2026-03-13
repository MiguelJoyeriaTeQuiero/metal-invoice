'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency } from '@/lib/invoice-calculations';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface MetalSummary {
  metal: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
}

interface ReportData {
  summary: MetalSummary[];
  monthly: MonthlyData[];
}

const MONTH_LABELS: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${positive === undefined ? 'text-slate-900' : positive ? 'text-green-700' : 'text-red-600'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function BeneficiosPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const res = await fetch(`/api/reports/profits?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalRevenue = data?.summary.reduce((s, m) => s + m.revenue, 0) ?? 0;
  const totalCost = data?.summary.reduce((s, m) => s + m.cost, 0) ?? 0;
  const totalProfit = totalRevenue - totalCost;
  const totalMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

  const maxMonthlyRevenue = data ? Math.max(...data.monthly.map((m) => m.revenue), 1) : 1;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
        <PageHeader title="Informe de beneficios" subtitle="Análisis de ingresos, costes y márgenes" />

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Desde</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4f91]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hasta</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4f91]"
              />
            </div>
            {(from || to) && (
              <button
                onClick={() => { setFrom(''); setTo(''); }}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1d4f91]" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Ingresos totales" value={formatCurrency(totalRevenue)} />
              <StatCard label="Costes totales" value={formatCurrency(totalCost)} />
              <StatCard label="Beneficio bruto" value={formatCurrency(totalProfit)} positive={totalProfit >= 0} />
              <StatCard label="Margen" value={`${totalMargin.toFixed(1)}%`} positive={totalMargin >= 0} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Desglose por metal</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                      <th className="px-6 py-3 text-left font-medium">Metal</th>
                      <th className="px-6 py-3 text-right font-medium">Ingresos</th>
                      <th className="px-6 py-3 text-right font-medium">Costes</th>
                      <th className="px-6 py-3 text-right font-medium">Beneficio</th>
                      <th className="px-6 py-3 text-right font-medium">Margen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.summary.map((row) => (
                      <tr key={row.metal} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {row.metal === 'GOLD' ? 'Oro' : 'Plata'}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-700">{formatCurrency(row.revenue)}</td>
                        <td className="px-6 py-4 text-right text-slate-700">{formatCurrency(row.cost)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-semibold ${row.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                            {formatCurrency(row.profit)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-semibold ${row.margin >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                            {row.margin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Evolución mensual</h2>
              <div className="space-y-2">
                {data?.monthly.map((m) => {
                  const monthLabel = MONTH_LABELS[m.month.split('-')[1]] ?? m.month;
                  const revenueWidth = maxMonthlyRevenue > 0 ? (m.revenue / maxMonthlyRevenue) * 100 : 0;
                  const costWidth = maxMonthlyRevenue > 0 ? (m.cost / maxMonthlyRevenue) * 100 : 0;
                  return (
                    <div key={m.month} className="flex items-center gap-3 text-xs">
                      <span className="w-8 text-slate-500 font-medium flex-shrink-0">{monthLabel}</span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1">
                          <div className="h-3 bg-blue-500 rounded-sm transition-all" style={{ width: `${revenueWidth}%` }} />
                          <span className="text-slate-500 whitespace-nowrap">{formatCurrency(m.revenue)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 bg-red-400 rounded-sm transition-all" style={{ width: `${costWidth}%` }} />
                          <span className="text-slate-500 whitespace-nowrap">{formatCurrency(m.cost)}</span>
                        </div>
                      </div>
                      <div className="w-20 text-right flex-shrink-0">
                        <span className={`font-semibold ${m.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                          {m.profit >= 0
                            ? <TrendingUp className="inline w-3 h-3 mr-0.5" />
                            : <TrendingDown className="inline w-3 h-3 mr-0.5" />
                          }
                          {formatCurrency(m.profit)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                  <span className="text-xs text-slate-500">Ingresos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-sm" />
                  <span className="text-xs text-slate-500">Costes</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
