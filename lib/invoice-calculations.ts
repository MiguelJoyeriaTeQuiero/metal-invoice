import type { InvoiceLineFormData, InvoiceTotals, IgicBreakdown } from '@/types/invoice';

export function calculateLineTotal(line: InvoiceLineFormData): {
  igicAmount: number;
  lineTotal: number;
} {
  const base = line.quantity * line.unitPrice;
  const discountAmount = base * (line.discount / 100);
  const baseAfterDiscount = base - discountAmount;
  const igicAmount = baseAfterDiscount * line.igicRate;
  const lineTotal = baseAfterDiscount + igicAmount;

  return {
    igicAmount: round2(igicAmount),
    lineTotal: round2(lineTotal),
  };
}

export function calculateInvoiceTotals(lines: InvoiceLineFormData[]): InvoiceTotals {
  let subtotal = 0;
  let totalDiscount = 0;
  const igicMap = new Map<number, { base: number; amount: number }>();

  for (const line of lines) {
    const base = line.quantity * line.unitPrice;
    const discountAmount = base * (line.discount / 100);
    const baseAfterDiscount = base - discountAmount;
    const igicAmount = baseAfterDiscount * line.igicRate;

    subtotal += base;
    totalDiscount += discountAmount;

    const existing = igicMap.get(line.igicRate) ?? { base: 0, amount: 0 };
    igicMap.set(line.igicRate, {
      base: existing.base + baseAfterDiscount,
      amount: existing.amount + igicAmount,
    });
  }

  const igicBreakdown: IgicBreakdown[] = Array.from(igicMap.entries())
    .filter(([rate]) => rate > 0)
    .map(([rate, { base, amount }]) => ({
      rate,
      base: round2(base),
      amount: round2(amount),
    }));

  const totalIgic = igicBreakdown.reduce((sum, b) => sum + b.amount, 0);
  const total = subtotal - totalDiscount + totalIgic;

  return {
    subtotal: round2(subtotal),
    totalDiscount: round2(totalDiscount),
    igicBreakdown,
    totalIgic: round2(totalIgic),
    total: round2(total),
  };
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}
