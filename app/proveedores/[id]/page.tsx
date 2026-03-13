import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { PurchaseStatusBadge } from '@/components/ui/PurchaseStatusBadge';
import { formatCurrency } from '@/lib/invoice-calculations';
import Link from 'next/link';
import { Edit, Plus } from 'lucide-react';
import type { PurchaseStatus } from '@/types/purchase-invoice';

type SupplierInvoice = {
  id: string;
  number: string;
  status: string;
  issueDate: Date;
  total: any;
};

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2">
      <dt className="text-slate-400 w-28 flex-shrink-0 text-sm">{label}</dt>
      <dd className="text-slate-700 text-sm">{value ?? '—'}</dd>
    </div>
  );
}

export default async function ProveedorDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
    include: {
      purchaseInvoices: {
        orderBy: { issueDate: 'desc' },
        select: { id: true, number: true, status: true, issueDate: true, total: true },
      },
    },
  });

  if (!supplier) notFound();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
        <PageHeader
          title={supplier.name}
          subtitle={`CIF/NIF: ${supplier.taxId}`}
          actions={
            <Link
              href={`/proveedores/${supplier.id}/editar`}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              <Edit className="w-4 h-4" />Editar
            </Link>
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-4 text-sm">Datos de contacto</h2>
              <dl className="space-y-2.5">
                <Row label="Dirección" value={supplier.address} />
                <Row label="C.P. / Ciudad" value={`${supplier.postalCode} ${supplier.city}`} />
                <Row label="Provincia" value={supplier.province} />
                <Row label="País" value={supplier.country} />
                <Row label="Teléfono" value={supplier.phone} />
                <Row label="Email" value={supplier.email} />
              </dl>
              {supplier.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Notas internas</p>
                  <p className="text-sm text-slate-600">{supplier.notes}</p>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800 text-sm">
                  Historial de compras ({supplier.purchaseInvoices.length})
                </h2>
                <Link
                  href={`/compras/nueva?supplierId=${supplier.id}`}
                  className="flex items-center gap-1.5 text-sm text-[#1d4f91] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />Nueva compra
                </Link>
              </div>
              {supplier.purchaseInvoices.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-12">Sin facturas de compra</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {(supplier.purchaseInvoices as SupplierInvoice[]).map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/compras/${inv.id}`}
                      className="flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-slate-50 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span className="font-mono text-xs sm:text-sm font-medium text-slate-700 flex-shrink-0">
                          {inv.number}
                        </span>
                        <span className="text-xs text-slate-400 hidden sm:block">
                          {new Date(inv.issueDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <PurchaseStatusBadge status={inv.status as PurchaseStatus} />
                        <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                          {formatCurrency(Number(inv.total))}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
