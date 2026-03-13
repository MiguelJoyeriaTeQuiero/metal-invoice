import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePurchaseInvoiceNumber } from '@/lib/purchase-invoice-number';
import { calculateInvoiceTotals, calculateLineTotal } from '@/lib/invoice-calculations';
import type { PurchaseInvoiceFormData } from '@/types/purchase-invoice';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status');
  const supplierId = searchParams.get('supplierId');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);

  const where: any = {};
  if (search) {
    where.OR = [
      { number: { contains: search, mode: 'insensitive' } },
      { supplier: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (status && status !== 'ALL') where.status = status;
  if (supplierId) where.supplierId = supplierId;
  if (dateFrom || dateTo) {
    where.issueDate = {};
    if (dateFrom) where.issueDate.gte = new Date(dateFrom);
    if (dateTo) where.issueDate.lte = new Date(dateTo);
  }

  const [invoices, total] = await Promise.all([
    prisma.purchaseInvoice.findMany({
      where,
      include: { supplier: { select: { id: true, name: true, taxId: true } } },
      orderBy: { issueDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.purchaseInvoice.count({ where }),
  ]);

  return NextResponse.json({ invoices, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body: PurchaseInvoiceFormData = await req.json();
    const number = await generatePurchaseInvoiceNumber();
    const totals = calculateInvoiceTotals(body.lines as any);

    const invoice = await prisma.purchaseInvoice.create({
      data: {
        number,
        paymentMethod: body.paymentMethod as any,
        issueDate: new Date(body.issueDate),
        supplierId: body.supplierId,
        iban: body.iban,
        observations: body.observations,
        internalNotes: body.internalNotes,
        subtotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        totalIgic: totals.totalIgic,
        total: totals.total,
        lines: {
          create: body.lines.map((line, idx) => {
            const { igicAmount, lineTotal } = calculateLineTotal(line as any);
            return { ...line, lineOrder: idx, igicAmount, lineTotal };
          }),
        },
      },
      include: { supplier: true, lines: true },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al crear factura de compra' }, { status: 500 });
  }
}
