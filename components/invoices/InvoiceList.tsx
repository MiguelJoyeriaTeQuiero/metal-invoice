'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, FileText, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { InvoiceListItem, InvoiceStatus, InvoiceFilters } from '@/types/invoice';
import { formatCurrency } from '@/lib/invoice-calculations';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PAID', label: 'Pagada' },
  { value: 'PARTIAL', label: 'Parcial' },
  { value: 'VOIDED', label: 'Anulada' },
];

export function InvoiceList() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InvoiceFilters>({ search: '', status: 'ALL', type: 'ALL', page: 1, pageSize: 20 });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.type && filters.type !== 'ALL') params.set('type', filters.type);
    params.set('page', String(filters.page)); params.set('pageSize', String(filters.pageSize));
    const res = await fetch(`/api/invoices?${params}`);
    const data = await res.json();
    setInvoices(data.invoices); setTotal(data.total); setLoading(false);
  }, [filters]);

  useEffect(() => { const t = setTimeout(fetchInvoices, 300); return () => clearTimeout(t); }, [fetchInvoices]);

  const updateFilter = (key: keyof InvoiceFilters, value: any) => setFilters((p) => ({ ...p, [key]: value, page: 1 }));
  const totalPages = Math.ceil(total / (filters.pageSize ?? 20));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input value={filters.search ?? ''} onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Buscar número o cliente..."
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4f91] w-64" />
        </div>
        <select value={filters.status ?? 'ALL'} onChange={(e) => updateFilter('status', e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4f91]">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filters.type ?? 'ALL'} onChange={(e) => updateFilter('type', e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4f91]">
          <option value="ALL">Todos los tipos</option>
          <option value="STANDARD">Facturas</option>
          <option value="RECTIFICATIVE">Rectificativas</option>
        </select>
        <span className="ml-auto text-xs text-slate-400">{total} resultados</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
              <th className="px-6 py-3 text-left font-medium">Número</th>
              <th className="px-6 py-3 text-left font-medium">Cliente</th>
              <th className="px-6 py-3 text-left font-medium">Fecha</th>
              <th className="px-6 py-3 text-left font-medium">Estado</th>
              <th className="px-6 py-3 text-left font-medium">Forma pago</th>
              <th className="px-6 py-3 text-right font-medium">Total</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
              ))}</tr>
            )) : invoices.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-16 text-center">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No se encontraron facturas</p>
              </td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {inv.type === 'RECTIFICATIVE' && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">R</span>}
                    <span className="font-mono text-sm font-medium text-slate-700">{inv.number}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{inv.customer.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(inv.issueDate).toLocaleDateString('es-ES')}</td>
                <td className="px-6 py-4"><StatusBadge status={inv.status as InvoiceStatus} /></td>
                <td className="px-6 py-4 text-sm text-slate-500">{inv.paymentMethod === 'TRANSFER' ? 'Transferencia' : 'Tarjeta'}</td>
                <td className="px-6 py-4 text-right"><span className="text-sm font-semibold text-slate-800">{formatCurrency(Number(inv.total))}</span></td>
                <td className="px-6 py-4">
                  <Link href={`/facturas/${inv.id}`} className="inline-flex items-center gap-1 text-sm text-[#1d4f91] hover:underline">
                    Ver <ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <button onClick={() => updateFilter('page', (filters.page ?? 1) - 1)} disabled={(filters.page ?? 1) <= 1}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors">Anterior</button>
          <span className="text-sm text-slate-500">Página {filters.page} de {totalPages}</span>
          <button onClick={() => updateFilter('page', (filters.page ?? 1) + 1)} disabled={(filters.page ?? 1) >= totalPages}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors">Siguiente</button>
        </div>
      )}
    </div>
  );
}
