import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import Link from 'next/link';
import { Plus, Download } from 'lucide-react';

export default async function FacturasPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        <PageHeader title="Facturas" subtitle="Gestión de facturas y rectificativas"
          actions={<>
            <a href="/api/export/invoices" className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />Exportar Excel
            </a>
            <Link href="/facturas/nueva" className="flex items-center gap-2 px-4 py-2 bg-[#0f2747] text-white rounded-lg text-sm hover:bg-[#1d4f91] transition-colors">
              <Plus className="w-4 h-4" />Nueva factura
            </Link>
          </>} />
        <InvoiceList />
      </main>
    </div>
  );
}
