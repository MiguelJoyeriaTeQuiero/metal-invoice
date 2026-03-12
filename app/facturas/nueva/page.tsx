import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';

export default async function NuevaFacturaPage({ searchParams }: { searchParams: { customerId?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 lg:p-8 max-w-5xl">
        <PageHeader title="Nueva factura" subtitle="Completa los datos para generar la factura" />
        <InvoiceForm prefill={searchParams.customerId ? { customerId: searchParams.customerId } : undefined} />
      </main>
    </div>
  );
}
