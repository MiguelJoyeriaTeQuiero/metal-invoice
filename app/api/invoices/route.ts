import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateInvoiceNumber } from '@/lib/invoice-number';
import { calculateInvoiceTotals, calculateLineTotal } from '@/lib/invoice-calculations';
import type { InvoiceFormData } from '@/types/invoice';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const customerId = searchParams.get('customerId');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);

  const where: any = {};
  if (search) where.OR = [{ number: { contains: search, mode: 'insensitive' } }, { customer: { name: { contains: search, mode: 'insensitive' } } }];
  if (status && status !== 'ALL') where.status = status;
  if (type && type !== 'ALL') where.type = type;
  if (customerId) where.customerId = customerId;
  if (dateFrom || dateTo) {
    where.issueDate = {};
    if (dateFrom) where.issueDate.gte = new Date(dateFrom);
    if (dateTo) where.issueDate.lte = new Date(dateTo);
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { customer: { select: { id: true, name: true, taxId: true } } },
      orderBy: { issueDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.invoice.count({ where }),
  ]);

  return NextResponse.json({ invoices, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body: InvoiceFormData = await req.json();
    const number = await generateInvoiceNumber(body.type);
    const totals = calculateInvoiceTotals(body.lines);

    const invoice = await prisma.invoice.create({
      data: {
        number,
        type: body.type,
        paymentMethod: body.paymentMethod,
        issueDate: new Date(body.issueDate),
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        customerId: body.customerId,
        originalId: body.originalId ?? undefined,
        iban: body.iban,
        observations: body.observations,
        internalNotes: body.internalNotes,
        subtotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        totalIgic: totals.totalIgic,
        total: totals.total,
        lines: {
          create: body.lines.map((line, idx) => {
            const { igicAmount, lineTotal } = calculateLineTotal(line);
            return { ...line, lineOrder: idx, igicAmount, lineTotal };
          }),
        },
      },
      include: { customer: true, lines: true },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al crear factura' }, { status: 500 });
  }
}
