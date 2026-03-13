import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { PurchaseInvoiceList } from '@/components/purchase-invoices/PurchaseInvoiceList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function ComprasPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
        <PageHeader
          title="Facturas de compra"
          subtitle="Gestión de compras de metales a proveedores"
          actions={
            <Link
              href="/compras/nueva"
              className="flex items-center gap-2 px-4 py-2 bg-[#0f2747] text-white rounded-lg text-sm hover:bg-[#1d4f91] transition-colors"
            >
              <Plus className="w-4 h-4" />Nueva compra
            </Link>
          }
        />
        <PurchaseInvoiceList />
      </main>
    </div>
  );
}
