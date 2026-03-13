import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { round2 } from '@/lib/invoice-calculations';

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()), 10);

  const yearStart = new Date(`${year}-01-01`);
  const yearEnd = new Date(`${year}-12-31T23:59:59`);

  const [purchaseLines, saleLines] = await Promise.all([
    prisma.purchaseInvoiceLine.findMany({
      where: { purchaseInvoice: { status: { not: 'VOIDED' }, issueDate: { gte: yearStart, lte: yearEnd } } },
      select: {
        metal: true,
        quantity: true,
        unitPrice: true,
        discount: true,
        purchaseInvoice: { select: { issueDate: true } },
      },
    }),
    prisma.invoiceLine.findMany({
      where: { invoice: { status: { not: 'VOIDED' }, issueDate: { gte: yearStart, lte: yearEnd } } },
      select: {
        metal: true,
        quantity: true,
        unitPrice: true,
        discount: true,
        invoice: { select: { issueDate: true } },
      },
    }),
  ]);

  type MonthData = {
    entries: number;
    exits: number;
    entriesValue: number;
    exitsValue: number;
  };

  const buildMonthMap = (): Map<number, MonthData> => {
    const map = new Map<number, MonthData>();
    for (let m = 1; m <= 12; m++) {
      map.set(m, { entries: 0, exits: 0, entriesValue: 0, exitsValue: 0 });
    }
    return map;
  };

  const goldMonths = buildMonthMap();
  const silverMonths = buildMonthMap();

  for (const line of purchaseLines) {
    const month = new Date(line.purchaseInvoice.issueDate).getMonth() + 1;
    const map = line.metal === 'GOLD' ? goldMonths : silverMonths;
    const d = map.get(month)!;
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    const disc = Number(line.discount);
    d.entries += qty;
    d.entriesValue += qty * price * (1 - disc / 100);
  }

  for (const line of saleLines) {
    const month = new Date(line.invoice.issueDate).getMonth() + 1;
    const map = line.metal === 'GOLD' ? goldMonths : silverMonths;
    const d = map.get(month)!;
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    const disc = Number(line.discount);
    d.exits += qty;
    d.exitsValue += qty * price * (1 - disc / 100);
  }

  const buildResult = (monthMap: Map<number, MonthData>) => {
    let runningBalance = 0;
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const d = monthMap.get(month)!;
      runningBalance += d.entries - d.exits;
      return {
        month,
        label: MONTH_LABELS[i],
        entries: round2(d.entries),
        exits: round2(d.exits),
        balance: round2(runningBalance),
        entriesValue: round2(d.entriesValue),
        exitsValue: round2(d.exitsValue),
      };
    });
  };

  return NextResponse.json({
    year,
    gold: buildResult(goldMonths),
    silver: buildResult(silverMonths),
  });
}
