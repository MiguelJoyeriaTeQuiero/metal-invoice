'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { InvoiceLines } from './InvoiceLines';
import { calculateInvoiceTotals, formatCurrency } from '@/lib/invoice-calculations';
import type { InvoiceFormData } from '@/types/invoice';
import type { CustomerListItem } from '@/types/customer';

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4f91]';
const selectCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4f91]';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

export function InvoiceForm({ prefill, originalNumber }: { prefill?: Partial<InvoiceFormData>; originalNumber?: string }) {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isRectificative = !!prefill?.originalId;

  const [form, setForm] = useState<InvoiceFormData>({
    type: prefill?.originalId ? 'RECTIFICATIVE' : 'STANDARD',
    customerId: prefill?.customerId ?? '',
    paymentMethod: prefill?.paymentMethod ?? 'TRANSFER',
    issueDate: prefill?.issueDate ?? new Date(),
    originalId: prefill?.originalId,
    lines: prefill?.lines ?? [],
    iban: prefill?.iban ?? '',
    observations: prefill?.observations ?? '',
    internalNotes: prefill?.internalNotes ?? '',
  });

  useEffect(() => { fetch('/api/customers').then((r) => r.json()).then(setCustomers); }, []);

  const totals = calculateInvoiceTotals(form.lines);
  const update = (field: keyof InvoiceFormData, value: any) => setForm((p) => ({ ...p, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.lines.length === 0) { setError('Debe añadir al menos una línea de factura'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error al crear la factura');
      const inv = await res.json();
      router.push(`/facturas/${inv.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally { setLoading(false); }
  }

  const issueDateStr = form.issueDate instanceof Date
    ? form.issueDate.toISOString().split('T')[0]
    : String(form.issueDate).split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
      {isRectificative && (
        <div className="p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-sm">
          ⚠️ Factura rectificativa de <strong>{originalNumber}</strong>. Las líneas han sido copiadas automáticamente.
        </div>
      )}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Datos generales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelCls}>Cliente *</label>
            <select value={form.customerId} onChange={(e) => update('customerId', e.target.value)} className={selectCls} required disabled={isRectificative}>
              <option value="">— Seleccionar cliente —</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.taxId})</option>)}
            </select></div>
          <div><label className={labelCls}>Fecha de emisión *</label>
            <input type="date" value={issueDateStr} onChange={(e) => update('issueDate', new Date(e.target.value))} className={inputCls} required /></div>
          <div><label className={labelCls}>Forma de pago</label>
            <select value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)} className={selectCls}>
              <option value="TRANSFER">Transferencia bancaria</option>
              <option value="CARD">Tarjeta</option>
            </select></div>
          {form.paymentMethod === 'TRANSFER' && (
            <div className="md:col-span-2"><label className={labelCls}>IBAN</label>
              <input value={form.iban ?? ''} onChange={(e) => update('iban', e.target.value)} className={inputCls} placeholder="ES00 0000 0000 00 0000000000" /></div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Líneas de factura</h2>
        <InvoiceLines lines={form.lines} onChange={(lines) => update('lines', lines)} />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
            {totals.totalDiscount > 0 && <div className="flex justify-between text-sm text-slate-600"><span>Descuentos</span><span className="text-red-600">- {formatCurrency(totals.totalDiscount)}</span></div>}
            {totals.igicBreakdown.map((b) => (
              <div key={b.rate} className="flex justify-between text-sm text-slate-600"><span>IGIC {(b.rate * 100).toFixed(0)}%</span><span>{formatCurrency(b.amount)}</span></div>
            ))}
            <div className="flex justify-between font-bold text-lg text-slate-900 pt-2 border-t border-slate-200"><span>TOTAL</span><span>{formatCurrency(totals.total)}</span></div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Observaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelCls}>Observaciones (aparecen en PDF)</label>
            <textarea value={form.observations ?? ''} onChange={(e) => update('observations', e.target.value)} className={`${inputCls} h-24 resize-none`} /></div>
          <div><label className={labelCls}>Notas internas (no aparecen en PDF)</label>
            <textarea value={form.internalNotes ?? ''} onChange={(e) => update('internalNotes', e.target.value)} className={`${inputCls} h-24 resize-none`} /></div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancelar</button>
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-[#0f2747] text-white rounded-xl text-sm hover:bg-[#1d4f91] transition-colors disabled:opacity-50">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isRectificative ? 'Crear rectificativa' : 'Crear factura'}
        </button>
      </div>
    </form>
  );
}
