import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';

export default async function RectificativaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const original = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { lines: { orderBy: { lineOrder: 'asc' } } },
  });

  if (!original) notFound();
  if (original.status === 'VOIDED') redirect(`/facturas/${params.id}`);

  const prefill = {
    type: 'RECTIFICATIVE' as const,
    customerId: original.customerId,
    paymentMethod: original.paymentMethod as any,
    issueDate: new Date(),
    originalId: original.id,
    iban: original.iban ?? '',
    observations: original.observations ?? '',
    lines: original.lines.map((l) => ({
      lineOrder: l.lineOrder,
      itemType: l.itemType as any,
      metal: l.metal as any,
      product: l.product,
      description: l.description ?? '',
      serialNumber: l.serialNumber ?? '',
      weightGrams: Number(l.weightGrams),
      purity: Number(l.purity),
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
      discount: Number(l.discount),
      igicRate: Number(l.igicRate),
    })),
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 pt-16 md:p-6 lg:p-8 max-w-5xl">
        <PageHeader title="Nueva factura rectificativa" subtitle={`Rectificativa de ${original.number}`} />
        <InvoiceForm prefill={prefill} originalNumber={original.number} />
      </main>
    </div>
  );
}
