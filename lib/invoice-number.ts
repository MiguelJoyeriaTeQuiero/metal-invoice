import { prisma } from './prisma';
import type { InvoiceType } from '@/types/invoice';

export async function generateInvoiceNumber(type: InvoiceType): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = type === 'STANDARD' ? 'FAC' : 'R';

  const last = await prisma.invoice.findFirst({
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
