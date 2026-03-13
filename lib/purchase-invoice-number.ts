import { prisma } from './prisma';

export async function generatePurchaseInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'FC';

  const last = await prisma.purchaseInvoice.findFirst({
    where: { number: { startsWith: `${prefix}-${year}-` } },
    orderBy: { number: 'desc' },
    select: { number: true },
  });

  let nextNum = 1;
  if (last) {
    const parts = last.number.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}-${year}-${String(nextNum).padStart(4, '0')}`;
}
