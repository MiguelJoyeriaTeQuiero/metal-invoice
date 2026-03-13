'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PurchaseInvoiceLines } from './PurchaseInvoiceLines';
import { calculateInvoiceTotals, formatCurrency } from '@/lib/invoice-calculations';
import type { PurchaseInvoiceFormData } from '@/types/purchase-invoice';
import type { SupplierListItem } from '@/types/supplier';

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4f91]';
const selectCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4f91]';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

export function PurchaseInvoiceForm({ prefill }: { prefill?: Partial<PurchaseInvoiceFormData> }) {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<PurchaseInvoiceFormData>({
    supplierId: prefill?.supplierId ?? '',
    paymentMethod: prefill?.paymentMethod ?? 'TRANSFER',
    issueDate: prefill?.issueDate ?? new Date(),
    lines: prefill?.lines ?? [],
    iban: prefill?.iban ?? '',
    observations: prefill?.observations ?? '',
    internalNotes: prefill?.internalNotes ?? '',
  });

  useEffect(() => {
    fetch('/api/suppliers').then((r) => r.json()).then(setSuppliers);
  }, []);

  const totals = calculateInvoiceTotals(form.lines as any);
  const update = (field: keyof PurchaseInvoiceFormData, value: any) =>
    setForm((p) => ({ ...p, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.lines.length === 0) {
      setError('Debe añadir al menos una línea de factura');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/purchase-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error al crear la factura de compra');
      const inv = await res.json();
      router.push(`/compras/${inv.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  const issueDateStr =
    form.issueDate instanceof Date
      ? form.issueDate.toISOString().split('T')[0]
      : String(form.issueDate).split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Datos generales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Proveedor *</label>
            <select
              value={form.supplierId}
              onChange={(e) => update('supplierId', e.target.value)}
              className={selectCls}
              required
            >
              <option value="">— Seleccionar proveedor —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.taxId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Fecha de emisión *</label>
            <input
              type="date"
              value={issueDateStr}
              onChange={(e) => update('issueDate', new Date(e.target.value))}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Forma de pago</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => update('paymentMethod', e.target.value)}
              className={selectCls}
            >
              <option value="TRANSFER">Transferencia bancaria</option>
              <option value="CARD">Tarjeta</option>
            </select>
          </div>
          {form.paymentMethod === 'TRANSFER' && (
            <div className="md:col-span-2">
              <label className={labelCls}>IBAN del proveedor</label>
              <input
                value={form.iban ?? ''}
                onChange={(e) => update('iban', e.target.value)}
                className={inputCls}
                placeholder="ES00 0000 0000 00 0000000000"
              />
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Líneas de factura</h2>
        <PurchaseInvoiceLines lines={form.lines} onChange={(lines) => update('lines', lines)} />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
        <div className="flex justify-end">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.totalDiscount > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Descuentos</span>
                <span className="text-red-600">- {formatCurrency(totals.totalDiscount)}</span>
              </div>
            )}
            {totals.igicBreakdown.map((b) => (
              <div key={b.rate} className="flex justify-between text-sm text-slate-600">
                <span>IGIC {(b.rate * 100).toFixed(0)}%</span>
                <span>{formatCurrency(b.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-lg text-slate-900 pt-2 border-t border-slate-200">
              <span>TOTAL</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Observaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Observaciones</label>
            <textarea
              value={form.observations ?? ''}
              onChange={(e) => update('observations', e.target.value)}
              className={`${inputCls} h-24 resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>Notas internas</label>
            <textarea
              value={form.internalNotes ?? ''}
              onChange={(e) => update('internalNotes', e.target.value)}
              className={`${inputCls} h-24 resize-none`}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50 transition-colors text-center"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0f2747] text-white rounded-xl text-sm hover:bg-[#1d4f91] transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Crear factura de compra
        </button>
      </div>
    </form>
  );
}
