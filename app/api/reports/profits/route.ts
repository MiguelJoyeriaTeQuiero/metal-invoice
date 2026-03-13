import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { round2 } from '@/lib/invoice-calculations';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  const now = new Date();
  const currentYear = now.getFullYear();

  const dateFilter = fromParam || toParam
    ? {
        ...(fromParam ? { gte: new Date(fromParam) } : {}),
        ...(toParam ? { lte: new Date(toParam) } : {}),
      }
    : undefined;

  const saleWhere: any = { invoice: { status: { not: 'VOIDED' } } };
  const purchaseWhere: any = { purchaseInvoice: { status: { not: 'VOIDED' } } };

  if (dateFilter) {
    saleWhere.invoice = { ...saleWhere.invoice, issueDate: dateFilter };
    purchaseWhere.purchaseInvoice = { ...purchaseWhere.purchaseInvoice, issueDate: dateFilter };
  }

  const [saleLines, purchaseLines] = await Promise.all([
    prisma.invoiceLine.findMany({
      where: saleWhere,
      select: {
        metal: true,
        quantity: true,
        unitPrice: true,
        discount: true,
        invoice: { select: { issueDate: true } },
      },
    }),
    prisma.purchaseInvoiceLine.findMany({
      where: purchaseWhere,
      select: {
        metal: true,
        quantity: true,
        unitPrice: true,
        discount: true,
        purchaseInvoice: { select: { issueDate: true } },
      },
    }),
  ]);

  // Summary by metal
  const metalRevenue: Record<string, number> = { GOLD: 0, SILVER: 0 };
  const metalCost: Record<string, number> = { GOLD: 0, SILVER: 0 };

  for (const line of saleLines) {
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    const disc = Number(line.discount);
    metalRevenue[line.metal] = (metalRevenue[line.metal] ?? 0) + qty * price * (1 - disc / 100);
  }

  for (const line of purchaseLines) {
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    const disc = Number(line.discount);
    metalCost[line.metal] = (metalCost[line.metal] ?? 0) + qty * price * (1 - disc / 100);
  }

  const summary = ['GOLD', 'SILVER'].map((metal) => {
    const revenue = round2(metalRevenue[metal] ?? 0);
    const cost = round2(metalCost[metal] ?? 0);
    const profit = round2(revenue - cost);
    const margin = revenue > 0 ? round2((profit / revenue) * 100) : 0;
    return { metal, revenue, cost, profit, margin };
  });

  // Monthly breakdown (current year if no date filter)
  const monthlyRevenue: Record<string, number> = {};
  const monthlyCost: Record<string, number> = {};

  const yearFilter = dateFilter
    ? null
    : { gte: new Date(`${currentYear}-01-01`), lte: new Date(`${currentYear}-12-31T23:59:59`) };

  const monthSaleLines = yearFilter
    ? await prisma.invoiceLine.findMany({
        where: { invoice: { status: { not: 'VOIDED' }, issueDate: yearFilter } },
        select: { quantity: true, unitPrice: true, discount: true, invoice: { select: { issueDate: true } } },
      })
    : saleLines as any[];

  const monthPurchaseLines = yearFilter
    ? await prisma.purchaseInvoiceLine.findMany({
        where: { purchaseInvoice: { status: { not: 'VOIDED' }, issueDate: yearFilter } },
        select: { quantity: true, unitPrice: true, discount: true, purchaseInvoice: { select: { issueDate: true } } },
      })
    : purchaseLines as any[];

  for (const line of monthSaleLines) {
    const date = new Date(line.invoice.issueDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    const disc = Number(line.discount);
    monthlyRevenue[key] = (monthlyRevenue[key] ?? 0) + qty * price * (1 - disc / 100);
  }

  for (const line of monthPurchaseLines) {
    const date = new Date(line.purchaseInvoice.issueDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    const disc = Number(line.discount);
    monthlyCost[key] = (monthlyCost[key] ?? 0) + qty * price * (1 - disc / 100);
  }

  // Build 12 months for current year
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const month = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
    const revenue = round2(monthlyRevenue[month] ?? 0);
    const cost = round2(monthlyCost[month] ?? 0);
    const profit = round2(revenue - cost);
    return { month, revenue, cost, profit };
  });

  return NextResponse.json({ summary, monthly });
}
