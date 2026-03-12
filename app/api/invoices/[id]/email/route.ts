import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { sendInvoiceEmail } from '@/lib/email-service';

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { customer: true, lines: { orderBy: { lineOrder: 'asc' } } },
  });

  if (!invoice) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });

  const pdfBuffer = generateInvoicePDF(invoice as any);
  const result = await sendInvoiceEmail(invoice as any, pdfBuffer);

  if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });

  await prisma.invoice.update({ where: { id: params.id }, data: { sentAt: new Date() } });
  return NextResponse.json({ success: true });
}
