'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { PurchaseStatusBadge } from '@/components/ui/PurchaseStatusBadge';
import { formatCurrency } from '@/lib/invoice-calculations';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { PurchaseInvoice, PurchaseStatus } from '@/types/purchase-invoice';

export default function CompraDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<PurchaseInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/purchase-invoices/${id}`)
      .then((r) => r.json())
      .then((data) => { setInvoice(data); setLoading(false); });
  }, [id]);

  async function updateStatus(status: PurchaseStatus) {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/purchase-invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error al actualizar');
      const updated = await res.json();
      setInvoice((prev) => prev ? { ...prev, status: updated.status } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1d4f91]" />
        </main>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
          <p className="text-slate-500">Factura no encontrada.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
        <PageHeader
          title={invoice.number}
          subtitle="Factura de compra"
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              {invoice.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => updateStatus('PAID')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Marcar como pagada
                  </button>
                  <button
                    onClick={() => updateStatus('VOIDED')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Anular
                  </button>
                </>
              )}
            </div>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Estado</p>
                  <PurchaseStatusBadge status={invoice.status} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Fecha emisión</p>
                  <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Forma de pago</p>
                  <p className="font-medium">{invoice.paymentMethod === 'TRANSFER' ? 'Transferencia' : 'Tarjeta'}</p>
                </div>
              </div>
              {invoice.iban && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-slate-400 text-xs mb-1">IBAN proveedor</p>
                  <p className="font-mono text-sm">{invoice.iban}</p>
                </div>
              )}
              {invoice.observations && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-slate-400 text-xs mb-1">Observaciones</p>
                  <p className="text-sm text-slate-700">{invoice.observations}</p>
                </div>
              )}
              {invoice.internalNotes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-slate-400 text-xs mb-1">Notas internas</p>
                  <p className="text-sm text-slate-700">{invoice.internalNotes}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Líneas de factura</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                      <th className="px-4 py-3 text-left">Producto</th>
                      <th className="px-4 py-3 text-left">Metal</th>
                      <th className="px-4 py-3 text-right">Peso</th>
                      <th className="px-4 py-3 text-right">Cant.</th>
                      <th className="px-4 py-3 text-right">P.Unit</th>
                      <th className="px-4 py-3 text-right">Dto%</th>
                      <th className="px-4 py-3 text-right">IGIC</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoice.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">{line.product}</p>
                          {line.description && <p className="text-slate-400 text-xs">{line.description}</p>}
                          {line.serialNumber && (
                            <p className="text-slate-400 text-xs font-mono">S/N: {line.serialNumber}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{line.metal === 'GOLD' ? 'Oro' : 'Plata'}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{Number(line.weightGrams).toFixed(4)}g</td>
                        <td className="px-4 py-3 text-right text-slate-600">{Number(line.quantity).toFixed(4)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(Number(line.unitPrice))}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{Number(line.discount).toFixed(2)}%</td>
                        <td className="px-4 py-3 text-right text-slate-600">{(Number(line.igicRate) * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          {formatCurrency(Number(line.lineTotal))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex justify-end">
                <div className="w-full sm:w-64 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(Number(invoice.subtotal))}</span>
                  </div>
                  {Number(invoice.totalDiscount) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Descuentos</span>
                      <span className="text-red-600">- {formatCurrency(Number(invoice.totalDiscount))}</span>
                    </div>
                  )}
                  {Number(invoice.totalIgic) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>IGIC</span>
                      <span>{formatCurrency(Number(invoice.totalIgic))}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-200">
                    <span>TOTAL</span>
                    <span>{formatCurrency(Number(invoice.total))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-800 mb-3 text-sm">Proveedor</h3>
              <Link
                href={`/proveedores/${invoice.supplier.id}`}
                className="text-[#1d4f91] font-medium hover:underline text-sm"
              >
                {invoice.supplier.name}
              </Link>
              <p className="text-slate-500 text-xs mt-1 font-mono">{invoice.supplier.taxId}</p>
              <p className="text-slate-500 text-xs mt-2">{invoice.supplier.address}</p>
              <p className="text-slate-500 text-xs">
                {invoice.supplier.postalCode} {invoice.supplier.city}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
