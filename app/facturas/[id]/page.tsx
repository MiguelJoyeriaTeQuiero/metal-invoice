import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InvoiceActions } from '@/components/invoices/InvoiceActions';
import { formatCurrency } from '@/lib/invoice-calculations';
import Link from 'next/link';

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: { include: { contacts: true } },
      lines: { orderBy: { lineOrder: 'asc' } },
      original: { select: { id: true, number: true } },
      rectificativas: { select: { id: true, number: true, status: true } },
    },
  });

  if (!invoice) notFound();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        <PageHeader
          title={invoice.number}
          subtitle={invoice.type === 'RECTIFICATIVE' ? 'Factura Rectificativa' : 'Factura'}
          actions={<InvoiceActions invoice={invoice as any} />} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><p className="text-slate-400 text-xs mb-1">Estado</p><StatusBadge status={invoice.status as any} /></div>
                <div><p className="text-slate-400 text-xs mb-1">Fecha emisión</p><p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString('es-ES')}</p></div>
                <div><p className="text-slate-400 text-xs mb-1">Forma de pago</p><p className="font-medium">{invoice.paymentMethod === 'TRANSFER' ? 'Transferencia' : 'Tarjeta'}</p></div>
                <div><p className="text-slate-400 text-xs mb-1">Enviada</p><p className="font-medium">{invoice.sentAt ? new Date(invoice.sentAt).toLocaleDateString('es-ES') : '—'}</p></div>
              </div>
              {invoice.iban && <div className="mt-4 pt-4 border-t border-slate-100"><p className="text-slate-400 text-xs mb-1">IBAN</p><p className="font-mono text-sm">{invoice.iban}</p></div>}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold text-slate-800">Líneas de factura</h2></div>
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
                          {line.serialNumber && <p className="text-slate-400 text-xs font-mono">S/N: {line.serialNumber}</p>}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{line.metal === 'GOLD' ? 'Oro' : 'Plata'}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{Number(line.weightGrams).toFixed(4)}g</td>
                        <td className="px-4 py-3 text-right text-slate-600">{Number(line.quantity).toFixed(4)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(Number(line.unitPrice))}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{Number(line.discount).toFixed(2)}%</td>
                        <td className="px-4 py-3 text-right text-slate-600">{(Number(line.igicRate) * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(Number(line.lineTotal))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                <div className="w-64 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(Number(invoice.subtotal))}</span></div>
                  {Number(invoice.totalDiscount) > 0 && <div className="flex justify-between text-slate-600"><span>Descuentos</span><span className="text-red-600">- {formatCurrency(Number(invoice.totalDiscount))}</span></div>}
                  {Number(invoice.totalIgic) > 0 && <div className="flex justify-between text-slate-600"><span>IGIC</span><span>{formatCurrency(Number(invoice.totalIgic))}</span></div>}
                  <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-200"><span>TOTAL</span><span>{formatCurrency(Number(invoice.total))}</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-800 mb-3 text-sm">Cliente</h3>
              <Link href={`/clientes/${invoice.customer.id}`} className="text-[#1d4f91] font-medium hover:underline text-sm">{invoice.customer.name}</Link>
              <p className="text-slate-500 text-xs mt-1 font-mono">{invoice.customer.taxId}</p>
              <p className="text-slate-500 text-xs mt-2">{invoice.customer.address}</p>
              <p className="text-slate-500 text-xs">{invoice.customer.postalCode} {invoice.customer.city}</p>
            </div>
            {invoice.original && (
              <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4">
                <p className="text-xs font-semibold text-orange-700 mb-2">Rectificativa de</p>
                <Link href={`/facturas/${invoice.original.id}`} className="text-sm text-orange-800 font-mono hover:underline">{invoice.original.number}</Link>
              </div>
            )}
            {invoice.rectificativas.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">Rectificativas</p>
                <div className="space-y-1">
                  {invoice.rectificativas.map((r) => (
                    <Link key={r.id} href={`/facturas/${r.id}`} className="flex items-center justify-between text-sm hover:bg-slate-50 rounded-lg p-1 -mx-1">
                      <span className="font-mono text-[#1d4f91]">{r.number}</span>
                      <StatusBadge status={r.status as any} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
