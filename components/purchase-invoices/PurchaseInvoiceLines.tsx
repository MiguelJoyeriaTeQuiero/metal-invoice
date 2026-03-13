'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { PurchaseInvoiceLineFormData, Metal } from '@/types/purchase-invoice';
import { IGIC_RATES } from '@/types/invoice';
import { calculateLineTotal, formatCurrency } from '@/lib/invoice-calculations';

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4f91]';
const selectCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4f91]';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

const emptyLine = (): PurchaseInvoiceLineFormData => ({
  lineOrder: 0,
  itemType: 'INGOT',
  metal: 'GOLD',
  product: '',
  description: '',
  serialNumber: '',
  weightGrams: 0,
  purity: 0.9999,
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  igicRate: IGIC_RATES.GOLD,
});

export function PurchaseInvoiceLines({
  lines,
  onChange,
}: {
  lines: PurchaseInvoiceLineFormData[];
  onChange: (lines: PurchaseInvoiceLineFormData[]) => void;
}) {
  function updateLine(index: number, field: keyof PurchaseInvoiceLineFormData, value: any) {
    const updated = lines.map((line, i) => {
      if (i !== index) return line;
      const newLine = { ...line, [field]: value };
      if (field === 'metal') newLine.igicRate = IGIC_RATES[value as Metal];
      return newLine;
    });
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {lines.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-6">
          Sin líneas. Pulsa "Añadir línea" para comenzar.
        </p>
      )}
      {lines.map((line, i) => {
        const { igicAmount, lineTotal } = calculateLineTotal(line as any);
        return (
          <div key={i} className="border border-slate-200 rounded-xl p-3 sm:p-4 bg-slate-50/50">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase">Línea {i + 1}</span>
              <button
                type="button"
                onClick={() => onChange(lines.filter((_, idx) => idx !== i))}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelCls}>Tipo</label>
                <select
                  value={line.itemType}
                  onChange={(e) => updateLine(i, 'itemType', e.target.value)}
                  className={selectCls}
                >
                  <option value="INGOT">Lingote</option>
                  <option value="COIN">Moneda</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Metal</label>
                <select
                  value={line.metal}
                  onChange={(e) => updateLine(i, 'metal', e.target.value)}
                  className={selectCls}
                >
                  <option value="GOLD">Oro (0% IGIC)</option>
                  <option value="SILVER">Plata (15% IGIC)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Producto *</label>
                <input
                  value={line.product}
                  onChange={(e) => updateLine(i, 'product', e.target.value)}
                  className={inputCls}
                  placeholder="Ej. Lingote Au 999.9 - 100g"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Descripción</label>
                <input
                  value={line.description ?? ''}
                  onChange={(e) => updateLine(i, 'description', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Nº Serie</label>
                <input
                  value={line.serialNumber ?? ''}
                  onChange={(e) => updateLine(i, 'serialNumber', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Pureza</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="1"
                  value={line.purity}
                  onChange={(e) => updateLine(i, 'purity', parseFloat(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Peso (g)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={line.weightGrams}
                  onChange={(e) => updateLine(i, 'weightGrams', parseFloat(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Cantidad</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={line.quantity}
                  onChange={(e) => updateLine(i, 'quantity', parseFloat(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Precio unitario (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={line.unitPrice}
                  onChange={(e) => updateLine(i, 'unitPrice', parseFloat(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Descuento (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={line.discount}
                  onChange={(e) => updateLine(i, 'discount', parseFloat(e.target.value))}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-6 mt-3 pt-3 border-t border-slate-200 text-sm">
              <span className="text-slate-500">
                IGIC ({(line.igicRate * 100).toFixed(0)}%): {formatCurrency(igicAmount)}
              </span>
              <span className="font-semibold text-slate-800">Total línea: {formatCurrency(lineTotal)}</span>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => onChange([...lines, { ...emptyLine(), lineOrder: lines.length }])}
        className="flex items-center gap-2 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-[#1d4f91] hover:text-[#1d4f91] transition-colors justify-center"
      >
        <Plus className="w-4 h-4" />Añadir línea
      </button>
    </div>
  );
}
