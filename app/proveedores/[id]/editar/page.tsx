import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { SupplierForm } from '@/components/suppliers/SupplierForm';

export default async function EditarProveedorPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const supplier = await prisma.supplier.findUnique({ where: { id: params.id } });
  if (!supplier) notFound();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8">
        <PageHeader title="Editar proveedor" subtitle={supplier.name} />
        <SupplierForm
          initial={{
            id: supplier.id,
            name: supplier.name,
            taxId: supplier.taxId,
            address: supplier.address,
            postalCode: supplier.postalCode,
            city: supplier.city,
            province: supplier.province,
            country: supplier.country,
            phone: supplier.phone ?? '',
            email: supplier.email ?? '',
            notes: supplier.notes ?? '',
          }}
        />
      </main>
    </div>
  );
}
