import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { ImportCustomersForm } from '@/components/customers/ImportCustomersForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ImportarClientesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
        <PageHeader
          title="Importar clientes"
          subtitle="Importar clientes en masa desde un archivo Excel"
          actions={
            <Link
              href="/clientes"
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />Volver a clientes
            </Link>
          }
        />
        <ImportCustomersForm />
      </main>
    </div>
  );
}
