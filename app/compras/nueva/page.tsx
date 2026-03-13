import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { PurchaseInvoiceForm } from '@/components/purchase-invoices/PurchaseInvoiceForm';

export default async function NuevaCompraPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
        <PageHeader title="Nueva factura de compra" subtitle="Registrar una compra de metales a un proveedor" />
        <PurchaseInvoiceForm />
      </main>
    </div>
  );
}
