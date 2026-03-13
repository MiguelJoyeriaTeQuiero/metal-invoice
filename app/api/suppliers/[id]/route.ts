import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
    include: {
      purchaseInvoices: {
        orderBy: { issueDate: 'desc' },
        select: { id: true, number: true, status: true, issueDate: true, total: true },
      },
    },
  });

  if (!supplier) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(supplier);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(supplier);
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un proveedor con ese CIF/NIF' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoiceCount = await prisma.purchaseInvoice.count({ where: { supplierId: params.id } });
  if (invoiceCount > 0) {
    return NextResponse.json(
      { error: 'No se puede eliminar un proveedor con facturas de compra asociadas' },
      { status: 409 },
    );
  }

  await prisma.supplier.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
