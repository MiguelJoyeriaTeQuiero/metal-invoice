import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';

  const customers = await prisma.customer.findMany({
    where: search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { taxId: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ],
    } : undefined,
    include: { contacts: true, _count: { select: { invoices: true } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { contacts, ...customerData } = body;
    const customer = await prisma.customer.create({
      data: { ...customerData, contacts: { create: (contacts ?? []).slice(0, 3) } },
      include: { contacts: true },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 });
  }
}
