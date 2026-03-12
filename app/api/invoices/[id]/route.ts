import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: { include: { contacts: true } },
      lines: { orderBy: { lineOrder: 'asc' } },
      original: { select: { id: true, number: true } },
      rectificativas: { select: { id: true, number: true, status: true } },
    },
  });

  if (!invoice) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      status: body.status,
      paymentMethod: body.paymentMethod,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      iban: body.iban,
      observations: body.observations,
      internalNotes: body.internalNotes,
    },
  });
  return NextResponse.json(invoice);
}
