import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { SupplierTable } from '@/components/suppliers/SupplierTable';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function ProveedoresPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
        <PageHeader
          title="Proveedores"
          subtitle="Gestión de proveedores de metales"
          actions={
            <Link
              href="/proveedores/nuevo"
              className="flex items-center gap-2 px-4 py-2 bg-[#0f2747] text-white rounded-lg text-sm hover:bg-[#1d4f91] transition-colors"
            >
              <Plus className="w-4 h-4" />Nuevo proveedor
            </Link>
          }
        />
        <SupplierTable />
      </main>
    </div>
  );
}
