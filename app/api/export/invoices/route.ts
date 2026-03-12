import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exportInvoicesToExcel } from '@/lib/excel-export';

export async function GET(_: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoices = await prisma.invoice.findMany({
    include: { customer: { select: { id: true, name: true, taxId: true } } },
    orderBy: { issueDate: 'desc' },
  });

  const buffer = exportInvoicesToExcel(invoices as any);

   return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="facturas.xlsx"',
    },
  });
}
