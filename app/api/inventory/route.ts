import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { InventoryItem } from '@/types/inventory';

export async function GET(_: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [purchaseLines, saleLines] = await Promise.all([
    prisma.purchaseInvoiceLine.findMany({
      where: { purchaseInvoice: { status: { not: 'VOIDED' } } },
      select: {
        metal: true,
        itemType: true,
        weightGrams: true,
        purity: true,
        quantity: true,
        unitPrice: true,
        discount: true,
      },
    }),
    prisma.invoiceLine.findMany({
      where: { invoice: { status: { not: 'VOIDED' } } },
      select: {
        metal: true,
        itemType: true,
        weightGrams: true,
        purity: true,
        quantity: true,
        unitPrice: true,
        discount: true,
      },
    }),
  ]);

  type GroupKey = string;
  interface GroupData {
    metal: 'GOLD' | 'SILVER';
    itemType: 'INGOT' | 'COIN';
    weightGrams: number;
    purity: number;
    purchasedQty: number;
    soldQty: number;
    totalCostWeighted: number;
    totalSaleValue: number;
  }

  const groups = new Map<GroupKey, GroupData>();

  const getKey = (metal: string, itemType: string, weightGrams: number, purity: number): GroupKey =>
    `${metal}|${itemType}|${weightGrams}|${purity}`;

  for (const line of purchaseLines) {
    const wg = Number(line.weightGrams);
    const pu = Number(line.purity);
    const key = getKey(line.metal, line.itemType, wg, pu);
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    const disc = Number(line.discount);
    const effectivePrice = price * (1 - disc / 100);

    if (!groups.has(key)) {
      groups.set(key, {
        metal: line.metal as 'GOLD' | 'SILVER',
        itemType: line.itemType as 'INGOT' | 'COIN',
        weightGrams: wg,
        purity: pu,
        purchasedQty: 0,
        soldQty: 0,
        totalCostWeighted: 0,
        totalSaleValue: 0,
      });
    }

    const g = groups.get(key)!;
    g.purchasedQty += qty;
    g.totalCostWeighted += qty * effectivePrice;
  }

  for (const line of saleLines) {
    const wg = Number(line.weightGrams);
    const pu = Number(line.purity);
    const key = getKey(line.metal, line.itemType, wg, pu);
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    const disc = Number(line.discount);
    const effectivePrice = price * (1 - disc / 100);

    if (!groups.has(key)) {
      groups.set(key, {
        metal: line.metal as 'GOLD' | 'SILVER',
        itemType: line.itemType as 'INGOT' | 'COIN',
        weightGrams: wg,
        purity: pu,
        purchasedQty: 0,
        soldQty: 0,
        totalCostWeighted: 0,
        totalSaleValue: 0,
      });
    }

    const g = groups.get(key)!;
    g.soldQty += qty;
    g.totalSaleValue += qty * effectivePrice;
  }

  const items: InventoryItem[] = Array.from(groups.values())
    .map((g) => {
      const avgCost = g.purchasedQty > 0 ? g.totalCostWeighted / g.purchasedQty : 0;
      const stock = g.purchasedQty - g.soldQty;
      return {
        metal: g.metal,
        itemType: g.itemType,
        weightGrams: g.weightGrams,
        purity: g.purity,
        purchased: g.purchasedQty,
        sold: g.soldQty,
        stock,
        avgCost,
        totalCostValue: stock * avgCost,
        totalSaleValue: g.totalSaleValue,
      };
    })
    .sort((a, b) => {
      if (a.metal !== b.metal) return a.metal.localeCompare(b.metal);
      if (a.itemType !== b.itemType) return a.itemType.localeCompare(b.itemType);
      return a.weightGrams - b.weightGrams;
    });

  return NextResponse.json(items);
}
