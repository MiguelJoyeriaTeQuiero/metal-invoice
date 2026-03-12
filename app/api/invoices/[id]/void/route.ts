import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoice = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!invoice) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  if (invoice.status === 'VOIDED') return NextResponse.json({ error: 'La factura ya está anulada' }, { status: 409 });

  const updated = await prisma.invoice.update({
    where: { id: params.id },
    data: { status: 'VOIDED', voidedAt: new Date() },
  });
  return NextResponse.json(updated);
}
