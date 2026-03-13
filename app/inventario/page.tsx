import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { InventoryTable } from '@/components/inventory/InventoryTable';

export default async function InventarioPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
        <PageHeader
          title="Inventario"
          subtitle="Stock actual de metales preciosos"
        />
        <InventoryTable />
      </main>
    </div>
  );
}
