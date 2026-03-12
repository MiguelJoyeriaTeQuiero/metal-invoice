import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      contacts: true,
      invoices: {
        orderBy: { issueDate: 'desc' },
        take: 20,
        select: { id: true, number: true, type: true, status: true, issueDate: true, total: true },
      },
    },
  });

  if (!customer) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { contacts, ...customerData } = body;
    await prisma.contact.deleteMany({ where: { customerId: params.id } });
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: { ...customerData, contacts: { create: (contacts ?? []).slice(0, 3) } },
      include: { contacts: true },
    });
    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoiceCount = await prisma.invoice.count({ where: { customerId: params.id } });
  if (invoiceCount > 0) {
    return NextResponse.json({ error: 'No se puede eliminar un cliente con facturas asociadas' }, { status: 409 });
  }

  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
