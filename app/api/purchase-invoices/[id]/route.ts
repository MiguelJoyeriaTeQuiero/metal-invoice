import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoice = await prisma.purchaseInvoice.findUnique({
    where: { id: params.id },
    include: {
      supplier: true,
      lines: { orderBy: { lineOrder: 'asc' } },
    },
  });

  if (!invoice) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const invoice = await prisma.purchaseInvoice.update({
      where: { id: params.id },
      data: {
        status: body.status,
        paymentMethod: body.paymentMethod,
        iban: body.iban,
        observations: body.observations,
        internalNotes: body.internalNotes,
      },
    });
    return NextResponse.json(invoice);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al actualizar factura de compra' }, { status: 500 });
  }
}
