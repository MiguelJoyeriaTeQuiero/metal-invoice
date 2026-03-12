'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users, ChevronRight } from 'lucide-react';
import type { CustomerListItem } from '@/types/customer';

export function CustomerTable() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function fetchCustomers() {
    setLoading(true);
    const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, CIF o ciudad..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4f91]" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
              <th className="px-6 py-3 text-left font-medium">Nombre / Razón Social</th>
              <th className="px-6 py-3 text-left font-medium">CIF/NIF</th>
              <th className="px-6 py-3 text-left font-medium">Ciudad</th>
              <th className="px-6 py-3 text-left font-medium">Teléfono</th>
              <th className="px-6 py-3 text-left font-medium">Email</th>
              <th className="px-6 py-3 text-left font-medium">Facturas</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                ))}</tr>
              ))
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-16 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No se encontraron clientes</p>
              </td></tr>
            ) : customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4"><span className="font-medium text-slate-900 text-sm">{c.name}</span></td>
                <td className="px-6 py-4"><span className="font-mono text-sm text-slate-600">{c.taxId}</span></td>
                <td className="px-6 py-4 text-sm text-slate-600">{c.city}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{c.phone ?? '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{c.email ?? '—'}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-[#1d4f91] text-xs font-bold">{c._count.invoices}</span>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/clientes/${c.id}`} className="inline-flex items-center gap-1 text-sm text-[#1d4f91] hover:underline">
                    Ver <ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
