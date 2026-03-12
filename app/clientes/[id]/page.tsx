import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/invoice-calculations';
import Link from 'next/link';
import { Edit, Plus } from 'lucide-react';

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2">
      <dt className="text-slate-400 w-28 flex-shrink-0 text-sm">{label}</dt>
      <dd className="text-slate-700 text-sm">{value ?? '—'}</dd>
    </div>
  );
}

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      contacts: true,
      invoices: { orderBy: { issueDate: 'desc' }, select: { id: true, number: true, type: true, status: true, issueDate: true, total: true } },
    },
  });

  if (!customer) notFound();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        <PageHeader title={customer.name} subtitle={`CIF/NIF: ${customer.taxId}`}
          actions={
            <Link href={`/clientes/${customer.id}/editar`} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors">
              <Edit className="w-4 h-4" />Editar
            </Link>
          } />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-4 text-sm">Datos de contacto</h2>
              <dl className="space-y-2.5">
                <Row label="Dirección" value={customer.address} />
                <Row label="C.P. / Ciudad" value={`${customer.postalCode} ${customer.city}`} />
                <Row label="Provincia" value={customer.province} />
                <Row label="País" value={customer.country} />
                <Row label="Teléfono" value={customer.phone} />
                <Row label="Email" value={customer.email} />
              </dl>
              {customer.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Notas internas</p>
                  <p className="text-sm text-slate-600">{customer.notes}</p>
                </div>
              )}
            </div>
            {customer.contacts.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-800 mb-4 text-sm">Contactos</h2>
                <div className="space-y-3">
                  {customer.contacts.map((c) => (
                    <div key={c.id} className="border border-slate-100 rounded-xl p-3">
                      <p className="font-medium text-slate-800 text-sm">{c.name}</p>
                      {c.role && <p className="text-xs text-slate-500">{c.role}</p>}
                      {c.phone && <p className="text-xs text-slate-500 mt-1">{c.phone}</p>}
                      {c.email && <p className="text-xs text-slate-500">{c.email}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800 text-sm">Historial de facturas ({customer.invoices.length})</h2>
                <Link href={`/facturas/nueva?customerId=${customer.id}`} className="flex items-center gap-1.5 text-sm text-[#1d4f91] hover:underline">
                  <Plus className="w-3.5 h-3.5" />Nueva factura
                </Link>
              </div>
              {customer.invoices.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-12">Sin facturas</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {customer.invoices.map((inv) => (
                    <Link key={inv.id} href={`/facturas/${inv.id}`}
                      className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium text-slate-700">{inv.number}</span>
                        <span className="text-xs text-slate-400">{new Date(inv.issueDate).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={inv.status as any} />
                        <span className="text-sm font-semibold text-slate-800">{formatCurrency(Number(inv.total))}</span>
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
