import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCards } from '@/components/ui/StatsCards';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FileText, Users, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/invoice-calculations';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const [totalCustomers, invoiceStats, recentInvoices, pendingTotal] = await Promise.all([
    prisma.customer.count(),
    prisma.invoice.aggregate({ _count: { _all: true }, _sum: { total: true }, where: { status: { not: 'VOIDED' } } }),
    prisma.invoice.findMany({ take: 8, orderBy: { issueDate: 'desc' }, include: { customer: { select: { name: true } } } }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PENDING' } }),
  ]);

  const stats = [
    { label: 'Clientes', value: String(totalCustomers), icon: Users, color: 'bg-indigo-50' },
    { label: 'Facturas emitidas', value: String(invoiceStats._count._all), icon: FileText, color: 'bg-blue-50' },
    { label: 'Total facturado', value: formatCurrency(Number(invoiceStats._sum.total ?? 0)), icon: TrendingUp, color: 'bg-green-50' },
    { label: 'Pendiente de cobro', value: formatCurrency(Number(pendingTotal._sum.total ?? 0)), icon: Clock, color: 'bg-yellow-50' },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
        <PageHeader title="Dashboard" subtitle={`Bienvenido, ${session.user?.name ?? 'Admin'}`} />
        <StatsCards stats={stats} />
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Últimas facturas</h2>
            <Link href="/facturas" className="text-sm text-[#1d4f91] hover:underline font-medium">Ver todas →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentInvoices.map((inv) => (
              <Link key={inv.id} href={`/facturas/${inv.id}`}
                className="flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-slate-50 transition-colors gap-2">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <span className="font-mono text-xs sm:text-sm font-medium text-slate-700 flex-shrink-0">{inv.number}</span>
                  <span className="text-sm text-slate-500 truncate">{inv.customer.name}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <StatusBadge status={inv.status as any} />
                  <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">{formatCurrency(Number(inv.total))}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
