import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { CustomerForm } from '@/components/customers/CustomerForm';

export default async function EditarClientePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const customer = await prisma.customer.findUnique({ where: { id: params.id }, include: { contacts: true } });
  if (!customer) notFound();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8 max-w-4xl">
        <PageHeader title="Editar cliente" subtitle={customer.name} />
        <CustomerForm initial={{
          id: customer.id, name: customer.name, taxId: customer.taxId,
          address: customer.address, postalCode: customer.postalCode, city: customer.city,
          province: customer.province, country: customer.country,
          phone: customer.phone ?? '', email: customer.email ?? '', notes: customer.notes ?? '',
          contacts: customer.contacts.map((c) => ({ name: c.name, role: c.role ?? '', phone: c.phone ?? '', email: c.email ?? '' })),
        }} />
      </main>
    </div>
  );
}
