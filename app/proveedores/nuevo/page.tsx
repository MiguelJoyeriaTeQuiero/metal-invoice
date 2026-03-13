import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { SupplierForm } from '@/components/suppliers/SupplierForm';

export default async function NuevoProveedorPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
        <PageHeader title="Nuevo proveedor" subtitle="Añadir un nuevo proveedor de metales" />
        <SupplierForm />
      </main>
    </div>
  );
}
